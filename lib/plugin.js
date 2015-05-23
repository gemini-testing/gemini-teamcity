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
            tsm.testStarted({ name: getTestName(data) });
        });

        runner.on('skipState', function(data) {
            tsm.testIgnored({ name: getTestName(data) });
        });

        runner.on('error', function(errorData) {
            var testName = getTestName(errorData);

            tsm.testFailed({ name: testName, message: errorData.message, details: errorData.stack });
            tsm.testFinished({ name: testName });
        });

        runner.on('endTest', function(data) {
            var testName = getTestName(data);

            if(data.equal !== true) {
                tsm.testFailed({ name: testName });
            }

            tsm.testFinished({ name: testName });
        });
    });
};
