var _console = require('console');

function getTestName(eventData) {
  return (eventData.suiteFullName.trim() + '.' +
          eventData.stateName.trim() + '.' +
          eventData.browserId.replace(/ /g, ''))
          .replace(/ /g, '_');
};

module.exports = function(gemini, opts) {
  gemini.on('startRunner', function(runner) {
    runner.on('beginState', function(eventData) {
      _console.log('##teamcity[testStarted name=\'' + getTestName(eventData) + '\']');
    });
  });
};
