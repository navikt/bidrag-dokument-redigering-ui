import React, { PropsWithChildren } from "react";

interface ThumbnailDecoratorProps {
    test?: string;
}
export default function ThumbnailDecorator({ children }: PropsWithChildren<ThumbnailDecoratorProps>) {
    return <div style={{ width: "350px" }}>{children}</div>;
}
