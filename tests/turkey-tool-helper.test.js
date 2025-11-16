const helperPath = '../handpose/turkey-tool-helper';

describe('turkey tool helper', () => {
    let modalMock;

    beforeEach(() => {
        jest.resetModules();
        modalMock = {modal: jest.fn()};
        global.$ = jest.fn(() => modalMock);
        global.startTracking = jest.fn().mockResolvedValue(undefined);
    });

    afterEach(() => {
        delete global.$;
        delete global.startTracking;
        delete global.TurkeyToolHelper;
    });

    it('shows the modal and restarts tracking', async () => {
        const helper = require(helperPath);
        await helper.restartTurkeyCapture();
        expect(global.$).toHaveBeenCalledWith('#turkeyModal');
        expect(modalMock.modal).toHaveBeenCalledWith('show');
        expect(global.startTracking).toHaveBeenCalled();
    });

    it('throws when startTracking is missing', async () => {
        delete global.startTracking;
        const helper = require(helperPath);
        await expect(helper.restartTurkeyCapture()).rejects.toThrow('startTracking');
    });
});
