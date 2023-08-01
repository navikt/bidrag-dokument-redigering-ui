import "../index.css";

import { MDXProvider } from "@mdx-js/react";
import { BodyShort, Heading, Skeleton } from "@navikt/ds-react";
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
                <React.Suspense fallback={<LoadingIndicatorSkeleton />}>
                    <div className={name}>{children}</div>
                </React.Suspense>
            </QueryClientProvider>
        </MDXProvider>
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
