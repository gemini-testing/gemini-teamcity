var EventEmitter = require('events').EventEmitter;

var sinon = require('sinon');
var assert = require('chai').assert;
var tsm = require('teamcity-service-messages');
var _ = require('lodash');

var plugin = require('../lib/plugin');

sinon.assert.expose(assert, {prefix: ''});

describe('gemini-teamcity', function() {
    var sandbox = sinon.sandbox.create(),
        gemini, runner;

    function stubEventData_(opts) {
        return _.defaults(opts || {}, {
            suite: {
                fullName: 'Suite full name'
            },
            state: {
                name: 'State name'
            },
            browserId: 'Firefox',
            sessionId: 'sessionId',
            equal: true
        });
    }

    beforeEach(function() {
        gemini = new EventEmitter();
        runner = new EventEmitter();

        plugin(gemini);
        gemini.emit('startRunner', runner);

        sandbox.stub(tsm);
    });

    afterEach(function() {
        sandbox.restore();
    });

    function testArgs_(event, handleMethod, specificData) {
        specificData = specificData || {};

        it('should call "' + event + '" with proper full test name', function() {
            var data = _.extend({
                    browserId: 'some-browser',
                    state: {name: 'some-state'},
                    suite: {fullName: 'some suite'}
                }, specificData);

            runner.emit(event, stubEventData_(data));

            assert.calledOnce(tsm[handleMethod]);
            assert.calledWithMatch(tsm[handleMethod], {
                name: 'some_suite.some-state.some-browser'
            });
        });

        it('should use sessionId as flowId', function() {
            var data = _.extend({
                    sessionId: 'some-session-id'
                }, specificData);

            runner.emit(event, stubEventData_(data));

            assert.calledWithMatch(tsm[handleMethod], {
                flowId: 'some-session-id'
            });
        });
    }

    describe('on beginState', function() {
        testArgs_('beginState', 'testStarted');
    });

    describe('on skipState', function() {
        testArgs_('skipState', 'testIgnored');
    });

    describe('on endTest', function() {
        testArgs_('endTest', 'testFinished');

        describe('Test is failed', function() {
            testArgs_('endTest', 'testFailed', {equal: false});
        });
    });

    describe('on error', function() {
        it('should call "testFailed" with stack and message', function() {
            runner.emit('err', stubEventData_({
                stack: 'error stack',
                message: 'error message'
            }));

            assert.calledOnce(tsm.testFailed);
            assert.calledWithMatch(tsm.testFailed, {
                details: 'error stack',
                message: 'error message'
            });
        });

        it('should call "testFinished"', function() {
            runner.emit('err', stubEventData_({
                stack: 'error stack',
                message: 'error message'
            }));

            assert.calledOnce(tsm.testFinished);
        });
    });
});
