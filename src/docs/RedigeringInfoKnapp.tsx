import "./RedigeringInfoKnapp.css";

import EditorHelpDocs from "./EditorHelpDocs.mdx";
import InfoKnapp from "./InfoKnapp";
export default function RedigeringInfoKnapp() {
    return (
        <div className="redigering-info-knapp border-subtle">
            <InfoKnapp className="redigering-info-content">
                <EditorHelpDocs />
            </InfoKnapp>
        </div>
    );
}
