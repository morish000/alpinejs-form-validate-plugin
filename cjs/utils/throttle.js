"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throttle = void 0;
/**
 * Creates a throttled function that only invokes the provided function at most once per every `wait` milliseconds.
 *
 * @param {Element} el - The context in which the function should be called.
 * @param {(e?: Event) => void} func - The function to throttle.
 * @param {number} wait - The number of milliseconds to throttle invocations to.
 * @param {Object} options - Options to configure the throttle behavior.
 * @param {boolean} [options.leading=true] - Specify invoking on the leading edge.
 * @param {boolean} [options.trailing=true] - Specify invoking on the trailing edge.
 * @returns {LimittedHandler} A new throttled function with a `cancel` method to clear pending invocations.
 */
const throttle = (el, func, wait, { leading = true, trailing = true } = {}) => {
    let lastFunc;
    let lastRan = 0;
    const throttled = function (e) {
        const now = Date.now();
        if (!lastRan && !leading)
            lastRan = now;
        const remaining = wait - (now - lastRan);
        if (remaining <= 0) {
            if (leading || lastRan) {
                func.call(el, e);
                lastRan = now;
            }
            lastFunc !== null && clearTimeout(lastFunc);
        }
        else if (trailing) {
            lastFunc && clearTimeout(lastFunc);
            lastFunc = setTimeout(() => {
                if (!leading || lastRan) {
                    func.call(el, e);
                    lastRan = leading ? Date.now() : 0;
                }
            }, remaining);
        }
    };
    throttled.cancel = () => lastFunc && clearTimeout(lastFunc);
    return throttled;
};
exports.throttle = throttle;
