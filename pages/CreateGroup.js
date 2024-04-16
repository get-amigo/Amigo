import React, { useState, useRef } from 'react';
import { View, Text, SafeAreaView, TextInput, Pressable, StyleSheet } from 'react-native';
import Toast from 'react-native-root-toast';

import Button from '../components/Button';
import ContactList from '../components/ContactList';
import Loader from '../components/Loader';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import { useTransaction } from '../context/TransactionContext';
import apiHelper from '../helper/apiHelper';
import editNamesAsync from '../helper/editNamesAsync';
import checkConnectivity from '../helper/getNetworkStateAsync';
import getPreviousPageName from '../helper/getPreviousPageName';
import offlineMessage from '../helper/offlineMessage';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import { useContacts } from '../hooks/useContacts';
import { useAuth } from '../stores/auth';

const CreateGroup = ({ navigation }) => {
    const { selectedContacts } = useContacts();
    const [groupName, setGroupName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { setTransactionData } = useTransaction();
    const { user } = useAuth();
    const nameRef = useRef();

    const createGroupAsync = async () => {
        const isOnline = await checkConnectivity();
        if (!isOnline) {
            offlineMessage();
            return;
        }
        setIsLoading(true);
        const phoneNumbers = selectedContacts.map(({ phoneNumber }) => ({
            phoneNumber,
            countryCode: '+91',
        }));
        const { data } = await apiHelper.post('/group', {
            name: groupName,
            phoneNumbers,
        });
        Toast.show(`${groupName} created`, {
            duration: Toast.durations.LONG,
        });
        if (getPreviousPageName(navigation) == PAGES.SELECT_GROUP) navigation.navigate(PAGES.ADD_TRANSACTION);
        else navigation.goBack();
    };

    return (
        <>
            {isLoading && <Loader />}
            {!isLoading && (
                <SafeAreaView style={styles.container}>
                    <View style={{ marginHorizontal: calcWidth(5) }}>
                        <Text style={styles.heading}>New group</Text>
                        <Pressable style={styles.inputContainer} onPress={() => nameRef.current.focus()}>
                            <TextInput
                                style={styles.input}
                                onChangeText={setGroupName}
                                value={groupName}
                                placeholder="Group Name"
                                placeholderTextColor="gray"
                                ref={nameRef}
                            />
                        </Pressable>
                        <View>
                            <Text style={styles.titleText}>Add members</Text>
                        </View>
                        <View style={styles.contactListContainer}>
                            <ContactList />
                        </View>

                        <View style={styles.button}>
                            <Button
                                title="Create Group"
                                onPress={
                                    selectedContacts.length === 0 || groupName === ''
                                        ? () =>
                                              Toast.show('Select a contact', {
                                                  duration: Toast.durations.LONG,
                                              })
                                        : createGroupAsync
                                }
                                styleOverwrite={selectedContacts.length === 0 || groupName === '' ? { opacity: 0.57 } : {}}
                            />
                        </View>
                    </View>
                </SafeAreaView>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLOR.APP_BACKGROUND,
    },
    heading: {
        color: COLOR.PRIMARY,
        marginVertical: calcHeight(2),
        fontSize: getFontSizeByWindowWidth(20),
        fontWeight: 'bold',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: calcHeight(1),
        borderBottomWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        marginVertical: calcHeight(2),
    },
    input: {
        color: 'white',
    },
    titleText: {
        color: COLOR.PRIMARY,
        fontSize: getFontSizeByWindowWidth(15),
        fontWeight: 'bold',
        marginVertical: calcHeight(2),
    },
    contactListContainer: {
        margin: calcWidth(5),
        alignItems: 'center',
        height: calcHeight(50),
    },
    button: {
        alignItems: 'center',
    },
});

export default CreateGroup;
