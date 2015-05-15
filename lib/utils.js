

module.exports = {
    getTestName: function(testData) {
        return [
            testData.suite.fullName.trim(),
            testData.state.name.trim(),
            testData.browserId
        ].join('.');
    }
};
