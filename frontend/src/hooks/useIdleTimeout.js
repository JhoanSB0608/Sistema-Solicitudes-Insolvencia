import { useEffect, useRef, useCallback } from 'react';

/**
 * A custom hook to detect user inactivity and trigger a callback.
 * @param {object} options - The options for the idle timeout.
 * @param {function} options.onIdle - The function to call when the user is idle.
 * @param {number} options.idleTime - The idle time in milliseconds.
 * @param {boolean} [options.enabled=true] - Whether the idle timer is enabled.
 * @returns {{reset: function}} - An object containing a function to manually reset the timer.
 */
const useIdleTimeout = ({ onIdle, idleTime, enabled = true }) => {
  const timeoutId = useRef();

  const resetTimer = useCallback(() => {
    clearTimeout(timeoutId.current);
    timeoutId.current = setTimeout(onIdle, idleTime);
  }, [onIdle, idleTime]);

  useEffect(() => {
    if (!enabled) {
      clearTimeout(timeoutId.current);
      return;
    }

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];

    const handleActivity = () => {
      resetTimer();
    };

    // Set up event listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Initial timer setup
    resetTimer();

    // Cleanup function
    return () => {
      clearTimeout(timeoutId.current);
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [idleTime, enabled, resetTimer]);

  return { reset: resetTimer };
};

export default useIdleTimeout;
