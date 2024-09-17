import editNames from './editNames';
import getNamesFromContacts from './getNamesFromContacts';
/**
 * Updates the names of users in the given array based on certain conditions.
 * @param {Array} usersArray - Array of user objects to update.
 * @param {string} currentUserId - The ID of the current user.
 * @returns {Array} The updated usersArray with modified names.
 */
async function editNamesAsync(usersArray, currentUserId, allowCurrentUserInfo = true) {
    const contacts = await getNamesFromContacts();
    return editNames(usersArray, currentUserId, contacts, allowCurrentUserInfo);
}

export default editNamesAsync;
