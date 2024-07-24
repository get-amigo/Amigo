import * as Contacts from 'expo-contacts';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';
import React, { createContext, useContext, useEffect, useState } from 'react';

import generateRandomColor from '../helper/generateRandomColor';
import getDefaultCountryCode from '../helper/getDefaultCountryCode';
import { useAuth } from '../stores/auth';

const ContactsContext = createContext();

const filterUniqueContacts = (contactsData, userPhoneNumber) => {
    const seenPhoneNumbers = new Set();
    return contactsData.filter((contact) => {
        const phoneNumber = contact.phoneNumbers?.[0].number.replace(/\D/g, '');
        return phoneNumber && phoneNumber !== userPhoneNumber && !seenPhoneNumbers.has(phoneNumber) && seenPhoneNumbers.add(phoneNumber);
    });
};

const mapToSimplifiedContacts = (uniqueContacts) => {
    const defaultCountryCode = getDefaultCountryCode();

    return uniqueContacts
        .filter((contact) => isValidPhoneNumber(contact.phoneNumbers[0].number))
        .map((contact) => {
            const phoneNumber = parsePhoneNumber(contact.phoneNumbers[0].number, defaultCountryCode);

            return {
                id: contact.id,
                name: contact.name || '',
                phoneNumber: phoneNumber.nationalNumber,
                countryCode: `+${phoneNumber.countryCallingCode}`,
                imageURI: contact.imageAvailable ? contact.image.uri : '',
                color: generateRandomColor(),
            };
        });
};

const fetchContactsData = async () => {
    try {
        const { data } = await Contacts.getContactsAsync({
            fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers, Contacts.Fields.Image],
        });

        if (!data) {
            return [];
        }

        const contactsWithMultipleNumbers = [];

        // Iterate through each contact
        data.forEach((contact) => {
            const { name, phoneNumbers, image } = contact;

            // Check if there are multiple phone numbers for the contact
            if (phoneNumbers && phoneNumbers.length > 1) {
                // Create a copy of the contact for each phone number
                phoneNumbers.forEach((phoneNumber) => {
                    const contactCopy = {
                        name,
                        phoneNumbers: [phoneNumber], // Create an array with a single phone number
                        image,
                    };
                    contactsWithMultipleNumbers.push(contactCopy);
                });
            } else {
                // No need to create a copy, just push the original contact
                contactsWithMultipleNumbers.push(contact);
            }
        });

        return contactsWithMultipleNumbers;
    } catch (error) {
        console.error('Error fetching contacts data:', error);
        throw error;
    }
};

export const ContactsProvider = ({ children }) => {
    const [allContacts, setAllContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [contactPermission, setContactPermission] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const loadContacts = async () => {
            try {
                const permissionStatus = await requestContactsPermission();

                if (permissionStatus === 'granted') {
                    const contactsData = await fetchContactsData();

                    if (contactsData.length > 0) {
                        const uniqueContacts = filterUniqueContacts(contactsData, user.phoneNumber);
                        const simplifiedContacts = mapToSimplifiedContacts(uniqueContacts);

                        setAllContacts(simplifiedContacts);
                        setFilteredContacts(simplifiedContacts);
                    }
                } else {
                    setContactPermission(false);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        const requestContactsPermission = async () => {
            try {
                const { status } = await Contacts.requestPermissionsAsync();
                setContactPermission(status === 'granted');
                return status;
            } catch (error) {
                console.error('Error requesting contacts permission:', error);
                throw error;
            }
        };

        loadContacts();
    }, [user.phoneNumber]);

    useEffect(() => {
        // Update filtered contacts whenever search changes
        const filtered = allContacts.filter(
            (contact) => contact.name.toLowerCase().includes(search.toLowerCase()) || contact.phoneNumber.includes(search),
        );
        setFilteredContacts(filtered);
    }, [search, allContacts]);

    const handleSelectContact = (contact) => {
        const isSelected = selectedContacts.some((selected) => selected.phoneNumber === contact.phoneNumber);
        setSelectedContacts(
            isSelected
                ? selectedContacts.filter((selected) => selected.phoneNumber !== contact.phoneNumber)
                : [...selectedContacts, contact],
        );
    };

    return (
        <ContactsContext.Provider
            value={{
                contacts: filteredContacts,
                search,
                setSearch,
                selectedContacts,
                handleSelectContact,
                loading,
                setSelectedContacts,
                contactPermission,
            }}
        >
            {children}
        </ContactsContext.Provider>
    );
};
ContactsProvider.displayName = 'ContactsProvider';
export const useContacts = () => {
    return useContext(ContactsContext);
};
