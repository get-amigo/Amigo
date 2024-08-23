import { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import getNamesFromContacts from '../helper/getNamesFromContacts';

const useContactsNamesMap = () => {
    const [contactsNamesMap, setContactsNamesMap] = useState([]);

    useFocusEffect(() => {
        async function fetchContacts() {
            const data = await getNamesFromContacts();
            setContactsNamesMap(data);
        }
        fetchContacts();
    });

    return contactsNamesMap;
};

export default useContactsNamesMap;
