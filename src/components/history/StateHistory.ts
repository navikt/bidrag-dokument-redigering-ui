import { List, Record, Stack } from "immutable";

// Default maximum number of undo
const MAX_UNDOS = 500;

/**
 * Default properties.
 */
const DEFAULTS = <T>() => ({
    // The previous states. Last is the closest to current (most
    // recent)
    undos: List<T>(), // List<Snapshot>

    // The next states. Top is the closest to current (oldest)
    redos: Stack<T>(), // Stack<Snapshot>

    maxUndos: MAX_UNDOS,
});
//@ts-ignore
export default class StateHistory<T> extends Record(DEFAULTS<T>()) {
    private maxUndos = 100;
    private currentValue: T;
    constructor(currentValue: T) {
        super();
        this.currentValue = currentValue;
        return this.push(currentValue);
    }
    get current(): T {
        return this.currentValue;
    }
    get canUndo() {
        return !this.undos.isEmpty();
    }

    get canRedo() {
        return !this.redos.isEmpty();
    }
    get stack(): List<T> {
        return this.undos;
    }
    /**
     * @return {Any?} the previous state
     */
    get previous(): T {
        return this.undos.last();
    }

    /**
     * @return {Any?} the next state
     */
    get next(): T {
        return this.redos.first();
    }

    /**
     * Push a new state, and clear all the next states.
     * @param {Any} state The new state
     * @return {StateHistory}
     */
    push(state: T) {
        this.currentValue = state;
        const newHistory = this.merge({
            undos: this.undos.push(state),
            redos: Stack(),
        });

        newHistory.currentValue = state;
        return newHistory.prune();
    }

    /**
     * Go back to previous state. Return itself if no previous state.
     * @param {Any} current The current state
     * @return {StateHistory}
     */
    undo(current: T) {
        this.currentValue = current;
        if (this.undos.isEmpty()) return this;

        const newHistory = this.merge({
            undos: this.undos.pop(),
            redos: this.redos.push(current),
        });
        newHistory.currentValue = current;
        return newHistory;
    }

    /**
     * Go to next state. Return itself if no next state
     * @param {Any} current The current state
     * @return {StateHistory}
     */
    redo(current) {
        this.currentValue = current;
        if (!this.canRedo) return this;

        const newHistory = this.merge({
            undos: this.undos.push(current),
            redos: this.redos.pop(),
        });
        newHistory.currentValue = current;
        return newHistory;
    }

    /**
     * Prune undo/redo using the defined strategy,
     * after pushing a value on a valid History.
     * @return {StateHistory}
     */
    prune() {
        if (this.undos.size <= this.maxUndos) {
            return this;
        } else {
            return this.lru(this);
        }
    }
    lru(history) {
        return history.set("undos", history.undos.shift());
    }
}

function snapshot(value, merged = 1) {
    return { value, merged };
}
