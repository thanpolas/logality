# Logality

> JSON Logger based on [Simple Log Event Schema][log-schema]

[![CircleCI](https://circleci.com/gh/alacrity-law/logality.svg?style=svg)](https://circleci.com/gh/alacrity-law/logality)

## Install

Install the module using NPM:

```
npm install logality --save
```

## Documentation

With the introduction of microservices aggregating logs from all the various 
services became an ever growing issue. A simple solution to that problem is to
enforce a common logging schema across your organization. 
The [Simple Log Schema][log-schema] is, today, the most commonly accepted 
Logging schema and Logality is the Node.js, vendor agnostic, implementation of 
that Schema.

### Quick Start

```js
const Logality = require('logality');

const logality = new Logality();

const log = logality.get();

log.info('Hello World!');
```

### Initial Configuration

Logality requires to be initialized and configured once, then use the instance 
throughout your application. During instantiation you may configure Logality,
find bellow the configuration options:

* `appName` {string} An arbitrary string to uniquely identify the service.
* `wstream` {Stream} A writeable stream to output logging, default is stdout.
* `serializers` {Object} You can define custom serializers for the various data
objects as defined in the Log Schema:
    * `serializers.user` {Function} Define a custom user serializer.

```js
const Logality = require('logality');

const logality = new Logality({
    appName: 'service-something',
});
```

#### User Serializer

Your User Data Object (UDO) can be of any schema, however [Log Schema][log-schema]
has a strict definition of how to log a UDO, to transform the data from one
schema to another we use the "user serializer", this is a simple function that
accepts an Object, the UDO and returns an Object, properly formated as per 
the Log Schema.


```js
const locality = new Logality({
    serializers: {
        user: function (udo) {
            return {
                id: udo.userId,
                email: udo.email,
            };
        },
    },
})
```

> **BEWARE** Using custom serializers makes **you** responsible for retaining the
Log Schema integrity.

### Logging Levels

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

### Getting a Logger

To get a logger you have to invoke the `get()` method. That method will detect
and use the module filename that it was invoked from so it is strongly advised
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
all data you also
want to attach with the logging message. However, there are strict rules
as to where and how you store your data objects depending on what they are.

```js
log.info(message, context);
```

Context accepts the following keys:

* `user` Pass the viewer's User Data Object in this key.
* `error` Pass the whole Javascript Error Object in this key.
* `req` Pass Express.js Request object in this key.
* `custom` Any other, arbitrary data, needs to be stored under this key.

> Context accepted keys is a work in progress to fully implement the 
[Log Schema][log-schema], if there is a logging property available in the 
schema but not in this Library feel free to open an issue requesting it
or even better submit your own PR.

Logality will process and output as per the Log Schema spec all the provided
data objects.

## Releasing

1. Update the changelog bellow.
1. Ensure you are on master.
1. Type: `grunt release`
    * `grunt release:minor` for minor number jump.
    * `grunt release:major` for major number jump.

## Release History

- **v1.0.0**, *21 May 2018* :: JSON Log Schema Version: 4.1.0
    - Big Bang

## Authors

* [Thanasis Polychronakis](https://github.com/thanpolas)

## License

Copyright Alacrity Law Limited. [Licensed under the MIT license](/LICENSE)

[log-schema]: https://github.com/timberio/log-event-json-schema
