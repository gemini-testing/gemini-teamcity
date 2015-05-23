var assert = require('chai').assert;

var utils = require('../lib/utils');

describe('getTestName', function() {
    var data;
    var func = utils.getTestName;

    beforeEach(function() {
        data = {
            suite: {
                fullName: 'suite'
            },
            state: {
                name: 'state'
            },
            browserId: 'chrome'
        };
    });

    it('should trim the suite name from spaces', function() {
        data.suite.fullName = ' suite ';

        var actual = func(data);
        var expected = 'suite.state.chrome';

        assert.equal(actual, expected);
    });

    it('should trim the state name from spaces', function() {
        data.state.name = ' state ';

        var actual = func(data);
        var expected = 'suite.state.chrome';

        assert.equal(actual, expected);
    });

    it('should trim browserId from spaces', function() {
        data.browserId = ' chrome 41 ';

        var actual = func(data);
        var expected = 'suite.state.chrome41';

        assert.equal(actual, expected);
    });

    it('should replace spaces with underscore', function() {
        data.browserId = 'chrome 41';
        data.suite.fullName = ' root suite ';
        data.state.name = ' state number two';

        var actual = func(data);
        var expected = 'root_suite.state_number_two.chrome41';

        assert.equal(actual, expected);
    });
});
