import { PointerEventHandlers } from "@dnd-kit/core";
import { MouseSensor } from "@dnd-kit/core";
import { DraggableNode } from "@dnd-kit/core/dist/store";
const events: PointerEventHandlers = {
    move: { name: "focus" },
    end: { name: "mouseup" },
};
export class FocusKeyboardSensor extends MouseSensor {
    static activators = [
        {
            eventName: "onFocus" as const,
            handler(
                event: any,
                options: any,
                context: {
                    active: DraggableNode;
                }
            ) {
                console.log(context, event, options);
                return true;
            },
        },
    ];
}
