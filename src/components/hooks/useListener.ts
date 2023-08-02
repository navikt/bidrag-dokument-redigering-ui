import { useEffect } from "react";

export type ListenerCallbackFn = EventListenerOrEventListenerObject;

export function useWindowListener<K extends keyof WindowEventMap>(
    type: K,
    callback: ListenerCallbackFn,
    passive = true,
    ...deps: any
) {
    useEffect(() => {
        window.addEventListener(type, callback, { passive });
        return () => window.removeEventListener(type, callback);
    }, [deps]);
}

export default function useListener<K extends keyof WindowEventMap>(
    type: K,
    element: Element | Document,
    callback: ListenerCallbackFn,
    passive = true,
    ...deps: any
) {
    useEffect(() => {
        element.addEventListener(type, callback, { passive });
        return () => element.removeEventListener(type, callback);
    }, [deps]);
}
