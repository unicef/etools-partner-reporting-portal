function AuthorizedOfficerModalUtils() {

};

AuthorizedOfficerModalUtils.computePostBody = function(selectedFocalPoint) {
    return {
        submitted_by_email: selectedFocalPoint,
    };
};

try {
    module.exports = exports = AuthorizedOfficerModalUtils;
} catch (e) {}
