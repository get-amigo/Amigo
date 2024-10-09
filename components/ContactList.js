import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { FlatList, Keyboard, Pressable, Text, View, StyleSheet, TouchableOpacity } from 'react-native';

import COLOR from '../constants/Colors';
import openSettings from '../helper/openSettings';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import sortArrayWithTargetAndTargetProp from '../helper/sortArrayWithTargetAndTargetProp';
import { useContacts } from '../hooks/useContacts';
import AddMemberWithoutContact from './AddMemberWithoutContact';
import ContactCard from './ContactCard';
import Search from './Search';
import { Ionicons } from '@expo/vector-icons';

const ContactList = ({ eliminatedContacts, addMemberWithoutContact }) => {
    const { search, setSearch, contacts, selectedContacts, handleSelectContact, setSelectedContacts, contactPermission } = useContacts();

    const flatListRef = useRef(null);

    useEffect(() => {
        setSelectedContacts([]);
        setSearch('');
    }, []);

    const eliminateContacts = useCallback(() => {
        if (!eliminatedContacts) return contacts;
        return contacts.filter((contact) => !eliminatedContacts.some((member) => member.phoneNumber === contact.phoneNumber));
    }, [contacts, eliminatedContacts]);

    const handleScroll = useCallback(() => {
        Keyboard.dismiss();
    }, []);

    const discardContact = useCallback((phoneNumber) => {
        setSelectedContacts((prevContacts) => prevContacts.filter((contact) => contact.phoneNumber !== phoneNumber));
    }, []);

    const truncateText = useCallback((text, maxLength) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength) + '..';
    }, []);

    const ContactItem = useCallback(
        ({ item }) => (
            <Pressable style={styles.contactBox}>
                <TouchableOpacity style={styles.discard} onPress={() => discardContact(item.phoneNumber)}>
                    <Ionicons name="close" size={15} color="white" />
                </TouchableOpacity>
                <View style={[styles.contactCard, { backgroundColor: item.color || '#CCCCCC' }]}>
                    <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                        {item.name ? item.name[0] : 'U'}
                    </Text>
                </View>
                <Text style={styles.lowerName} numberOfLines={1} ellipsizeMode="tail">
                    {truncateText(item.name || item.phoneNumber || '', 10)}
                </Text>
            </Pressable>
        ),
        [discardContact, truncateText],
    );

    const keyExtractor = useCallback((item) => {
        if (item && item.id) return item.id.toString();
        if (item && item.phoneNumber) return item.phoneNumber;
        console.warn('Invalid item in contact list:', item);
        return Math.random().toString();
    }, []);

    const getItemLayout = useCallback(
        (data, index) => ({
            length: 80,
            offset: 80 * index,
            index,
        }),
        [],
    );

    const renderItem = useCallback(({ item }) => <ContactItem item={item} />, []);

    const memoizedSelectedContacts = useMemo(() => selectedContacts, [selectedContacts]);

    const renderMainList = useCallback(
        ({ item }) => (
            <Pressable onPress={() => handleSelectContact(item)}>
                <ContactCard
                    {...item}
                    selected={selectedContacts.some((selected) => selected.phoneNumber === item.phoneNumber)}
                    search={search}
                />
            </Pressable>
        ),
        [handleSelectContact, selectedContacts, search],
    );

    const sortedContacts = useMemo(
        () =>
            sortArrayWithTargetAndTargetProp({
                arr: eliminateContacts(),
                target: search,
                targetProp: 'name',
            }),
        [eliminateContacts, search],
    );

    return (
        <View>
            <Search search={search} setSearch={setSearch} />
            {selectedContacts.length > 0 && (
                <View style={styles.container}>
                    <FlatList
                        data={memoizedSelectedContacts}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                        getItemLayout={getItemLayout}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                        windowSize={5}
                        maxToRenderPerBatch={5}
                        updateCellsBatchingPeriod={30}
                        removeClippedSubviews={true}
                    />
                </View>
            )}

            {addMemberWithoutContact && <AddMemberWithoutContact />}
            <Text style={styles.allContactsText}>All Contacts</Text>

            {contactPermission ? (
                <FlatList
                    keyboardShouldPersistTaps="always"
                    ref={flatListRef}
                    style={styles.mainList}
                    data={sortedContacts}
                    keyExtractor={keyExtractor}
                    renderItem={renderMainList}
                    showsVerticalScrollIndicator={false}
                    onScroll={handleScroll}
                />
            ) : (
                <Pressable style={styles.permissionButton} onPress={openSettings}>
                    <Text style={styles.permissionText}>Allow Contact Permission</Text>
                </Pressable>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: calcWidth(5),
        height: 120,
        marginTop: calcWidth(7),
        borderWidth: 1,
        borderColor: COLOR.BUTTON,
        borderRadius: 10,
    },
    listContent: {
        paddingHorizontal: 0,
        height: 80,
        columnGap: calcHeight(2),
    },
    contactCard: {
        borderRadius: 100,
        // padding: 10,
        marginRight: 10,
        width: 50,
        justifyContent: 'center',
        height: 50,
        alignItems: 'center',
    },
    lowerName: {
        color: COLOR.LIGHT_GRAY,
        fontSize: 12,
    },
    discard: {
        position: 'absolute',
        top: 0,
        right: 10,
        backgroundColor: COLOR.BUTTON,
        padding: 3,
        borderRadius: 30,
        zIndex: 10,
    },
    contactBox: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        rowGap: calcHeight(1),
        position: 'relative',
    },
    name: {
        fontWeight: '500',
        marginBottom: 5,
        color: '#000',
        fontSize: 20,
    },
    phoneNumber: {
        color: '#333',
    },
    allContactsText: {
        color: COLOR.LIGHT_GRAY,
        fontSize: getFontSizeByWindowWidth(12),
        marginVertical: calcWidth(6),
    },
    mainList: {
        marginTop: calcWidth(1.5),
    },
    permissionButton: {
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    permissionText: {
        color: COLOR.TEXT,
    },
});

export default React.memo(ContactList);
