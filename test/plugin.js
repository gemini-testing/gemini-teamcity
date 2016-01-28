var EventEmitter = require('events').EventEmitter;

var sinon = require('sinon');
var assert = require('chai').assert;
var tsm = require('teamcity-service-messages');

var plugin = require('../lib/plugin');

describe('gemini-teamcity', function() {
    var gemini, runner, data, messageName;

    beforeEach(function() {
        gemini = new EventEmitter();
        runner = new EventEmitter();

        data = {
            suite: {
                fullName: 'Suite full name'
            },
            state: {
                name: 'State name'
            },
            browserId: 'Firefox',
            sessionId: 'sessionId'
        };

        messageName = {
            name: 'Suite_full_name.State_name.Firefox',
            flowId: 'sessionId'
        };

        plugin(gemini);
        gemini.emit('startRunner', runner);
    });

    describe('on beginState', function() {
        beforeEach(function() {
            sinon.stub(tsm, 'testStarted');
            runner.emit('beginState', data);
        });

        afterEach(function() {
            tsm.testStarted.restore();
        });

        it('should call "testStarted" with proper args', function() {
            assert.isTrue(tsm.testStarted.called);
            assert.isTrue(tsm.testStarted.withArgs(messageName).called);
        });
    });

    describe('on skipState', function() {
        beforeEach(function() {
            sinon.stub(tsm, 'testIgnored');
            runner.emit('skipState', data);
        });

        afterEach(function() {
            tsm.testIgnored.restore();
        });

        it('should call "testIgnored" with proper args', function() {
            assert.isTrue(tsm.testIgnored.called);
            assert.isTrue(tsm.testIgnored.withArgs(messageName).called);
        });
    });

    describe('on error', function() {
        beforeEach(function() {
            data.stack = 'error stack';
            data.message = 'error message';
            sinon.stub(tsm, 'testFailed');
            sinon.stub(tsm, 'testFinished');
            runner.emit('err', data);
        });

        afterEach(function() {
            tsm.testFailed.restore();
            tsm.testFinished.restore();
        });

        it('should call "testFailed"', function() {
            messageName.details = 'error stack';
            messageName.message = 'error message';
            assert.isTrue(tsm.testFailed.called);
            assert.isTrue(tsm.testFailed.withArgs(messageName).called);
        });

        it('should call "testFinished" with proper args', function() {
            assert.isTrue(tsm.testFinished.called);
            assert.isTrue(tsm.testFinished.withArgs(messageName).called);
        });
    });

    describe('on endTest', function() {
        beforeEach(function() {
            data.equal = true;
            sinon.stub(tsm, 'testFinished');
            runner.emit('endTest', data);
        });

        afterEach(function() {
            tsm.testFinished.restore();
        });

        it('should call "testFinished" with proper args', function() {
            assert.isTrue(tsm.testFinished.called);
            assert.isTrue(tsm.testFinished.withArgs(messageName).called);
        });

        describe('Test is failed', function() {
            beforeEach(function() {
                data.equal = false;
                sinon.stub(tsm, 'testFailed');
                runner.emit('endTest', data);
            });

            afterEach(function() {
                tsm.testFailed.restore();
            });

            it('should call "testFailed" with proper args', function() {
                assert.isTrue(tsm.testFailed.called);
                assert.isTrue(tsm.testFailed.withArgs(messageName).called);
            });
        });
    });
});
