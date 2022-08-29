import "../index.css";

import React, { PropsWithChildren } from "react";
type PageWrapperProps = PropsWithChildren;
export default function PageWrapper({ children }: PageWrapperProps) {
    return <div>{children}</div>;
}
