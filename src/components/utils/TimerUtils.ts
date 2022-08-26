export class TimerUtils {
    static throttleFunction(func: (...val: any) => void, delay: number) {
        let timer: NodeJS.Timeout;
        let throttleTimedOut = true;
        return (...args: any[]) => {
            if (!throttleTimedOut) return;
            throttleTimedOut = false;
            clearTimeout(timer);
            timer = setTimeout(() => {
                func.apply(this, args);
                throttleTimedOut = true;
            }, delay);
        };
    }

    static throttleByAnimation(func: (...val: any) => void) {
        let throttleTimedOut = true;
        return (...args: any[]) => {
            if (!throttleTimedOut) return;
            throttleTimedOut = false;
            window.requestAnimationFrame(() => {
                func.apply(this, args);
                throttleTimedOut = true;
            });
        };
    }
}
