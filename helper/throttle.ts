const throttle = <T extends any[]>(fn: (...args: T) => void, delay: number) => {
    let lastTime = 0;
    return (...args: T) => {
        const now = new Date().getTime();
        if (now - lastTime < delay) return;
        lastTime = now;
        fn(...args);
    };
};

export default throttle;
