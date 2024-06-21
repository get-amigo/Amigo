function generateUniqueId() {
    // Helper functions to generate parts of the ObjectID
    function hex(value) {
        return value.toString(16).padStart(2, '0');
    }

    function randomBytes(length) {
        let bytes = '';
        for (let i = 0; i < length; i++) {
            bytes += hex(Math.floor(Math.random() * 256));
        }
        return bytes;
    }

    // 4-byte timestamp (seconds since Unix epoch)
    const timestamp = Math.floor(Date.now() / 1000)
        .toString(16)
        .padStart(8, '0');

    // 5-byte random value (machine ID + process ID or purely random)
    const randomValue = randomBytes(5);

    // 3-byte incrementing counter (starts at a random value)
    const counter = Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, '0');

    // Combine all parts to form the ObjectID
    return timestamp + randomValue + counter;
}

export default generateUniqueId;
