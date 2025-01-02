"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debounce = void 0;
/**
 * Creates a debounced function that delays invoking the provided function
 * until after a specified wait time has elapsed since the last time it was invoked.
 * Optionally, it can invoke the function immediately on the leading edge.
 *
 * @param {HTMLElement} el - The context element to bind the function to.
 * @param {(e?: Event) => void} func - The function to debounce.
 * @param {number} wait - The number of milliseconds to delay.
 * @param {boolean} immediate - Whether to execute the function on the leading edge.
 * @returns {LimittedHandler} The debounced function with a cancel method.
 */
const debounce = (el, func, wait, immediate) => {
    let timeout;
    const debounced = function (e) {
        const callNow = immediate && !timeout;
        timeout && clearTimeout(timeout);
        timeout = setTimeout(() => {
            timeout = null;
            if (!immediate)
                func.call(el, e);
        }, wait);
        if (callNow)
            func.call(el, e);
    };
    debounced.cancel = () => timeout && clearTimeout(timeout);
    return debounced;
};
exports.debounce = debounce;
