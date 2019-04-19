const AuthorizedOfficerModalUtils = require('../../src/elements/ip-reporting/js/authorized-officer-modal');
const {computePostBody} = AuthorizedOfficerModalUtils;

describe('AuthorizedOfficerModal functions', () => {
    describe('computePostBody function', () => {
        const selectedFocalPoint = 'test@test.org';

        it('builds the object', () => {
            expect(computePostBody(selectedFocalPoint)).toEqual({submitted_by_email: 'test@test.org'});
        });
    });
});
