const AuthorizedOfficerModalUtils = require('../../src/elements/ip-reporting/js/authorized-officer-modal');
const {
    computePostBody,
    computeAuthorizedPartners
    } = AuthorizedOfficerModalUtils;

describe('AuthorizedOfficerModal functions', () => {
    describe('computePostBody function', () => {
        const selectedFocalPoint = 'test@test.org';

        it('builds the object', () => {
            expect(computePostBody(selectedFocalPoint)).toEqual({submitted_by_email: 'test@test.org'});
        });
    });

    describe('computeAuthorizedPartners function', () => {
        const pd = {
            unicef_officers: [
                {
                    is_authorized_officer: true,
                    active: true,
                    email: 'pseudo@nym.com',
                    name: 'George Eliot',
                    title: 'Author'
                },
                {
                    is_authorized_officer: false,
                    active: true,
                    email: 'real@name.com',
                    name: 'Mary Ann Evans',
                    title: 'Writer'
                }
            ]
        };

        const formatted = [
            {value: 'pseudo@nym.com', title: 'George Eliot Author'}
        ];

        it('returns the correctly-formatted authorized partners', () => {
            expect(computeAuthorizedPartners(pd)).toEqual(formatted);
        });
    });
});
