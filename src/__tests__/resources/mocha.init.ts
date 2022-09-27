import "cross-fetch/polyfill";

import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "mocha";
import sinon from "sinon";

import { mockHentDokument } from "../../__mocks__/sinon/MockDokumentService";

// @ts-ignore

export const sinonSandbox = sinon.createSandbox();
export async function mochaGlobalSetup() {
    // @ts-ignore
    global.window.showErrorPage = (error) => {
        console.log("showErrorPage was called with error=", error);
    };
    // @ts-ignore
    global.window.logErrorMessage = (message, error) => {
        console.log("logErrorMessage was called with message=", message);
    };
    // @ts-ignore
    global.window.openPersonsok = () => {
        return null;
    };
    global.window.open = () => null;
    global.window.focus = () => null;
    global.window.close = () => null;
    // @ts-ignore
    global.window.waitForPersonSokResult = () => {
        return Promise.resolve({ ok: true, status: 200, payload: null });
    };
    // @ts-ignore
    global.window.logToServer = {
        info: (message: string) => null,
        warning: (message: string) => null,
        debug: (message: string) => null,
        error: (message: string, err: Error) => null,
    };

    beforeEach(() => {
        cleanup();
        mockHentDokument(sinonSandbox);
    });

    afterEach(() => {
        sinonSandbox.reset();
        sinonSandbox.restore();
        sinonSandbox.resetBehavior();
        sinonSandbox.resetHistory();
    });
}
