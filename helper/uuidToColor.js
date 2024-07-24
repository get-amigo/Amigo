function colorDifference(color1, color2) {
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);

    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);

    return Math.sqrt(Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2));
}

function uuidToColor(uuid, baseColor) {
    let hash = 0;
    for (let i = 0; i < uuid.length; i++) {
        hash = (hash << 5) - hash + uuid.charCodeAt(i);
        hash &= hash;
    }

    let color = ((hash & 0xffffff) + 0x1000000).toString(16).substring(1);

    while (colorDifference('#' + color, baseColor) < 100) {
        // Threshold can be adjusted
        hash = (hash + 1) & 0xffffff;
        color = ((hash & 0xffffff) + 0x1000000).toString(16).substring(1);
    }

    return '#' + color;
}

export default uuidToColor;
