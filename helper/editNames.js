import sliceText from './sliceText';

function editNames(usersArray, currentUserId, contacts, allowCurrentUserInfo = true) {
    if (!Array.isArray(usersArray) || typeof currentUserId !== 'string') {
        console.error('Invalid input to updateNamesInArray function');
        return [];
    }

    try {
        const contactsMap = new Map(Object.entries(contacts));

        for (const user of usersArray) {
            if (user._id === currentUserId) {
                user.name = 'You';
            } else if (user.phoneNumber && contactsMap.has(user.phoneNumber)) {
                user.name = sliceText(contactsMap.get(user.phoneNumber));
            } else if (user.name) {
                user.name = sliceText(user.name);
            } else {
                user.name = user.phoneNumber;
            }
        }
        if (allowCurrentUserInfo) {
            return usersArray;
        }
        return usersArray.filter((user) => user._id !== currentUserId).sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error('Error in updateNamesInArray function:', error);
        return [];
    }
}

export default editNames;
