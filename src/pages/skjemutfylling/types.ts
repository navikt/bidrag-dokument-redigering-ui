export interface SkjemautfyllingMetadata {
    formValues: [number, SingleFormProps[]][];
}

export interface SingleFormProps {
    type: "Btn" | "Tx";
    value: boolean | string;
    name: string;
    id: string;
    exportValue: string;
}

export type PageFormProps = Map<number, SingleFormProps[]>;
