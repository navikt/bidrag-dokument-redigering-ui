import "./Toolbar.css";

import { PropsWithChildren } from "react";
const Toolbar: React.FC<PropsWithChildren<unknown>> = ({ children }) => {
    return (
        <div
            className={"editor_toolbar"}
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <div className={"toolbar_content"}>{children}</div>
        </div>
    );
};

export default Toolbar;
