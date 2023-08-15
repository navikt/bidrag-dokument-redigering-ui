import "./RedigeringInfoKnapp.css";

import EditorHelpDocs from "./EditorHelpDocs.mdx";
import InfoKnapp from "./InfoKnapp";
export default function RedigeringInfoKnapp() {
    return (
        <div className="z-50 agroup fixed bottom-4 right-8 p-2 flex items-end justify-end w-24 h-24">
            <InfoKnapp
                className="redigering-info-content"
                buttonText="Brukerveiledning"
                buttonClassName="border rounded-xl border-solid bg-white"
            >
                <EditorHelpDocs />
            </InfoKnapp>
        </div>
    );
}
