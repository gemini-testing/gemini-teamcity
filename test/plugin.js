var sinon = require('sinon');
var mockery = require('mockery');
var assert = require('chai').assert;
var expect = require('chai').expect;

describe('gemini-teamcity', function() {
  var plugin,
      _console,
      gemini;

  before(function() {
    _console = sinon.spy();

    mockery.registerMock('console', _console);
  });

  beforeEach(function() {
    _console.reset();
    _console.log = sinon.spy();

    gemini = sinon.spy();
    gemini.on = sinon.spy(function(event, cb) {
      gemini[event] = cb;
    });

    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false
    });

    plugin = require('../lib/plugin');

    mockery.disable();
  });

  after(function() {
    mockery.deregisterAll();
  });

  describe('on startRunner', function() {
    var runner;

    function init() {
      plugin(gemini, {});
    }
    function startRunner() {
      gemini.startRunner(runner);
    }
    beforeEach(function () {
      init();

      runner = sinon.spy();
      runner.on = sinon.spy();
    });

    it('should register beginState', function () {
      startRunner();

      expect(runner.on.args[0][0]).to.equal('beginState');
    });

    describe('on beginState', function () {
      beforeEach(function () {
        runner.on = sinon.spy(function (event, cb) {
          runner[event] = cb;
        });

        startRunner();
      });

      // eventData from gemini/lib/runner.js L143
      //browserId: session.browser.id,
      //  suiteName: state.suite.name,
      //  suiteFullName: state.suite.fullname // added in PR #127
      //  suiteId: state.suite.id,
      //  stateName: state.name

      it('should log test started to console', function () {
        runner.beginState({
          browserId: 'chrome',
          suiteFullName: 'suite',
          stateName: 'state'
        });

        expect(_console.log.args[0][0]).to.equal('##teamcity[testStarted name=\'suite.state.chrome\']');
      });

      it('should trim the suite name from spaces', function () {
        runner.beginState({
          browserId: 'chrome',
          suiteFullName: ' suite ',
          stateName: 'state'
        });

        expect(_console.log.args[0][0]).to.contain('\'suite.state.chrome\'');
      });

      it('should trim the state name from spaces', function () {
        runner.beginState({
          browserId: 'chrome',
          suiteFullName: 'suite',
          stateName: ' state '
        });

        expect(_console.log.args[0][0]).to.contain('\'suite.state.chrome\'');
      });

      it('should trim browserId from spaces', function () {
        runner.beginState({
          browserId: ' chrome 41 ',
          suiteFullName: 'suite',
          stateName: 'state'
        });

        expect(_console.log.args[0][0]).to.contain('\'suite.state.chrome41\'');
      });

      it('should replace spaces with underscore', function () {
        runner.beginState({
          browserId: 'chrome 41',
          suiteFullName: ' root suite ',
          stateName: ' state number two'
        });

        expect(_console.log.args[0][0]).to.contain('\'root_suite.state_number_two.chrome41\'');
      });
    });

    describe('on skipState', function () {
      beforeEach(function () {
        runner.on = sinon.spy(function (event, cb) {
          runner[event] = cb;
        });

        startRunner();
      });

      it('should log test ignored to console', function () {
        runner.skipState({
          browserId: 'chrome',
          suiteFullName: 'suite',
          stateName: 'state'
        });

        expect(_console.log.args[0][0]).to.equal('##teamcity[testIgnored name=\'suite.state.chrome\']');
      });

      it('should trim the suite name from spaces', function () {
        runner.skipState({
          browserId: 'chrome',
          suiteFullName: ' suite ',
          stateName: 'state'
        });

        expect(_console.log.args[0][0]).to.contain('\'suite.state.chrome\'');
      });

      it('should trim the state name from spaces', function () {
        runner.skipState({
          browserId: 'chrome',
          suiteFullName: 'suite',
          stateName: ' state '
        });

        expect(_console.log.args[0][0]).to.contain('\'suite.state.chrome\'');
      });

      it('should trim browserId from spaces', function () {
        runner.skipState({
          browserId: ' chrome 41 ',
          suiteFullName: 'suite',
          stateName: 'state'
        });

        expect(_console.log.args[0][0]).to.contain('\'suite.state.chrome41\'');
      });

      it('should replace spaces with underscore', function () {
        runner.skipState({
          browserId: 'chrome 41',
          suiteFullName: ' root suite ',
          stateName: ' state number two'
        });

        expect(_console.log.args[0][0]).to.contain('\'root_suite.state_number_two.chrome41\'');
      });
    });

    describe('on error', function() {
      beforeEach(function () {
        runner.on = sinon.spy(function (event, cb) {
          runner[event] = cb;
        });

        startRunner();
      });

      it('should log test finished to console', function () {
        runner.error({
          browserId: 'chrome',
          suiteFullName: 'suite',
          stateName: 'state'
        });

        expect(_console.log.args[1][0]).to.equal('##teamcity[testFinished name=\'suite.state.chrome\']');
      });

      it('should log test failed to console', function() {
        runner.error({
          browserId: 'chrome',
          suiteFullName: 'suite',
          stateName: 'state'
        });

        expect(_console.log.args[0][0]).to.contain('##teamcity[testFailed name=\'suite.state.chrome\'');
      });

      it('should log the error message', function() {
        runner.error({
          browserId: 'chrome',
          suiteFullName: 'suite',
          stateName: 'state',
          message: 'error message'
        });

        expect(_console.log.args[0][0]).to.contain('message=\'error message\'');
      });

      it('should log the stack', function() {
        runner.error({
          browserId: 'chrome',
          suiteFullName: 'suite',
          stateName: 'state',
          stack: 'stack'
        });

        expect(_console.log.args[0][0]).to.contain('details=\'stack\'');
      });
    });

    describe('on endTest', function () {
      beforeEach(function () {
        runner.on = sinon.spy(function (event, cb) {
          runner[event] = cb;
        });

        startRunner();
      });

      it('should log test finished to console', function () {
        runner.endTest({
          browserId: 'chrome',
          suiteFullName: 'suite',
          stateName: 'state',
          equal: true
        });

        expect(_console.log.args[0][0]).to.equal('##teamcity[testFinished name=\'suite.state.chrome\']');
      });

      it('should log test failed to console', function() {
        runner.endTest({
          browserId: 'chrome',
          suiteFullName: 'suite',
          stateName: 'state',
          equal: 'foobar'
        });

        expect(_console.log.args[0][0]).to.equal('##teamcity[testFailed name=\'suite.state.chrome\']');
      });

      it('should trim the suite name from spaces', function () {
        runner.endTest({
          browserId: 'chrome',
          suiteFullName: ' suite ',
          stateName: 'state',
          equal: true
        });

        expect(_console.log.args[0][0]).to.contain('\'suite.state.chrome\'');
      });

      it('should trim the state name from spaces', function () {
        runner.endTest({
          browserId: 'chrome',
          suiteFullName: 'suite',
          stateName: ' state ',
          equal: true
        });

        expect(_console.log.args[0][0]).to.contain('\'suite.state.chrome\'');
      });

      it('should trim browserId from spaces', function () {
        runner.endTest({
          browserId: ' chrome 41 ',
          suiteFullName: 'suite',
          stateName: 'state',
          equal: true
        });

        expect(_console.log.args[0][0]).to.contain('\'suite.state.chrome41\'');
      });

      it('should replace spaces with underscore', function () {
        runner.endTest({
          browserId: 'chrome 41',
          suiteFullName: ' root suite ',
          stateName: ' state number two',
          equal: true
        });

        expect(_console.log.args[0][0]).to.contain('\'root_suite.state_number_two.chrome41\'');
      });
    });
  });
});