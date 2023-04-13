import { List, Record, Stack } from "immutable";

// Default maximum number of undo
const MAX_UNDOS = 500;

type Snapshot<T> = {
    value: T;
    merged: number;
};

/**
 * Default properties.
 */
const DEFAULTS = <T>() => ({
    // The previous states. Last is the closest to current (most
    // recent)
    undos: List<Snapshot<T>>(), // List<Snapshot>

    // The next states. Top is the closest to current (oldest)
    redos: Stack<Snapshot<T>>(), // Stack<Snapshot>

    // Remember the current merged count. For SMOOTH strategy
    merged: 1,

    maxUndos: MAX_UNDOS,
});

/**
 * Data structure for an History of state, with undo/redo.
 */
export default class History<T> extends Record(DEFAULTS<T>()) {
    static lru = lru;

    /**
     * @param {Any} initial The initial state
     * @return {History}
     */
    static create(opts = {}) {
        return new History(opts);
    }

    get canUndo() {
        return !this.undos.isEmpty();
    }

    get canRedo() {
        return !this.redos.isEmpty();
    }

    /**
     * @return {Any?} the previous state
     */
    get previous() {
        return this.undos.last().value;
    }

    /**
     * @return {Any?} the next state
     */
    get next() {
        return this.redos.first().value;
    }

    /**
     * Push a new state, and clear all the next states.
     * @param {Any} state The new state
     * @return {History}
     */
    push(state) {
        const newHistory = this.merge({
            undos: this.undos.push(snapshot(state, this.merged)),
            redos: Stack(),
            merged: 1,
        });

        return newHistory.prune();
    }

    /**
     * Go back to previous state. Return itself if no previous state.
     * @param {Any} current The current state
     * @return {History}
     */
    undo(current) {
        if (!this.canUndo) return this;

        return this.merge({
            undos: this.undos.pop(),
            redos: this.redos.push(snapshot(current, this.merged)),
            merged: this.undos.last().merged,
        });
    }

    /**
     * Go to next state. Return itself if no next state
     * @param {Any} current The current state
     * @return {History}
     */
    redo(current) {
        if (!this.canRedo) return this;

        return this.merge({
            undos: this.undos.push(snapshot(current, this.merged)),
            redos: this.redos.pop(),
            merged: this.redos.first().merged,
        });
    }

    /**
     * Prune undo/redo using the defined strategy,
     * after pushing a value on a valid History.
     * @return {History}
     */
    prune() {
        if (this.undos.size <= this.maxUndos) {
            return this;
        } else {
            return lru(this);
        }
    }
}

function lru(history) {
    return history.set("undos", history.undos.shift());
}
function snapshot(value, merged = 1) {
    return { value, merged };
}
