import "../index.css";

import React, { PropsWithChildren } from "react";
interface PageWrapperProps {
    name: string;
}
export default function PageWrapper({ children, name }: PropsWithChildren<PageWrapperProps>) {
    return <div className={name}>{children}</div>;
}
