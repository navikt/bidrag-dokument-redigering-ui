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
    static debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
        let timeoutId: NodeJS.Timeout;

        return function (this: any, ...args: Parameters<T>): void {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }
}
