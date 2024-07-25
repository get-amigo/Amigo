function generateMinimalColor() {
    let color = '#';
    for (let i = 0; i < 3; i++) {
        // Generate a light, muted color component
        const component = Math.floor(Math.random() * 128 + 127).toString(16);
        // Ensuring two digits for each color component
        color += component.length === 1 ? '0' + component : component;
    }
    return color;
}

export default generateMinimalColor;
