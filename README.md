# Logality

> Extensible JSON Logger.

[![NPM Version][npm-image]][npm-url]
[![CircleCI][circle-image]][circle-url]

![Logality](/assets/logality_preview.png)

## Why Logality

-   JSON log messages with a strict schema.
-   Extend the logging schema to fit your needs.
-   Customize built-in serializers by overwriting them to create your
    own logging schema.
-   Use at libraries and compose multiple Logality instances on the root
    project.
-   Automatically detects the module filename and path and includes in the log.
-   Schema based on the [Simple Log Schema][log-schema].

# Install

Install the module using NPM:

```
npm install logality --save
```

# Documentation

## Quick Start

```js
const Logality = require('logality');

const logality = Logality();

const log = logality.get();

log.info('Hello World!');
```

## Initial Configuration

Logality requires to be initialized and configured once,
then use the instance throughout your application.

You can configure Logality during instantiation, here are the available
configuration options:

-   `appName` {string} An arbitrary string to uniquely identify
    the service.
-   `prettyPrint` {boolean} If true will format and prettify the event and
    context, default is `false`.
-   `serializers` {Object} You can define custom serializers or overwrite
    logality's, see more about Serializers bellow.
-   `async` {boolean} Set to true to enable the asynchronous API for logging,
    see more bellow.
-   `output` {Function(String:LogMessage)} Replace the output process of
    logality with a custom one. By default Logality writes to the
    `process.stdout` writeable stream.
-   `objectMode` {boolean} Set to true to have logality pass the LogContext
    as a native Javascript Object to the `output` function, see more bellow.

```js
const Logality = require('logality');

const logality = Logality({
    appName: 'service-something',
    prettyPrint: false,
    serializers: [logContext => {}],
    async: false,
    output: logMessage => {
        process.stdout.write(logMessage);
    },
    objectMode: false,
});
```

### Logality Terminology and Execution Flow

-   **Message {string}** The Log message input from the user.
-   **Context {Object}** The Context input from the user.
-   **LogContext {Object}** Log Context used internally by logality for
    processing and ultimately output.
-   **LogMessage {String}** The serialized `LogContext` into a string for output.

![Logality Flow Chart](/assets/logality_flow_chart.png)

### About Asynchronous Logging

When logging has a transactional requirement, such as audit logs, you can
enable asynchronous mode.

When Async is enabled both the [middleware defined through `use()`][middleware]
and the [output function if defined][output] will be expected to execute
asynchronously.

use an asynchronous writable stream that performs any type of I/O
(database writes, queue pushing, etc). To enable the async API all you have to
do is set the option `async` to true. All logging methods will now return
a promise for you to handle.

```js
const Logality = require('logality');

const logality = Logality({
    appName: 'service-audit',
    async: true,
});

/** ... */

async function createUser (userData) => {
    await log.info('New user creation', {
        userData,
    });
}
```

### The "objectMode"

Enabling objectMode will force Logality to not JSON serialize the log payload
and thus pass to the writable stream the logging context as a native Javascript
Object.

**Important!** When `objectMode` is enabled, it is expected that `output` is
also defined, if it isn't an error will be thrown to protect you from a bogus
configuration.

### The "output"

The output function will receive a single argument and is the final operation
in the [execution flow][logality-flow]. The input argument will be of type:

-   **Object** When `objectMode` is enabled and will be the entire LogContext
    native javascript object.
-   **String** When `objectMode` is not enabled and will be the output of the
    built-in LogContext serializers, which can be one of:
    -   **JSON Serialized** A plain `JSON.stringify()` invocation on the
        LogContext when `prettyPrint` is not enabled.
    -   **Formatted String** when `prettyPrint` is enabled.

## Logality Instance Methods

### get() :: Getting a Logger

To get a logger you have to invoke the `get()` method. That method will detect
and use the module filename that it was invoked from so it is advised
that you use the `get()` method only once per module to have proper log
messages.

The `get()` method will return the `log()` method partialed with arguments.
The full argument requirements of `log()`, are:

```js
logality.log(filename, level, message, context);`
```

With using `get()` you will get the same logger function but with the
`filename` argument already filled out, so the partialed logger argument
requirements are:

```js
const log = logality.get();

log(level, message, context);
```

The partialed and returned `log` function will also have level helpers as
illustrated in ["Log Levels"](#log-levels) section.

#### Logging Messages

Using the level functions (e.g. `log.info()`) your first argument is the
"message" which is any arbitrary string to describe what has happened.
It is the second argument, "context" that you will need to put any and
all data you also want to attach with the logging message.

```js
log.info(message, context);
```

The `context` argument is parsed by what are called "Serializers". Serializers
will take your data as input and format them in an appropriate, logging schema
compliant output.

You may extend logality with new [serializers][serializers] or you may
overwrite the existing ones.

### pipe() :: Compose Multiple Logality Instances

Use `pipe()` to link multiple logality instances to the root instance:

```js
const Logality = require('logality');

const rootLogality = Logality();
const childLogality = Logality();

rootLogality.pipe(childLogality);
```

What this does is pipe all output of the piped (child) logality instances to
go through the root Logality. This is particularly useful if a library is
using Logality and you want to pipe its output.

-   `pipe()` Accepts a single Logality instance or an Array of Logality instances.

### use() :: Add Middleware.

You can add Middleware that will be invoked after all the
[serializers][serializers] are applied (built-in and custom defined) and before
the "Write to output" method is called.

The middleware will receive the "Log Message" as a native Javascript Object and
you can mutate or process it.

All middleware with `use()` are synchronous. To support async middleware you
have to enable the [`async` mode][async] when instantiating.

#### use() Synchronous Example

```js
const Logality = require('logality');

const logality = Logality();

logality.use(context => {
    delete context.user;
});
```

#### use() Asynchronous Example

```js
const Logality = require('logality');

const logality = Logality({
    async: true,
});

logality.use(async context => {
    await db.write(context);
});
```

## The Logging Schema

Logality automatically calculates and formats a series of system information
which is then included in the output. When you log using:

```js
log.info('Hello World!');
```

Logality, when on production, will output the following (expanded) JSON string:

```JSON
{
    "severity": 6,
    "level": "info",
    "dt": "2018-05-18T16:25:57.815Z",
    "message": "hello world",
    "event": {},
    "context": {
        "runtime": {
            "application": "testLogality"
        },
        "source": {
          "file_name": "/test/spec/surface.test.js"
        },
        "system": {
            "hostname": "localhost",
            "pid": 36255,
            "process_name": "node ."
        }
    }
}
```

-   `severity` **{number}** Message severity expressed in an integer (7 lowest,
    0 higher), see bellow fow values.
-   `level` **{string}** Message severity expressed in a unique string,
    see bellow fow values.
-   `dt` **{string}** An [ISO8601][iso8601] date.
-   `message` **{string}** Any message provided to the logger.
-   `event` **{Object}** When the log was triggered by an event, the metadata
    of that event are stored here. Logality supports many kinds of events as
    explained in the Serializers section.
-   `context` **{Object}** Context related to the log message.
-   `context.runtime.application` **{string}** Name of the service, define this
    when first instantiating the locality service.
-   `context.source.file_name` **{string}** The module where the log originated.
-   `context.system.hostname` **{string}** The local system's hostname.
-   `context.system.pid` **{string}** The local process id.
-   `context.system.process_name` **{string}** The local process name.

## Log Levels

As per the [Log Schema](log-schema), the logging levels map to those of Syslog
RFC 5424:

| Syslog Level | Level Enum  | Description                       |
| ------------ | ----------- | --------------------------------- |
| 0            | `emergency` | System is unusable                |
| 1            | `alert`     | Action must be taken immediately  |
| 2            | `critical`  | Critical conditions               |
| 3            | `error`     | Error Conditions                  |
| 4            | `warn`      | Warning Conditions                |
| 5            | `notice`    | Normal, but significant condition |
| 6            | `info`      | Informational messages            |
| 7            | `debug`     | Debug-level messages              |

Each one of the "Level Enum" values is an available function at the logger that is returned using the `get()` method:

```js
const Logality = require('logality');
const logality = new Logality();
const log = logality.get();

log.debug('This is message of level: Debug');
log.info('This is message of level: Info');
log.notice('This is message of level: Notice');
log.warn('This is message of level: warning');
log.error('This is message of level: Error');
log.critical('This is message of level: Critical');
log.alert('This is message of level: Alert');
log.emergency('This is message of level: Emergency');
```

## Logality Serializers

Serializers are triggered by defined keys in the `context` object.
Every serializer is configured to listen to a specific context key, for example
the user serializer expects the `user` key in the context:

```js
log.info('User Logged in', {
    user: udo,
});
```

If no serializer is configured for the `user` property, the data will be
ignored. Logality has implemented the following serializers out of the box:

### The User Serializer

> Serializes a User Data Object.

```js
// a user logged in
const user = login(username, password);

// Let log the event
log.info('User Logged in', { user: user });
```

#### Expects

-   `id` The user's id.
-   `email` The user's email.

#### Outputs

```JSON
    "context": {
        "user": {
            "id": 10,
            "email": "one@go.com",
        }
    }
```

### The Error Serializer

> Serializes a Javascript Error Object or an Exception.

```js
const err = new Error('Broke');

log.error('Something broke', { error: err });
```

#### Expects

-   `name` Name of the error.
-   `message` The error's message.

#### Outputs

```JSON
    "event":{
        "error":{
            "name":"Error",
            "message":"Broke",
            "backtrace": "Stack Trace...",
        }
    }
```

-   `event.error` **{Object}** When an error occures this is where it is
    logged. The `event.error` Object contains three keys:
-   `event.error.name` **{string}** The name of the error.
-   `event.error.message` **{string}** The message of the error.
-   `event.error.backtrace` **{string}** The stack trace.

### The Request Serializer

> Serializes an Express.JS Request Object.

```js
function index(req, res) {
    log.info('Index Request', { req: req });
}
```

#### Expects

Express JS Request Object.

#### Outputs

```JSON
    "event":{
        "http_request": {
            "headers": {},
            "host": "localhost",
            "method": "GET",
            "path": "/",
            "query_string": "",
            "scheme": "http"
        }
    }
```

-   `event.http_request` **{Object}** When the request object is passed
    the following additional data are stored:
-   `event.http_request.headers` **{Object}** Key-value pairs of all
    the HTTP headers, excluding sensitive headers.
-   `event.http_request.host` **{string}** The hostname.
-   `event.http_request.method` **{string}** HTTP method used.
-   `event.http_request.path` **{string}** The request path.
-   `event.http_request.query_string` **{string}** Query string used.
-   `event.http_request.scheme` **{string}** One of "http" or "https".

### The Custom Serializer

> Serializes any data that is passed as JSON.

```js
// Custom log
log.info('Something happened', {
    custom: {
        any: 'value',
    },
});
```

#### Expects

Anything

#### Outputs

```JSON
    "context": {
        "custom": {
            "any": "value"
        }
    }
```

## Custom Serializers

You can define your own serializers or overwrite the existing ones when
you first instantiate Logality. There are three parameters when creating a
serializer:

-   **Context Name** The name on your `context` object that will trigger the
    serializer.
-   **Output Path** The path in the JSON output where you want the serializer's
    value to be stored. Use dot notation to signify the exact path.
-   **Value** The serialized value to output on the log message.

The _Context Name_ is the key on which you define your serializer. So for
instance when you set a serializer on the user key like so
`mySerializers.user = userSerializer` the keyword `user` will be used.

Output Path and Value are the output of your serializer function and are
expected as separate keys in the object you must return:

-   `path` **{string}** Path to save the value, use dot notation.
-   `value` **{\*}** Any value to store on that path.

An Example:

```js
const Logality = require('logality');

mySerializers = {
    user: function(user) {
        return {
            path: 'context.user',
            value: {
                id: user.id,
                email: email.id,
                type: user.type,
            },
        };
    },
    order: function(order) {
        return {
            path: 'context.order',
            value: {
                order_id: order.id,
                sku_id: order.sku,
                total_price: order.item_price * order.quantity,
                quantity: order.quantity,
            },
        };
    },
};

const logality = new Logality({
    appName: 'service-something',
    serializers: mySerializers,
});
```

### Multi Key Custom Serializers

In some cases you may need to write to more than one keys in the log context.
To be able to do that, simply return an Array instead of an Object like so:

```js
const Logality = require('logality');

mySerializers = {
    user: function(user) {
        return [
            {
                path: 'context.user',
                value: {
                    id: user.id,
                    email: email.id,
                    type: user.type,
                },
            },
            {
                path: 'context.request',
                value: {
                    user_id: user.id,
                },
            },
        ];
    },
};

const logality = new Logality({
    appName: 'service-something',
    serializers: mySerializers,
});
```

## Example of How To Initialize Logality on Your Project

### /app/services/logger.service.js

This is the initializing module. During your application bootstrap and before
you anything else, you need to require this module and invoke the `init()`
function to initialize logality.

```js
const Logality = require('logality');

const logger = (module.exports = {});

// Will store the logality reference.
logger.logality = null;

/**
 * Initialize the logging service.
 *
 * @param {Object} bootOpts boot options. This module will check for:
 * @param {string=} bootOpts.appName Set a custom appname for the logger.
 * @param {WriteStream|null} bootOpts.wstream Optionally define a custom
 *   writable stream.
 */
logger.init = function(bootOpts = {}) {
    // check if already initialized.
    if (logger.logality) {
        return;
    }

    const appName = bootOpts.appName || 'app-name';

    logger.logality = new Logality({
        prettyPrint: process.env.ENV !== 'production',
        appName,
        wstream: bootOpts.wstream,
    });

    // Create the get method
    logger.get = logger.logality.get.bind(logger.logality);
};
```

### /app/model/user.model.js

Then, in any module you want to log something you fetch the logality instance
from your logger service.

```js
const log = require('../services/log.service').get();

/* ... */

function register (userData) => {
    log.info('New user registration', {
        userData
    });
}

```

# Project Meta

## Releasing

1. Update the changelog bellow ("Release History").
1. Ensure you are on master and your repository is clean.
1. Type: `npm run release` for patch version jump.
    - `npm run release:minor` for minor version jump.
    - `npm run release:major` for major major jump.

## Release History

-   **v3.0.0**, _TBD_
    -   Introduced [middleware][middleware] for pre-processing log messages.
    -   Introduced the [pipe()][pipe] method to link multiple Logality
        instances together, enables using logality in dependencies and libraries.
    -   **Breaking Change** Replaced "wstream" with ["output"][output] to
        customize logality's output.
-   **v2.1.2**, _24 Feb 2020_
    -   Removed http serializer when pretty print is enabled.
    -   Replaced aged grunt with "release-it" for automated releasing.
-   **v2.1.1**, _19 Feb 2020_
    -   Added the "objectMode" configuration.
    -   Implemented multi-key serializers feature.
    -   Fixed async logging issues and tests.
-   **v2.1.0**, _18 Feb 2020_
    -   Added Async feature.
-   **v2.0.1**, _18 Feb 2020_
    -   Fixed issue with null http headers on sanitizer helper.
-   **v2.0.0**, _29 Jan 2020_ :: Extensible Serializers
    -   Enables new serializers and allows over-writing the built-in ones.
    -   Backwards compatible.
-   **v1.1.0**, _05 Jun 2018_ :: JSON Log Schema Version: 4.1.0
    -   Added `prettyPrint` option, thank you [Marius](https://github.com/balajmarius).
-   **v1.0.0**, _21 May 2018_ :: JSON Log Schema Version: 4.1.0
    -   Big Bang

## License

Copyright Thanasis Polychronakis [Licensed under the ISC license](/LICENSE)

[log-schema]: https://github.com/timberio/log-event-json-schema
[iso8601]: https://en.wikipedia.org/wiki/ISO_8601
[npm-image]: https://img.shields.io/npm/v/logality.svg
[npm-url]: https://npmjs.org/package/logality
[circle-image]: https://img.shields.io/circleci/build/gh/thanpolas/logality/master?label=Tests
[circle-url]: https://circleci.com/gh/thanpolas/logality
[stream-docs]: https://nodejs.org/api/stream.html#stream_object_mode
[serializers]: #logality-serializers
[async]: #about_asynchronous_logging
[logality-flow]: #logality_terminology_and_execution_flow
[middleware]: #use_add_middleware
[output]: #the_output
[pipe]: #pipe_compose_multiple_logality_instances
