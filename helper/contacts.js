import * as Contacts from 'expo-contacts';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';

import generateRandomColor from '../helper/generateRandomColor';
import getDefaultCountryCode from '../helper/getDefaultCountryCode';

const fetchContacts = async () => {
    try {
        const { data } = await Contacts.getContactsAsync({
            fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers, Contacts.Fields.Image],
        });

        if (!data) {
            return [];
        }

        return data;
    } catch (error) {
        console.error('Error fetching contacts data:', error);
        throw error;
    }
};

const filterUniqueContacts = (contactsData, userPhoneNumber) => {
    const seenPhoneNumbers = new Set();
    return contactsData.filter((contact) => {
        const phoneNumber = contact.phoneNumbers?.[0].number.replace(/\D/g, '');

        return phoneNumber && phoneNumber !== userPhoneNumber && !seenPhoneNumbers.has(phoneNumber) && seenPhoneNumbers.add(phoneNumber);
    });
};

const simplifyContactsObj = (uniqueContacts) => {
    const defaultCountryCode = getDefaultCountryCode();

    return uniqueContacts
        .filter((contact) => isValidPhoneNumber(contact.phoneNumbers[0].number, defaultCountryCode))
        .map((contact) => {
            const phoneNumber = parsePhoneNumber(contact.phoneNumbers[0].number, defaultCountryCode);

            return {
                id: contact.phoneNumbers[0].id,
                name: contact.name || '',
                phoneNumber: phoneNumber.nationalNumber,
                countryCode: `+${phoneNumber.countryCallingCode}`,
                imageURI: contact.imageAvailable ? contact.image.uri : '',
                color: generateRandomColor(),
            };
        });
};

const flatPhoneNumbersArr = (contacts) => {
    const flattenedContacts = [];

    contacts.forEach((contact) => {
        const { name, phoneNumbers, image } = contact;

        if (phoneNumbers && phoneNumbers.length > 1) {
            phoneNumbers.forEach((phoneNumber) => {
                const contactCopy = {
                    name,
                    phoneNumbers: [phoneNumber],
                    image,
                };
                flattenedContacts.push(contactCopy);
            });
        } else if (phoneNumbers) {
            flattenedContacts.push(contact);
        }
    });

    return flattenedContacts;
};

export { fetchContacts, filterUniqueContacts, simplifyContactsObj, flatPhoneNumbersArr };
