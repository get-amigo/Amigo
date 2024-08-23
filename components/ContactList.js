import React, { useEffect, useRef } from 'react';
import { FlatList, Keyboard, Pressable, Text, View } from 'react-native';

import COLOR from '../constants/Colors';
import openSettings from '../helper/openSettings';
import { calcWidth } from '../helper/res';
import { useContacts } from '../hooks/useContacts';
import AddMemberWithoutContact from './AddMemberWithoutContact';
import ContactCard from './ContactCard';
import Search from './Search';
import SortArrayWithTargetAndTargetProp from '../helper/sortArrayWithTargetAndTargetProp';
const ContactList = ({ eliminatedContacts }) => {
    const { search, setSearch, contacts, selectedContacts, handleSelectContact, setSelectedContacts, contactPermission } = useContacts();
    const flatListRef = useRef(null);

    useEffect(() => {
        setSelectedContacts([]);
        setSearch('');
    }, []);

    function eliminateContacts() {
        if (!eliminatedContacts) return contacts;

        return contacts.filter((contact) => !eliminatedContacts.map((member) => member.phoneNumber).includes(contact.phoneNumber));
    }

    const handleScroll = () => {
        Keyboard.dismiss();
    };

    return (
        <View>
            <Search search={search} setSearch={setSearch} />
            <View>
                <AddMemberWithoutContact />
            </View>
            {contactPermission ? (
                <FlatList
                    ref={flatListRef}
                    style={{
                        marginTop: calcWidth(1.5),
                    }}
                    data={SortArrayWithTargetAndTargetProp({ arr: eliminateContacts(), target: search, targetProp: 'name' })}
                    keyExtractor={(item) => item.phoneNumber}
                    renderItem={({ item }) => (
                        <Pressable onPress={() => handleSelectContact(item)}>
                            <ContactCard
                                {...item}
                                selected={selectedContacts.some((selected) => selected.phoneNumber === item.phoneNumber)}
                                search={search}
                            />
                        </Pressable>
                    )}
                    showsVerticalScrollIndicator={false}
                    onScroll={handleScroll}
                />
            ) : (
                <Pressable
                    style={{
                        alignContent: 'center',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 1,
                    }}
                    onPress={openSettings}
                >
                    <Text
                        style={{
                            color: COLOR.TEXT,
                        }}
                    >
                        Allow Contact Permission
                    </Text>
                </Pressable>
            )}
        </View>
    );
};

export default ContactList;
