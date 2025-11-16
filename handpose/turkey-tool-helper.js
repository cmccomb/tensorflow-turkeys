(function initTurkeyToolHelper(root) {
    const globalObject = root || (typeof window !== 'undefined' ? window : globalThis);

    function getjQuery() {
        const jqueryInstance = globalObject && globalObject.$;
        if (typeof jqueryInstance !== 'function') {
            throw new Error('jQuery is required to control the turkey modal.');
        }
        return jqueryInstance;
    }

    function getModalController() {
        const jqueryInstance = getjQuery();
        const modalInstance = jqueryInstance('#turkeyModal');
        if (!modalInstance || typeof modalInstance.modal !== 'function') {
            throw new Error('The turkey modal is unavailable.');
        }
        return modalInstance;
    }

    function ensureStartTracking() {
        const tracker = globalObject && globalObject.startTracking;
        if (typeof tracker !== 'function') {
            throw new Error('startTracking is not available.');
        }
        return tracker;
    }

    async function restartTurkeyCapture() {
        const modalController = getModalController();
        modalController.modal('show');
        const tracker = ensureStartTracking();
        await tracker();
    }

    const helper = {restartTurkeyCapture};

    if (globalObject) {
        globalObject.TurkeyToolHelper = helper;
    }

    if (typeof module === 'object' && module.exports) {
        module.exports = helper;
    }

    return helper;
})(typeof window !== 'undefined' ? window : globalThis);
