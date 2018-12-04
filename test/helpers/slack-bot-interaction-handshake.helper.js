(() => {
    let resolve = null;
    let reject = null;

    module.exports = {
        waitForDelayedResponse,
        finishDelayedResponse,
        failDelayedResponse,
        hasPendingResponse
    };

    function waitForDelayedResponse() {
        /*
         * Simulating what delayed response flow would look like.
         * We need to assert that something will eventually happen...
         */
        return new Promise((_resolve, _reject) => {
            // save for delayed response use...
            resolve = _resolve;
            reject = _reject;
        });
    }

    function finishDelayedResponse(response) {
        if (resolve) {
            resolve(response);
            resolve = null;
            reject = null;
        } else {
            const stateErr = {
                message: 'A delayed response happened without a corresponding request.'
            };

            throw stateErr;
        }
    }

    function failDelayedResponse(err) {
        if (reject) {
            reject(err);
            resolve = null;
            reject = null;
        } else {
            const stateErr = {
                message: 'A delayed response happened without a corresponding request.'
            };

            throw stateErr;
        }
    }

    function hasPendingResponse() {
        return !!(resolve || reject);
    }
})();
