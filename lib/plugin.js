var tsm = require('teamcity-service-messages');
var getTestName = require('./utils').getTestName;
var _ = require('lodash');

/**
 *
 * @param gemini
 * @param options
 */
module.exports = function(gemini, options) {
    var finishedTests = [];

    gemini.on('startRunner', function(runner) {
        runner.on('beginState', function(data) {
            tsm.testStarted({ name: getTestName(data), flowId: data.sessionId });
        });

        runner.on('skipState', function(data) {
            var testName = getTestName(data);
            tsm.testIgnored({ name: testName, flowId: data.sessionId });
            finishedTests.push(testName);
        });

        runner.on('testResult', function(data) {
            var testName = getTestName(data);

            if(data.equal !== true) {
                tsm.testFailed({ name: testName, flowId: data.sessionId });
            }

            tsm.testFinished({ name: testName, flowId: data.sessionId });
            finishedTests.push(testName);
        });

        runner.on('err', function(data) {
            if (data.state) {
                failTest_(data);
            } else {
                failAllSuiteTests_(data);
            }

            function failTest_(data, testName) {
                testName = testName || getTestName(data);

                tsm.testFailed({ name: testName, message: data.message, details: data.stack, flowId: data.sessionId });
                tsm.testFinished({ name: testName, flowId: data.sessionId });
            }

            function failAllSuiteTests_(data) {
                data.suite.states.forEach(function(state) {
                    var testName = getTestName(data, state);
                    if (!_.includes(finishedTests, testName)) {
                        failTest_(data, testName);
                    }
                });
            }
        });
    });
};
