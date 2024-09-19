import { useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

const useFocusThrottledFetch = (fetchFunc, delay) => {
    const lastCallTime = useRef(0);

    const throttledFetch = useCallback(() => {
        const now = Date.now();
        if (now - lastCallTime.current >= delay) {
            lastCallTime.current = now;
            fetchFunc();
        }
    }, [fetchFunc, delay]);

    useFocusEffect(
        useCallback(() => {
            throttledFetch();
        }, [throttledFetch]),
    );
};

export default useFocusThrottledFetch;
