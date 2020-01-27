# Logality

> JSON Logger based on [Simple Log Event Schema][log-schema]

[![CircleCI](https://circleci.com/gh/alacrity-law/logality.svg?style=svg)](https://circleci.com/gh/alacrity-law/logality)

![Logality](https://i.imgur.com/xru6Q7O.png)

# Install

Install the module using NPM:

```
npm install logality --save
```

# Why Another Logging Service

With the introduction of microservices aggregating logs from all the various 
services became an ever growing issue. A proven solution to that problem is to
enforce a common logging schema across your organization.

Logality follows the [Simple Log Schema][log-schema] when generating log 
messages.

However, The Simple Log Schema is just a starting point, you are able to extend
it to make it fit your particular needs. What matters, is that your 
organization complies with a single schema for logging and that is why we've 
built logality.

# Documentation

## Quick Start

```js
const Logality = require('logality');

const logality = new Logality();

const log = logality.get();

log.info('Hello World!');
```

## Initial Configuration

Logality requires to be initialized and configured once, then use the instance 
throughout your application. You may configure Logality during instantiation,
find bellow the configuration options:

* `appName` {string} **REQUIRED** An arbitrary string to uniquely identify 
    the service.
* `wstream` {Stream} A writeable stream to output logging, default is stdout.
* `prettyPrint` {boolean} If true will format and prettify the event and 
    context, default is `false`.
* `serializers` {Object} You can define custom serializers or overwrite
    logality's, see more about Serializers bellow.

```js
const Logality = require('logality');

const logality = new Logality({
    appName: 'service-something',
});
```

## The Logging Schema

Logallity automatically calculates and formats a series of system information
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
            "application": "testLogality",
            "file": "/test/spec/surface.test.js"
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

* `severity` **{number}** Message severity expressed in an integer (7 lowest, 
    0 higher), see bellow fow values.
* `level` **{string}** Message severity expressed in a unique string, 
    see bellow fow values.
* `dt` **{string}** An [ISO8601][iso8601] date.
* `message` **{string}** Any message provided to the logger.
* `event` **{Object}** When the log was triggered by an event, the metadata
    of that event are stored here. Logality supports many kinds of events as 
    explained in the Serializers section.
* `context` **{Object}** Context related to the log message.
* `context.runtime.application` **{string}** Name of the service, define this
    when first instantiating the locality service.
* `context.runtime.file` **{string}** The local file used to run the service.
* `context.source.file_name` **{string}** The module where the log originated.
* `context.system.hostname` **{string}** The local system's hostname.
* `context.system.pid` **{string}** The local process id.
* `context.system.process_name` **{string}** The local process name.

## Logging Levels

As per the [Log Schema](log-schema), the logging levels map to those of Syslog
RFC 5424:

|Syslog Level|Level Enum|Description|
|---|---|---|
|0|`emergency`|System is unusable|
|1|`alert`|Action must be taken immediately|
|2|`critical`|Critical conditions|
|3|`error`|Error Conditions|
|4|`warn`|Warning Conditions|
|5|`notice`|Normal, but significant condition|
|6|`info`|Informational messages|
|7|`debug`|Debug-level messages|

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

## Getting a Logger

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
illustrated in ["Logging Levels"](#logging-levels) above.

### Logging Messages

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

You may extend logality with new serializers or you may overwrite the existing
ones.

## Logality Serializers

Serializers are triggered by defined keys in the `context` object, Logality has 
implemented the following serializers out of the box.

### The User Serializer

> Serializes a User Data Object.

```js
// a user logged in
const user = login(username, password);

// Let log the event
log.info('User Logged in', { user: user })
```

#### Expects

* `id` The user's id.
* `email` The user's email.

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

* `name` Name of the error.
* `message` The error's message.

#### Outputs

```JSON
    "event":{ 
        "error":{ 
            "name":"Error",
            "message":"Broke",
            "backtrace":[ 
                { 
                    "file":"/Users/logality/test/spec/error-stack.test.js",
                    "function":"Object.done",
                    "line":"41:13"
                }
            ]
        }
    }
```
* `event.error` **{Object}** When an error occures this is where it is 
logged. The `event.error` Object contains three keys:
* `event.error.name` **{string}** The name of the error.
* `event.error.message` **{string}** The message of the error.
* `event.error.backtrace` **{Array\<Object\>}** An array of trace
    item objects.

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

* `event.http_request` **{Object}** When the request object is passed
    the following additional data are stored:
* `event.http_request.headers` **{Object}** Key-value pairs of all
    the HTTP headers, excluding sensitive headers.
* `event.http_request.host` **{string}** The hostname.
* `event.http_request.method` **{string}** HTTP method used.
* `event.http_request.path` **{string}** The request path.
* `event.http_request.query_string` **{string}** Query string used.
* `event.http_request.scheme` **{string}** One of "http" or "https".

### The Custom Serializer

> Serializes any data that is passed as JSON.

```js
// Custom log
log.info('Something happened', { 
    custom: {
        any: 'value',
    } 
});
```

#### Expects

Anything

#### Outputs

```JSON
    "context": {
        "custom": {
            "any": 'value'
        }
    }
```

## Custom Serializers

You can define your own serializers or overwrite the existing ones when
you first instantiate Logality. There are two parameters when creating a
serializer, the "output path" and the value to store there. The "output path"
refers to the path in the JSON object to store the serialized value.

Those two parameters are expected to be found on the return of the serializers:

* `path` **{string}** Path to save the value, use empty string for root.
* `value` **{*}** Any value to store on that path.

An Example:

```js
const Logality = require('logality');

mySerializers = {
    user: function (user) {
        return {
            path: 'context',
            value: {
                id: user.id,
                email: email.id,
                type: user.type,
            },
        };
    },
    order: function (order) {
        return {
            path: '',
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

# Project Meta

## Releasing

1. Update the changelog bellow.
1. Ensure you are on master.
1. Type: `grunt release`
    * `grunt release:minor` for minor number jump.
    * `grunt release:major` for major number jump.

## Release History

- **v1.1.0**, *05 Jun 2018* :: JSON Log Schema Version: 4.1.0
    - Added `prettyPrint` option, thank you [Marius](https://github.com/balajmarius).
- **v1.0.0**, *21 May 2018* :: JSON Log Schema Version: 4.1.0
    - Big Bang

## Authors

* [Thanasis Polychronakis](https://github.com/thanpolas)

## License

Copyright Alacrity Law Limited. [Licensed under the MIT license](/LICENSE)

[log-schema]: https://github.com/timberio/log-event-json-schema
[iso8601]: https://en.wikipedia.org/wiki/ISO_8601
