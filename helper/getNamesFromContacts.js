import * as Contacts from 'expo-contacts';
async function getNamesFromContacts() {
    // Request permission to access contacts
    const { status } = await Contacts.requestPermissionsAsync();

    // If permission is not granted, return an empty object
    if (status !== 'granted') {
        console.log('Contacts permission is not granted.');
        return {};
    }

    // Fetch all contacts with permission granted
    const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.FirstName, Contacts.Fields.LastName, Contacts.Fields.PhoneNumbers],
    });

    // Create an object to store the formatted contact names
    let contactNames = {};

    // Iterate through each contact
    data.forEach((contact) => {
        // Check if the contact has a phone number and a name
        if (contact.phoneNumbers && (contact.firstName || contact.lastName)) {
            // Iterate through each phone number
            contact.phoneNumbers.forEach((phone) => {
                // Extract plain 10-digit phone number
                const plainPhoneNumber = phone.number.replace(/\D/g, '').slice(-10);
                // Prepare the full name, handling potentially undefined first or last names
                const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
                // Format and add the contact name and phone number to the object
                contactNames[plainPhoneNumber] = fullName;
            });
        }
    });

    return contactNames;
}

export default getNamesFromContacts;
