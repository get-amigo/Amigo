import React, { useEffect, useRef, useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import Toast from 'react-native-root-toast';

import Button from '../components/Button';
import ContactList from '../components/ContactList';
import Loader from '../components/Loader';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import apiHelper from '../helper/apiHelper';
import checkConnectivity from '../helper/getNetworkStateAsync';
import getPreviousPageName from '../helper/getPreviousPageName';
import offlineMessage from '../helper/offlineMessage';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import { useContacts } from '../hooks/useContacts';
import getNamesFromContacts from '../helper/getNamesFromContacts';
import { useTransaction } from '../context/TransactionContext';
import editNames from '../helper/editNames';
import { useAuth } from '../stores/auth';

const CreateGroup = ({ navigation }) => {
    const { selectedContacts } = useContacts();
    const { setTransactionData } = useTransaction();
    const { user } = useAuth();

    const [groupName, setGroupName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const nameRef = useRef();
    const MAX_LEN = 40;
    const createGroupAsync = async () => {
        const isOnline = await checkConnectivity();
        if (!isOnline) {
            offlineMessage();
            return;
        }

        setIsLoading(true);

        try {
            const requestBody = {
                name: groupName,
                phoneNumbers: selectedContacts.map(({ phoneNumber, countryCode }) => ({
                    phoneNumber,
                    countryCode,
                })),
            };
            requestBody.phoneNumbers.push({ phoneNumber: user.phoneNumber, countryCode: user.countryCode });

            const response = await apiHelper.post('/group', requestBody);

            const newGroup = response.data;

            Toast.show(`${groupName} created`, {
                duration: Toast.durations.LONG,
            });

            if (getPreviousPageName(navigation) == PAGES.SELECT_GROUP) {
                const contacts = await getNamesFromContacts();
                const memberPhoneNumbers = [
                    user.phoneNumber, // Add current user's phone number to the list of members
                    ...requestBody.phoneNumbers.map((member) => member.phoneNumber),
                ];

                setTransactionData((prev) => ({
                    ...prev,
                    group: {
                        ...prev.group,
                        ...newGroup,
                        members: newGroup.members.map((memberId, index) => ({
                            _id: memberId,
                            name: editNames([{ _id: memberId, phoneNumber: memberPhoneNumbers[index] }], user._id, contacts)[0].name,
                            phoneNumber: memberPhoneNumbers[index],
                        })),
                    },
                }));

                navigation.navigate(PAGES.ADD_TRANSACTION);
            } else {
                navigation.goBack();
            }
        } catch {
            Toast.show('Error creating group. Please try again.', {
                duration: Toast.durations.LONG,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateGroup = () => {
        const trimmedGroupName = groupName.trim();
        if (!trimmedGroupName && selectedContacts.length === 0) {
            Toast.show('Please Enter group name and select a contact', {
                duration: Toast.durations.LONG,
            });
            setIsError(true);
        } else if (!trimmedGroupName) {
            Toast.show(' Please enter group name', {
                duration: Toast.durations.LONG,
            });
            setIsError(true);
        } else if (selectedContacts.length === 0) {
            Toast.show('Please select a contact', {
                duration: Toast.durations.LONG,
            });
        } else {
            createGroupAsync();
            setIsError(false);
        }
    };

    useEffect(() => {
        if (groupName?.trim().length > 0) {
            setIsError(false);
        }
    }, [groupName]);

    return (
        <>
            {isLoading && <Loader />}
            {!isLoading && (
                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                    <KeyboardAvoidingView
                        style={{
                            flex: 1,
                        }}
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        keyboardVerticalOffset={40}
                    >
                        <View style={styles.container}>
                            <Pressable
                                style={[styles.inputContainer, isError ? { borderColor: '#b0160b' } : { borderColor: 'gray' }]}
                                onPress={() => nameRef.current.focus()}
                            >
                                <TextInput
                                    style={styles.input}
                                    onChangeText={setGroupName}
                                    value={groupName}
                                    placeholder="Group Name"
                                    placeholderTextColor="gray"
                                    ref={nameRef}
                                    maxLength={MAX_LEN}
                                />
                            </Pressable>
                            <View>
                                <Text style={styles.characterCount}>{MAX_LEN - groupName?.length} characters left</Text>
                            </View>
                            <View>
                                <Text style={styles.titleText}>Add members</Text>
                            </View>
                            <View style={styles.contactListContainer}>
                                <ContactList />
                            </View>

                            <View style={styles.button}>
                                <Button
                                    title="Create Group"
                                    onPress={handleCreateGroup}
                                    styleOverwrite={
                                        selectedContacts.length === 0 || groupName === ''
                                            ? { opacity: 0.57, marginTop: 8 }
                                            : { marginTop: 8 }
                                    }
                                />
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </TouchableWithoutFeedback>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: calcWidth(5),
        flex: 1,
        marginBottom: calcWidth(3),
        marginTop: calcWidth(5),
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: calcHeight(1),
        borderBottomWidth: 1,
        borderRadius: 5,
        marginTop: calcHeight(2),
        marginBottom: calcHeight(1),
    },
    input: {
        color: 'white',
        flex: 1,
    },
    titleText: {
        color: COLOR.PRIMARY,
        fontSize: getFontSizeByWindowWidth(15),
        fontWeight: 'bold',
        marginVertical: calcHeight(2),
    },
    contactListContainer: {
        marginTop: calcWidth(3),
        alignItems: 'center',
        flex: 1,
    },
    button: {
        alignItems: 'center',
    },
    characterCount: {
        fontSize: 10,
        color: COLOR.TEXT,
        textAlign: 'right',
    },
});

export default CreateGroup;
