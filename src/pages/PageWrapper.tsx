import "../index.css";

import React, { PropsWithChildren } from "react";

import { initMock } from "../__mocks__/msw";

(async function () {
    await initMock();
})();

interface PageWrapperProps {
    name: string;
}
export default function PageWrapper({ children, name }: PropsWithChildren<PageWrapperProps>) {
    return <div className={name}>{children}</div>;
}
