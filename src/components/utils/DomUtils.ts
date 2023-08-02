import React from "react";

export default class DomUtils {
    static getMousePosition(id: string, e: MouseEvent | React.MouseEvent) {
        const parentElement = document.getElementById(id);
        const rect = parentElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        return { x, y };
    }
}
