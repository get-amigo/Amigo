function getMembersString(members, numberOfCharacters) {
    const names = [];

    for (let i = 0; i < members.length; i++) {
        if (members[i].hasOwnProperty('name') && members[i].name) {
            // Split the name string by spaces and take the first part
            const namePart = members[i].name.split(' ')[0];
            names.push(namePart);
        }
    }

    let result = names.join(', ');

    if (result.length > numberOfCharacters) {
        result = result.substring(0, numberOfCharacters) + '..';
    }

    // Remove trailing comma, if present
    if (result.endsWith(',')) {
        result = result.slice(0, -1);
    }

    return result;
}

export default getMembersString;
