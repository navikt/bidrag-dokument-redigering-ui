import React, { useRef } from "react";
import { DraggableBlockPlugin_EXPERIMENTAL } from "@lexical/react/LexicalDraggableBlockPlugin";

const DRAGGABLE_BLOCK_MENU_CLASSNAME = "draggable-block-menu";

function isOnMenu(element: HTMLElement): boolean {
    return !!element.closest(`.${DRAGGABLE_BLOCK_MENU_CLASSNAME}`);
}

export default function DraggableBlockPlugin({
    anchorElem,
}: {
    anchorElem: HTMLElement;
}): React.ReactElement | null {
    const menuRef = useRef<HTMLDivElement>(null);
    const targetLineRef = useRef<HTMLDivElement>(null);

    return (
        <DraggableBlockPlugin_EXPERIMENTAL
            anchorElem={anchorElem}
            menuRef={menuRef}
            targetLineRef={targetLineRef}
            menuComponent={
                <div
                    ref={menuRef}
                    className={DRAGGABLE_BLOCK_MENU_CLASSNAME}
                >
                    <div className="draggable-block-menu-icon">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                        >
                            <circle cx="5" cy="4" r="1.5" />
                            <circle cx="11" cy="4" r="1.5" />
                            <circle cx="5" cy="8" r="1.5" />
                            <circle cx="11" cy="8" r="1.5" />
                            <circle cx="5" cy="12" r="1.5" />
                            <circle cx="11" cy="12" r="1.5" />
                        </svg>
                    </div>
                </div>
            }
            targetLineComponent={
                <div ref={targetLineRef} className="draggable-block-target-line" />
            }
            isOnMenu={isOnMenu}
        />
    );
}
