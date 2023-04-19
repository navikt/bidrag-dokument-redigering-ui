import { useEffect } from "react";

export type ListenerCallbackFn = EventListenerOrEventListenerObject;

export function useWindowListener<K extends keyof WindowEventMap>(type: K, callback: ListenerCallbackFn, ...deps: any) {
    useEffect(() => {
        window.addEventListener("keypress", callback);
        return () => window.removeEventListener("keypress", callback);
    }, [deps]);
}

export default function useListener<K extends keyof WindowEventMap>(
    type: K,
    element: Element | Document,
    callback: ListenerCallbackFn,
    ...deps: any
) {
    useEffect(() => {
        element.addEventListener("keypress", callback);
        return () => element.removeEventListener("keypress", callback);
    }, [deps]);
}
