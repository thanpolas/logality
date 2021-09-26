# Logality

> Versatile JSON Logger.

[![NPM Version][npm-image]][npm-url]
[![CircleCI][circle-image]][circle-url]
[![codecov](https://codecov.io/gh/thanpolas/univ3prices/branch/main/graph/badge.svg?token=XKLZG037MA)](https://codecov.io/gh/thanpolas/univ3prices)
[![Discord](https://img.shields.io/discord/847075821276758096?label=discord&color=CBE9F0)](https://discord.gg/GkyEqzJWEY)
[![Twitter Follow](https://img.shields.io/twitter/follow/thanpolas.svg?label=thanpolas&style=social)](https://twitter.com/thanpolas)

![Logality](/assets/logality_preview.png)

## Why Logality

-   JSON and Pretty Print log messages.
-   Extend or alter logging schema to fit your needs.
-   Customize built-in serializers by overwriting them to create your
    own logging schema.
-   Middleware support.
-   Allows full manipulation of output.
-   Use in libraries and compose multiple Logality instances on the root
    project.
-   Automatically detects the module filename and path and includes in the log.

[👉 See how Logality compares to other popular loggers.][comparison].

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
    the service (logger instance).
-   `prettyPrint` {boolean|Object} If true will format and prettify the event and
    context, default is `false`. You may define additional options to configure
    pretty printing, they can be combined:
    -   `prettyPrint.noTimestamp` {boolean} Do not print timestamp.
    -   `prettyPrint.noFilename` {boolean} Do not print Log filename source.
    -   `prettyPrint.onlyMessage` {boolean} Only print the log message (no context).
-   `minLevel` {number|string} Define the minimum level to be logged and ignore lower log levels. [See log levels for input values][log-levels], accepts both the string or numeric representations of the levels.
-   `serializers` {Object} You can define custom serializers or overwrite
    logality's. Read more [about Serializers bellow][serializers].
-   `async` {boolean} Set to true to enable the asynchronous API for logging,
    see more bellow. Read more [on the async option bellow][async].
-   `output` {Function(logContext:Object, isPiped:boolean)} Replace the output
    process of logality with a custom one. Read more [on the custom output documentation bellow][output].

```js
const Logality = require('logality');

const logality = Logality({
    appName: 'service-something',
    prettyPrint: false,
    serializers: [(logContext) => {}],
    async: false,
    output: (logMessage) => {
        process.stdout.write(logMessage);
    },
});
```

### Logality Terminology

-   **Message {string}** The text (string) Log message input from the user.
-   **Context {Object}** The Context (or bindings) input from the user.
-   **LogContext {Object}** Log Context (the schema) used internally by logality for
    processing and ultimately output.
-   **LogMessage {String}** The serialized `LogContext` into a string for output.

### Logality Execution Flow

[👉 Click here or on the Flow Chart for Full Resolution](/assets/logality_flow_chart.png).

[![Logality Flow Chart](/assets/logality_flow_chart_preview.png)](/assets/logality_flow_chart.png)

### Logality Can be Asynchronous

When logging has a transactional requirement, such as storing logs to a database or sending through an API, you can
enable asynchronous mode.

When Async is enabled all logs should be prefixed with the `await` keyword.

Both the [middleware defined through `use()`][middleware]
and the [output function if defined][output] will be expected to execute
asynchronously.

To enable the async API all you have to do is set the option `async` to true. All logging methods will now return
a promise for you to handle:

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

### The custom "output" Function

The custom output function will receive two arguments and is the final operation in the [execution flow][logality-flow]. The input arguments are:

-   `logContext` **Object** logContext is a native
    JS Object representing the entire log message.
-   `isPiped` **boolean** This argument indicates if the inbound "logContext" is the output of a piped instance or not (comes from a library).

#### Importance of Return Value for "output"

Depending on what value is returned by your custom output function different actions are performed by Logality.

#### Custom Output: Object Return

This is what you would typically want to always return. When an object is
returned from your custom output function you pass the responsibility of
serializing the Log Context into a string to Logality.

As per the [Logality Flow Diagram][logality-flow], there are a few more steps
that are done after your custom output returns an Object value:

1. Logality checks your `prettyPrint` setting and:
    1. If it's true will format your Log Context into a pretty formatted string
       message.
    2. If it's false will serialize using `JSON.stringify`.
2. Logality will then output that serialized stream by writing to the `process.stdout` stream.

#### Custom Output: String Return

When you return a string, Logality will skip the serialization of your Log
Message and will directly invoke the output by writing to the `process.stdout`
stream.

This technique gives you the freedom to implement your own output format and/or
create your pretty output formats.

#### Custom Output: No Return

When your custom output does not return anything, Logality will assume that you
have handled everything and will not perform any further actions.

In those cases your custom output function is responsible for serializing
the Log Context and outputting it to the medium you see fit (stdout or a
database).

> **ℹ️ Note**: This is the recommended way to apply filters on what messages you want to be logged.

## Logality Instance Methods

### get() :: Getting a Logger

To get a logger you have to invoke the `get()` method. That method will detect and use the module filename that it was invoked from so it is advised that you use the `get()` method in each module to have proper log messages.

```js
const log = logality.get();

log(level, message, context);
```

The `get()` method will return the `log()` method partialed with arguments.
The full argument requirements of `log()`, are:

```js
logality.log(filename, level, message, context);`
```

When using `get()` you will receive the logger function with the `filename` argument already filled out. That is why you don't need to input the `filename` argument when you are using `logality.get()`.

The partialed and returned `log` function will also have level helpers as
illustrated in ["Log Levels"](#log-levels) section.

### Logging Messages

Using any log level function (e.g. `log.info()`), your first argument is the "message". This is any arbitrary string to describe what has happened. It is the second argument, "context" that you will need to put any and all data you also want to attach with the logging message.

```js
log.info(message, context);
```

The `context` argument is an object literal, parsed by what are called "Serializers". Serializers
will take your data as input and format them in an appropriate, logging schema
compliant output.

You may extend logality with new [serializers][serializers] or you may
overwrite the existing ones.

### pipe() :: Compose Multiple Logality Instances

Use `pipe()` to link multiple logality instances to the root instance:

```js
const Logality = require('logality');

const parentLogality = Logality();
const childLogality = Logality();

parentLogality.pipe(childLogality);
```

What this does is pipe all the output of the piped (child) logality instances to the "parent" Logality. This is particularly useful if a library is using Logality and you want to pipe its output or you want to have multiple classes of log streams (i.e. for audit logging purposes).

-   `pipe()` Accepts a single Logality instance or an Array of Logality instances.

> **ℹ️ Note**: The LogContext of the child instance, will go through all the middleware and custom output functions defined in the parent instance.

> **ℹ️ Note**: This is the case when the second argument `isPiped` will have a `true` value.

### use() :: Add Middleware.

You can add multiple Middleware that will be invoked after all the [serializers][serializers] are applied (built-in and custom defined) and before the "Write to output" method is called.

The middleware will receive the "Log Message" as a native Javascript Object and you can mutate or process it.

All middleware with `use()` are synchronous. To support async middleware you have to enable the [`async` mode][async] when instantiating.

#### use() Synchronous Example

```js
const Logality = require('logality');

const logality = Logality();

logality.use((context) => {
    delete context.user;
});
```

#### use() Asynchronous Example

```js
const Logality = require('logality');

const logality = Logality({
    async: true,
});

logality.use(async (context) => {
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

A native JS Error Object, or similar:

-   `name` **{string}** Name of the error.
-   `message` **{string}** The error's message.
-   `stack` **{string}** The stack trace. Logality will automatically parse the stack trace to a JSON object.

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

-   `event.http_request` **{Object}** When the request object is passed the following additional data are stored:
-   `event.http_request.headers` **{Object}** Key-value pairs of all the HTTP headers, excluding sensitive headers.
-   `event.http_request.host` **{string}** The hostname.
-   `event.http_request.method` **{string}** HTTP method used.
-   `event.http_request.path` **{string}** The request path.
-   `event.http_request.query_string` **{string}** Quer string used.
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

You can define your own serializers or overwrite the existing ones when you first instantiate Logality. There are three parameters when creating a serializer:

-   **Context Name** The name on your `context` object that will trigger the serializer.
-   **Output Path** The path in the JSON output where you want the serializer's value to be stored. Use dot notation to signify the exact path.
-   **Value** The serialized value to output on the log message.

The _Context Name_ is the key on which you define your serializer. So for instance when you set a serializer on the user key like so `mySerializers.user = userSerializer` the keyword `user` will be used.

Output Path and Value are the output of your serializer function and are
expected as separate keys in the object you must return:

-   `path` **{string}** Path to save the value, use dot notation.
-   `value` **{\*}** Any value to store on that path.

An Example:

```js
const Logality = require('logality');

mySerializers = {
    user: function (user) {
        return {
            path: 'context.user',
            value: {
                id: user.id,
                email: email.id,
                type: user.type,
            },
        };
    },
    order: function (order) {
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
    user: function (user) {
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
logger.init = function (bootOpts = {}) {
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

> **ℹ️ Note**: You can view a real-world example of Logality being used in production [in this Discord Bot Project](https://github1s.com/skgtech/skgbot/blob/HEAD/app/services/log.service.js).

## How Logality Compares to Other Loggers

Comparison table as of 16th of April 2021.

|                    | Logality | [Winston][winston] | [Bunyan][bunyan] | [Pino][pino] |
| ------------------ | -------- | ------------------ | ---------------- | ------------ |
| JSON Output        | ✅       | ✅                 | ✅               | ✅           |
| Pretty Print       | ✅       | ✅                 | ❌               | ✅           |
| Custom Log Levels  | ❌       | ✅                 | ✅               | ✅           |
| Serializers        | ✅       | ❌                 | ✅               | ✅           |
| Middleware         | ✅       | ✅                 | ❌               | ✅           |
| Mutate JSON Schema | ✅       | ✅                 | ❌               | ❌           |
| Output Destination | ✅       | ✅                 | ✅               | ✅           |
| Mutate Output      | ✅       | ✅                 | ❌               | ❌           |
| Async Operation    | ✅       | ❌                 | ❌               | ❌           |
| Filename Detection | ✅       | ❌                 | ❌               | ❌           |
| Speed Optimised    | ❌       | ❌                 | ❌               | ✅           |
| Used in Libraries  | ✅       | ❌                 | ❌               | ❌           |

# Project Meta

## Releasing

1. Update the changelog bellow ("Release History").
1. Ensure you are on master and your repository is clean.
1. Type: `npm run release` for patch version jump.
    - `npm run release:minor` for minor version jump.
    - `npm run release:major` for major major jump.

## Release History

-   **v3.0.4**, _31 May 2021_
    -   Updated all dependencies to latest.
    -   Tweaked eslint and prettier configurations.
-   **v3.0.3**, _16 Apr 2021_
    -   Updated all dependencies to latest.
    -   Tweaked, fixed and updated README, added comparison chart with popular loggers.
-   **v3.0.2**, _30 Oct 2020_
    -   Updated all dependencies to latest.
-   **v3.0.1**, _03 Jul 2020_
    -   Updated all dependencies to latest.
-   **v3.0.0**, _04 Apr 2020_
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
[async]: #about-asynchronous-logging
[logality-flow]: #logality-execution-flow
[middleware]: #use--add-middleware
[output]: #the-custom-output-function
[pipe]: #pipe--compose-multiple-logality-instances
[comparison]: #how-logality-compares-to-other-loggers
[winston]: https://github.com/winstonjs/winston
[bunyan]: https://github.com/trentm/node-bunyan
[pino]: https://github.com/pinojs/pino
[log-levels]: #log-levels
