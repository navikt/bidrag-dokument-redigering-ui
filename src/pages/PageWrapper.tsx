import "../index.css";

import { MDXProvider } from "@mdx-js/react";
import { BodyShort, Heading, Loader } from "@navikt/ds-react";
import React, { PropsWithChildren } from "react";
import { QueryClientProvider } from "react-query";
import { QueryClient } from "react-query";

import { initMock } from "../mock";

const mdxComponents = { Heading, BodyShort };
await initMock();
const initReactQuery = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                suspense: true,
                staleTime: Infinity,
                retry: 0,
                useErrorBoundary: true,
                retryDelay: 3000,
            },
        },
    });

export const queryClient = initReactQuery();
interface PageWrapperProps {
    name: string;
}
export default function PageWrapper({ children, name }: PropsWithChildren<PageWrapperProps>) {
    return (
        <MDXProvider components={mdxComponents}>
            <QueryClientProvider client={queryClient}>
                <React.Suspense fallback={<Loader size="large"></Loader>}>
                    <div className={name}>{children}</div>
                </React.Suspense>
            </QueryClientProvider>
        </MDXProvider>
    );
}
