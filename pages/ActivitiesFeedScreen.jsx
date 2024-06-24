import {
    Pressable,
    StyleSheet,
    Text,
    View,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    TextInput,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import sliceText from '../helper/sliceText';
import getMembersString from '../utility/getMembersString';
import { Image } from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import GroupIcon from '../components/GroupIcon';
import { useGroup } from '../context/GroupContext';
import ScannerIcon from '../assets/icons/scanner.png';
import apiHelper from '../helper/apiHelper';
import useGroupActivitiesStore from '../stores/groupActivitiesStore';
import { useContacts } from '../hooks/useContacts';
import Feed from '../components/Feed';
import useActivities from '../hooks/useActivities';
import checkConnectivity from '../helper/getNetworkStateAsync';
import useSocket from '../hooks/useSocket';
import { useAuth } from '../stores/auth';
import generateUniqueId from '../helper/generateUniqueId';
import { useTransaction } from '../context/TransactionContext';

const ActivitiesFeedScreen = ({ navigation }) => {
    console.log('mounted');
    const { group } = useGroup();
    const { contacts } = useContacts();
    const { user } = useAuth();

    const { isLoading, hasNextPage, fetchNextPage } = useActivities();

    const textRef = useRef();
    const [amount, setAmount] = useState('');

    const { setTransactionData, resetTransaction } = useTransaction();

    // activity store
    const activities = useGroupActivitiesStore((state) => state.activities[group._id]?.activitiesById || {});
    const activityOrder = useGroupActivitiesStore((state) => state.activities[group._id]?.activityOrder || []);
    const hasHydrated = useGroupActivitiesStore((state) => state._hasHydrated);
    const addActivityToLocalDB = useGroupActivitiesStore((state) => state.addActivityToLocalDB);
    const syncAllPendingActivities = useGroupActivitiesStore((state) => state.syncAllPendingActivities);
    const clearPendingActivities = useGroupActivitiesStore((state) => state.clearPendingActivities);

    const addOldActivitiesToLocalDB = useGroupActivitiesStore((state) => state.addOldActivitiesToLocalDB);

    const onReachEnd = () => {
        console.log('END');
        if (hasNextPage && !isLoading) {
            fetchNextPage();
        }
    };

    const handleInputChange = (text) => {
        if (!isNaN(text)) {
            // If it's a number, strip out non-digit characters
            text = text.replace(/[^0-9]/g, '');
        }
        setAmount(text);
    };

    const handleActivitySend = async (message, activityId) => {
        // hendle chats
        // const isOnline = await checkConnectivity();
        const isOnline = true;
        if (isOnline) {
            await apiHelper
                .post(`/group/${group._id}/chat`, {
                    message: message,
                    activityId: activityId,
                })
                .then(() => {
                    console.log('sent');
                    // addActivityToLocalDB(message, group._id, true); not in use
                    console.log('added to local db');
                })
                .catch((err) => {
                    console.error(err);
                });
        } else {
            addActivityToLocalDB({ activityType: 'chat', relatedId: { message: message } }, group._id, user, false);
        }
    };

    const fetchActivity = useCallback(async (activity) => {
        console.log('fetchActivity----------------- ', activity);
        // if (activity.creator._id === user._id) {
        //     return;
        // }
        addActivityToLocalDB(activity, group._id, user, true);
    }, []);

    useSocket('activity created', fetchActivity);

    // useEffect(() => {
    //     async function f() {
    //         const isOnline = await checkConnectivity();
    //         if (isOnline) {
    //             // sync here
    //             syncAllPendingActivities();
    //         }
    //     }
    //     f();
    // }, []);

    // clearPendingActivities();

    return (
        <SafeAreaView style={styles.container}>
            <ImageBackground
                source={require('../assets/chatBackground.png')}
                style={{
                    width: calcWidth(100),
                    height: calcHeight(100),
                    backgroundColor: '#1B1727',
                }}
            >
                {/* Top header */}
                <>
                    <Pressable
                        style={styles.header}
                        onPress={() => {
                            navigation.navigate(PAGES.GROUP_SETTINGS, {
                                // balance: totalBalance != 0,
                                balance: true,
                            });
                        }}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: calcWidth(5),
                            }}
                        >
                            <Pressable onPress={() => navigation.goBack()} style={{ marginLeft: 4 }}>
                                <Ionicons name="chevron-back" size={calcHeight(3)} color="white" />
                            </Pressable>
                            <GroupIcon groupId={group._id} />
                            <View style={styles.groupNameContainer}>
                                <Text style={styles.groupName}>{sliceText(group.name, 25)}</Text>
                                <Text style={styles.groupMembers}>{getMembersString(group.members, 20)}</Text>
                            </View>
                        </View>
                        <Pressable
                            onPress={() => {
                                setTransactionData((prev) => ({
                                    ...prev,
                                    group,
                                }));
                                navigation.navigate(PAGES.SCANNER);
                            }}
                        >
                            <Image
                                source={ScannerIcon}
                                style={{
                                    width: calcHeight(3),
                                    height: calcHeight(3),
                                    marginRight: calcWidth(5),
                                }}
                            />
                        </Pressable>
                    </Pressable>
                </>

                {/* Flat List */}
                <>
                    <FlatList
                        inverted
                        data={activityOrder}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => <Feed {...activities[item]} contacts={contacts} />}
                        style={styles.flatlist}
                        onEndReached={onReachEnd}
                        onEndReachedThreshold={0.5}
                    />
                </>

                {/* Bottom */}
                <>
                    <KeyboardAvoidingView
                        style={{
                            flex: Platform.OS === 'ios' ? 1 : 0,
                            flexDirection: 'row',
                            margin: calcWidth(2),
                            justifyContent: 'space-evenly',
                        }}
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        keyboardVerticalOffset={calcHeight(9)}
                    >
                        <Pressable
                            style={[
                                styles.inputContainer,
                                {
                                    width: !isNaN(amount) ? calcWidth(60) : calcWidth(75),
                                },
                            ]}
                            onPress={() => textRef.current.focus()}
                        >
                            <TextInput
                                style={styles.input}
                                placeholderTextColor="#ccc"
                                ref={textRef}
                                placeholder="Enter the amount"
                                textAlign="center"
                                value={amount}
                                onChangeText={handleInputChange}
                            />
                        </Pressable>
                        {!isNaN(amount) ? (
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => {
                                    // syncAllPendingActivities();

                                    setAmount('');
                                    resetTransaction();
                                    setTransactionData((prev) => ({
                                        ...prev,
                                        group,
                                        amount,
                                    }));
                                    navigation.navigate(PAGES.ADD_TRANSACTION);
                                }}
                            >
                                <Text style={styles.buttonText}>+ Expense</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={() => handleActivitySend(amount, generateUniqueId())}
                                style={{
                                    height: calcHeight(5),
                                    justifyContent: 'center',
                                }}
                            >
                                <AntDesign name="enter" size={calcHeight(4)} color={COLOR.BUTTON} />
                            </TouchableOpacity>
                        )}
                    </KeyboardAvoidingView>
                </>
            </ImageBackground>
        </SafeAreaView>
    );
};

export default ActivitiesFeedScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLOR.APP_BACKGROUND,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: calcHeight(2.1),
        backgroundColor: COLOR.APP_BACKGROUND,
        shadowRadius: 0.5,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowColor: '#000000',
        elevation: 2,
    },
    groupName: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: getFontSizeByWindowWidth(12),
    },
    groupMembers: {
        color: '#A5A5A5',
        fontSize: getFontSizeByWindowWidth(11),
    },

    flatlist: {
        flex: 1,
        // backgroundColor: 'red',
    },
    bottom: {
        // flex: Platform.OS === 'ios' ? 1 : 0,
        flex: 0.1,
        backgroundColor: 'green',
    },

    wrapper1: { flex: 1 },
    wrapper2: { flex: 1 },

    input: {
        backgroundColor: 'black',
        borderRadius: calcWidth(2),
        borderColor: 'gray',
        borderWidth: 1,
        color: 'white',
        fontSize: getFontSizeByWindowWidth(12),
    },

    inputContainer: {
        color: 'white',
        width: calcWidth(60),
        height: calcHeight(5),
        borderRadius: calcWidth(2),
        alignContent: 'center',
    },
    button: {
        width: calcWidth(25),
        height: calcHeight(5),
        borderRadius: calcWidth(2),
        backgroundColor: COLOR.BUTTON,
        elevation: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: getFontSizeByWindowWidth(12),
        color: 'white',
        alignItems: 'center',
    },
});
