import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, Pressable, Alert, Keyboard } from 'react-native';
import ContactCard from './ContactCard';
import Search from './Search';
import { useContacts } from '../hooks/useContacts';
import { calcHeight } from '../helper/res';
import openSettings from '../helper/openSettings';
import { Button } from 'react-native-paper';
import COLOR from '../constants/Colors';
import AddMemberWithoutContact from './AddMemberWithoutContact';

const ContactList = ({ eliminatedContacts }) => {
    const { search, setSearch, contacts, selectedContacts, handleSelectContact, setSelectedContacts, contactPermission } = useContacts();
    const [isContactFound, setIsContactFound] = useState(true);
    const flatListRef = useRef(null);

    useEffect(() => {
        setSelectedContacts([]);
        setSearch('');
    }, []);

    useEffect(() => {
        if (contacts.length == 0) {
            setIsContactFound(false);
        } else {
            setIsContactFound(true);
        }
    }, [contacts]);

    function eliminateContacts() {
        if (!eliminatedContacts) return contacts;

        return contacts.filter((contact) => !eliminatedContacts.map((member) => member.phoneNumber).includes(contact.phoneNumber));
    }

    function askPermission() {
        Alert.alert('Permission Required', 'We need permission to access your contacts to add people to the group', [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'Open Settings',
                onPress: openSettings,
            },
        ]);
    }

    const handleScroll = () => {
        Keyboard.dismiss();
    };

    return (
        <View>
            <Search search={search} setSearch={setSearch} />
            <View>
                <AddMemberWithoutContact isContactFound={isContactFound} search={search} />
            </View>
            {contactPermission ? (
                <FlatList
                    ref={flatListRef}
                    style={
                        {
                            // marginTop: calcHeight(1),
                        }
                    }
                    data={eliminateContacts()}
                    keyExtractor={(item) => item.phoneNumber}
                    renderItem={({ item }) => (
                        <Pressable onPress={() => handleSelectContact(item)}>
                            <ContactCard
                                {...item}
                                selected={selectedContacts.some((selected) => selected.phoneNumber === item.phoneNumber)}
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
