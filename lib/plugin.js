var tsm = require('teamcity-service-messages');
var getTestName = require('./utils').getTestName;

/**
 *
 * @param gemini
 * @param options
 */
module.exports = function(gemini, options) {
    gemini.on('startRunner', function(runner) {
        runner.on('beginState', function(data) {
            tsm.testStarted({ name: getTestName(data), flowId: data.sessionId });
        });

        runner.on('skipState', function(data) {
            tsm.testIgnored({ name: getTestName(data), flowId: data.sessionId });
        });

        runner.on('err', function(data) {
            var testName = getTestName(data);

            tsm.testFailed({ name: testName, message: data.message, details: data.stack, flowId: data.sessionId });
            tsm.testFinished({ name: testName, flowId: data.sessionId });
        });

        runner.on('endTest', function(data) {
            var testName = getTestName(data);

            if(data.equal !== true) {
                tsm.testFailed({ name: testName, flowId: data.sessionId });
            }

            tsm.testFinished({ name: testName, flowId: data.sessionId });
        });
    });
};
