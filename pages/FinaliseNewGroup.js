import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
    Text,
    View,
    StyleSheet,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Pressable,
    TextInput,
    TouchableOpacity,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import apiHelper from '../helper/apiHelper';
import checkConnectivity from '../helper/getNetworkStateAsync';
import getPreviousPageName from '../helper/getPreviousPageName';
import offlineMessage from '../helper/offlineMessage';
import getNamesFromContacts from '../helper/getNamesFromContacts';
import { useTransaction } from '../context/TransactionContext';
import editNames from '../helper/editNames';
import { useAuth } from '../stores/auth';
import { FlatList } from 'react-native-gesture-handler';
import { useContacts } from '../hooks/useContacts';
import { Ionicons } from '@expo/vector-icons';
import Loader from '../components/Loader';
import Toast from 'react-native-root-toast';

function FinaliseNewGroup({ navigation }) {
    const { selectedContacts, setSelectedContacts } = useContacts();
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
                setSelectedContacts(null);
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

    const memoizedSelectedContacts = useMemo(() => selectedContacts, [selectedContacts]);

    useEffect(() => {
        if (groupName?.trim().length > 0) {
            setIsError(false);
        }
    }, [groupName]);

    const renderItem = useCallback(({ item }) => <ContactItem item={item} />, []);

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
                        <SafeAreaView style={styles.container}>
                            <View style={styles.header}>
                                <TouchableOpacity onPress={() => navigation.goBack()}>
                                    <Image source={require('../assets/icons/return.png')} style={{ width: 24, height: 24 }} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleCreateGroup}>
                                    <Text style={styles.titleText}>Next</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.groupIcon}>
                                <Image source={require('../assets/groupIcons/CreateGroup.png')} style={{ width: 90, height: 90 }} />
                                <Text style={styles.groupName}>New Group</Text>
                            </View>
                            <Pressable
                                style={[styles.inputContainer, isError ? { borderColor: '#b0160b' } : { borderColor: 'gray' }]}
                                onPress={() => nameRef.current.focus()}
                            >
                                <TextInput
                                    style={styles.input}
                                    onChangeText={setGroupName}
                                    value={groupName}
                                    placeholder="Enter Group Name here"
                                    placeholderTextColor="gray"
                                    ref={nameRef}
                                    maxLength={MAX_LEN}
                                />
                            </Pressable>
                            <View>
                                <Text style={styles.characterCount}>{MAX_LEN - groupName?.length} characters left</Text>
                            </View>

                            {selectedContacts.length > 0 ? (
                                <View style={styles.contactContainer}>
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
                            ) : null}
                        </SafeAreaView>
                    </KeyboardAvoidingView>
                </TouchableWithoutFeedback>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: calcWidth(6),
        flex: 1,
        marginBottom: calcWidth(3),
        marginTop: calcWidth(4),
    },
    contactContainer: {
        padding: calcWidth(5),
        height: 120,
        marginTop: calcWidth(7),
        borderWidth: 1,
        borderColor: COLOR.BUTTON,
        borderRadius: 10,
    },
    header: {
        marginBottom: calcWidth(2),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    groupIcon: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: calcWidth(4),
    },
    groupName: {
        fontSize: 23,
        color: COLOR.TEXT,
        fontWeight: '500',
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

export default FinaliseNewGroup;
