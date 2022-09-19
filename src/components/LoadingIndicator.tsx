import { Label, Loader } from "@navikt/ds-react";

interface LoadingIndicatorProps {
    title: string;
    variant?: "neutral" | "interaction" | "inverted";
}
export default function LoadingIndicator({ title, variant = "neutral" }: LoadingIndicatorProps) {
    return (
        <div className={"flex flex-col z-[10000] fixed left-[50%] top-[50%] w-[100%] h-[100%] "}>
            <Loader variant={variant} size={"3xlarge"} title={title} />
            <Label spacing size={"medium"} className={"max-w-[250px] relative left-[-25px]"}>
                {title}
            </Label>
        </div>
    );
}
