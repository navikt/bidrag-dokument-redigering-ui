import { Label, Loader } from "@navikt/ds-react";

interface LoadingIndicatorProps {
    title: string;
}
export default function LoadingIndicator({ title }: LoadingIndicatorProps) {
    return (
        <div className={"fixed left-[50%] top-[50%] w-[100%] h-[100%] "}>
            <Loader size={"3xlarge"} title={title} />
            <Label spacing size={"medium"} className={"max-w-[250px] relative left-[-25px]"}>
                {title}
            </Label>
        </div>
    );
}
