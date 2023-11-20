import "../index.css";

import { MDXProvider, useMDXComponents } from "@mdx-js/react";
import { bidragMDXTheme } from "@navikt/bidrag-ui-common";
import { BodyShort, Heading, Skeleton } from "@navikt/ds-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import { useThemedStylesWithMdx } from "@theme-ui/mdx";
import React, { PropsWithChildren } from "react";
import { ThemeUIProvider } from "theme-ui";

import { initMock } from "../mock";

const mdxComponents = { Heading, BodyShort };
await initMock();
const initReactQuery = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: Infinity,
                retry: 0,
                throwOnError: true,
                retryDelay: 3000,
            },
        },
    });

export const queryClient = initReactQuery();
interface PageWrapperProps {
    name: string;
}
export default function PageWrapper({ children, name }: PropsWithChildren<PageWrapperProps>) {
    const componentsWithStyles = useThemedStylesWithMdx(useMDXComponents());
    return (
        <ThemeUIProvider theme={bidragMDXTheme}>
            <MDXProvider components={{ ...mdxComponents, ...componentsWithStyles }}>
                <QueryClientProvider client={queryClient}>
                    <React.Suspense fallback={<LoadingIndicatorSkeleton />}>
                        <div className={`${name} bidrag-dokument-redigering-ui`}>{children}</div>
                    </React.Suspense>
                </QueryClientProvider>
            </MDXProvider>
        </ThemeUIProvider>
    );
}

function LoadingIndicatorSkeleton() {
    return (
        <div className="flex flex-col gap-[10px] w-full">
            <Skeleton variant="rectangle" width="100%" height="50px" />

            <LoadingIndicatorSkeletonDocuments />
        </div>
    );
}

export function LoadingIndicatorSkeletonDocuments() {
    return (
        <div className="flex flex-col gap-[20px] m-auto w-auto">
            <Skeleton variant="rectangle" width="595px" height="841px" />
            <Skeleton variant="rectangle" width="595px" height="841px" />
            <Skeleton variant="rectangle" width="595px" height="841px" />
        </div>
    );
}
