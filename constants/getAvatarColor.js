import generateRandomNumberBasedOnUUIDAndRange from '../helper/generateRandomNumberBasedOnUUIDAndRange';
const colors = ['#4EBFFF', '#FFD84E', '#FF00F5', '#007DFB', '#BF3C5E', '#D17D7D', '#FF00F5', '#C699FF', '#89D5FF', '#FFCA99'];
function getAvatarColor(userId) {
    const userColor = colors[generateRandomNumberBasedOnUUIDAndRange(userId, 0, colors.length - 1)];
    return userColor;
}

export default getAvatarColor;
