import * as Contacts from 'expo-contacts';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { useAuth } from '../stores/auth';
import { fetchContacts, filterUnique, flatPhoneNumbersArr, simplify } from '../helper/contacts';

const ContactsContext = createContext();

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
                    const contactsData = await fetchContacts();

                    if (contactsData.length > 0) {
                        const flattenedContacts = flatPhoneNumbersArr(contactsData);
                        const uniqueContacts = filterUnique(flattenedContacts, user.phoneNumber);
                        const simplifiedContacts = simplify(uniqueContacts);

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

export const useContacts = () => useContext(ContactsContext);
