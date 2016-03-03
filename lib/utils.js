module.exports = {
    getTestName: function(testData, state) {
        return [
            testData.suite.fullName.trim(),
            (state || testData.state).name.trim(),
            testData.browserId.replace(/ /g, '')
        ].join('.').replace(/ /g, '_');
    }
};
