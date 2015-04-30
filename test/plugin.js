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
    var eventData;

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

      eventData = {
        browserId: 'chrome',
        state: {
          name: 'state'
        },
        suite: {
          fullName: 'suite'
        }
      };
    });

    // eventData from lib/runner.js#L105 @ c5224c
    // eventData = {
    //  suite: suite,
    //  browserId: browser.id,
    //
    //  // Deprecated fileds. TODO: remove before next release
    //  suiteName: state.name,
    //  suitePath: suite.path,
    //  suiteId: suite.id
    //};

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

      it('should log test started to console', function () {
       runner.beginState(eventData);

        expect(_console.log.args[0][0]).to.equal('##teamcity[testStarted name=\'suite.state.chrome\']');
      });

      it('should trim the suite name from spaces', function () {
        eventData.suite.fullName = ' suite ';

        runner.beginState(eventData);

        expect(_console.log.args[0][0]).to.contain('\'suite.state.chrome\'');
      });

      it('should trim the state name from spaces', function () {
        eventData.state.name = ' state ';

        runner.beginState(eventData);

        expect(_console.log.args[0][0]).to.contain('\'suite.state.chrome\'');
      });

      it('should trim browserId from spaces', function () {
        eventData.browserId = ' chrome 41 ';

        runner.beginState(eventData);

        expect(_console.log.args[0][0]).to.contain('\'suite.state.chrome41\'');
      });

      it('should replace spaces with underscore', function () {
        eventData.browserId = 'chrome 41';
        eventData.suite.fullName = ' root suite ';
        eventData.state.name = ' state number two';

        runner.beginState(eventData);

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
        runner.skipState(eventData);

        expect(_console.log.args[0][0]).to.equal('##teamcity[testIgnored name=\'suite.state.chrome\']');
      });

      it('should trim the suite name from spaces', function () {
        eventData.suite.fullName = ' suite ';

        runner.skipState(eventData);

        expect(_console.log.args[0][0]).to.contain('\'suite.state.chrome\'');
      });

      it('should trim the state name from spaces', function () {
        eventData.state.name = ' state ';

        runner.skipState(eventData);

        expect(_console.log.args[0][0]).to.contain('\'suite.state.chrome\'');
      });

      it('should trim browserId from spaces', function () {
        eventData.browserId = ' chrome 41 ';

        runner.skipState(eventData);

        expect(_console.log.args[0][0]).to.contain('\'suite.state.chrome41\'');
      });

      it('should replace spaces with underscore', function () {
        eventData.browserId = 'chrome 41';
        eventData.suite.fullName = ' root suite ';
        eventData.state.name = ' state number two';

        runner.skipState(eventData);

        expect(_console.log.args[0][0]).to.contain('\'root_suite.state_number_two.chrome41\'');
      });
    });

    describe('on error', function() {
      beforeEach(function () {
        runner.on = sinon.spy(function (event, cb) {
          runner[event] = cb;
        });

        startRunner();

        eventData.message = 'error message';
        eventData.stack = 'stack';
      });

      it('should log test finished to console', function () {
        runner.error(eventData);

        expect(_console.log.args[1][0]).to.equal('##teamcity[testFinished name=\'suite.state.chrome\']');
      });

      it('should log test failed to console', function() {
        runner.error(eventData);

        expect(_console.log.args[0][0]).to.contain('##teamcity[testFailed name=\'suite.state.chrome\'');
      });

      it('should log the error message', function() {
        runner.error(eventData);

        expect(_console.log.args[0][0]).to.contain('message=\'error message\'');
      });

      it('should log the stack', function() {
        runner.error(eventData);

        expect(_console.log.args[0][0]).to.contain('details=\'stack\'');
      });
    });

    describe('on endTest', function () {
      beforeEach(function () {
        runner.on = sinon.spy(function (event, cb) {
          runner[event] = cb;
        });

        startRunner();

        eventData.equal = true;
      });

      it('should log test finished to console', function () {
        runner.endTest(eventData);

        expect(_console.log.args[0][0]).to.equal('##teamcity[testFinished name=\'suite.state.chrome\']');
      });

      it('should log test failed to console', function() {
        eventData.equal = 'foobar';

        runner.endTest(eventData);

        expect(_console.log.args[0][0]).to.equal('##teamcity[testFailed name=\'suite.state.chrome\']');
      });

      it('should trim the suite name from spaces', function () {
        eventData.suite.fullName = ' suite ';

        runner.endTest(eventData);

        expect(_console.log.args[0][0]).to.contain('\'suite.state.chrome\'');
      });

      it('should trim the state name from spaces', function () {
        eventData.state.name = ' state ';

        runner.endTest(eventData);

        expect(_console.log.args[0][0]).to.contain('\'suite.state.chrome\'');
      });

      it('should trim browserId from spaces', function () {
        eventData.browserId = ' chrome 41 ';

        runner.endTest(eventData);

        expect(_console.log.args[0][0]).to.contain('\'suite.state.chrome41\'');
      });

      it('should replace spaces with underscore', function () {
        eventData.browserId = 'chrome 41';
        eventData.suite.fullName = ' root suite ';
        eventData.state.name = ' state number two';

        runner.endTest(eventData);

        expect(_console.log.args[0][0]).to.contain('\'root_suite.state_number_two.chrome41\'');
      });
    });
  });
});