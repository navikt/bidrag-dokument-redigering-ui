import { PointerEventHandlers } from "@dnd-kit/core";
import { PointerSensor } from "@dnd-kit/core";
import { PointerSensorOptions } from "@dnd-kit/core/dist/sensors/pointer/PointerSensor";
import { PointerEvent } from "react";
const events: PointerEventHandlers = {
    move: { name: "focus" },
    end: { name: "mouseup" },
};
export class FocusKeyboardSensor extends PointerSensor {
    static activators = [
        {
            eventName: "onPointerDown" as const,
            handler({ nativeEvent: event }: PointerEvent, { onActivation }: PointerSensorOptions) {
                console.log("SENSOR", event, onActivation);
                return true;
            },
        },
    ];
}
