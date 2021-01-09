import { useRef, useEffect } from 'react';

type UseIntervalOptions = Partial<{
    runOnStart: boolean
}>

function useInterval(callback: () => void, delay: number | null, deps: any[], options?: UseIntervalOptions) {
    const savedCallback = useRef<() => void | null>();

    const _deps = [delay, ...deps];

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    });

    // Set up the interval.
    useEffect(() => {
        function tick() {
            if (savedCallback.current !== undefined) {
                savedCallback.current();
            }
        }

        if (options && options.runOnStart) {
            tick();
        }

        if (delay !== null) {
            const id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, _deps);
}

export default useInterval;
