/**
 * @fileoverview Samples of JSON logs.
 */

exports.infoLogJsonFix =
  '{"level":"info","severity":6,"dt":"2018-05-18T16:25:57.815Z","message":"hello pretty world","context":{"runtime":{"application":"testLogality"},"source":{"file_name":"/test/spec/writepretty.test.js"},"system":{"hostname":"localhost","pid":36255,"process_name":"node ."}},"event":{}}';
exports.infoLogFix = () => JSON.parse(exports.infoLogJsonFix);

exports.errorLogJsonFix =
  '{"level":"error","severity":3,"dt":"2018-05-18T16:25:57.815Z","message":"Error log","context":{"runtime":{"application":"testLogality"},"source":{"file_name":"/test/spec/writepretty.test.js"},"system":{"hostname":"localhost","pid":36255,"process_name":"node ."}},"event":{"error":{"name":"Error","message":"an error occured","backtrace":"Error: an error occured\\n    at Object.<anonymous> (/Users/thanpolas/Projects/libs/logality/test/spec/writepretty.test.js:23:17)\\n    at Promise.then.completed (/Users/thanpolas/.nvm/versions/node/v16.15.0/lib/node_modules/jest/node_modules/jest-circus/build/utils.js:333:28)\\n    at new Promise (<anonymous>)\\n    at callAsyncCircusFn (/Users/thanpolas/.nvm/versions/node/v16.15.0/lib/node_modules/jest/node_modules/jest-circus/build/utils.js:259:10)\\n    at _callCircusTest (/Users/thanpolas/.nvm/versions/node/v16.15.0/lib/node_modules/jest/node_modules/jest-circus/build/run.js:276:40)\\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\\n    at _runTest (/Users/thanpolas/.nvm/versions/node/v16.15.0/lib/node_modules/jest/node_modules/jest-circus/build/run.js:208:3)\\n    at _runTestsForDescribeBlock (/Users/thanpolas/.nvm/versions/node/v16.15.0/lib/node_modules/jest/node_modules/jest-circus/build/run.js:96:9)\\n    at _runTestsForDescribeBlock (/Users/thanpolas/.nvm/versions/node/v16.15.0/lib/node_modules/jest/node_modules/jest-circus/build/run.js:90:9)\\n    at run (/Users/thanpolas/.nvm/versions/node/v16.15.0/lib/node_modules/jest/node_modules/jest-circus/build/run.js:31:3)"}}}';
exports.errorLogFix = () => JSON.parse(exports.errorLogJsonFix);
