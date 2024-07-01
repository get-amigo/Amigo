import {
    Pressable,
    StyleSheet,
    Text,
    View,
    ImageBackground,
    Platform,
    TextInput,
    FlatList,
    StatusBar,
    KeyboardAvoidingView,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import sliceText from '../helper/sliceText';
import getMembersString from '../utility/getMembersString';
import { Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GroupIcon from '../components/GroupIcon';
import { useGroup } from '../context/GroupContext';
import ScannerIcon from '../assets/icons/scanner.png';
import apiHelper from '../helper/apiHelper';
import useGroupActivitiesStore from '../stores/groupActivitiesStore';
import { useContacts } from '../hooks/useContacts';
import Feed from '../components/Feed';
import useActivities from '../hooks/useActivities';
import useSocket from '../hooks/useSocket';
import { useAuth } from '../stores/auth';
import generateUniqueId from '../helper/generateUniqueId';
import { useTransaction } from '../context/TransactionContext';
import useNetwork from '../hooks/useNetwork';
import BalanceGroupPin from '../components/BalanceGroupPin';
import groupBalancesAndCalculateTotal from '../utility/groupBalancesAndCalculateTotal';
import { FontAwesome } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';

function areDatesEqual(date1, date2) {
    const date1Day = date1.getDate();
    const date1Month = date1.getMonth();
    const date1Year = date1.getFullYear();

    const date2Day = date2.getDate();
    const date2Month = date2.getMonth();
    const date2Year = date2.getFullYear();

    return date1Day === date2Day && date1Month === date2Month && date1Year === date2Year;
}

const ActivitiesFeedScreen = ({ navigation }) => {
    console.log('mounted');
    const { group } = useGroup();
    const { contacts } = useContacts();
    const { user } = useAuth();
    const isConnected = useNetwork();

    const [totalBalance, setTotalBalance] = useState();
    const [balances, setBalances] = useState();
    const [isExpenseBtnVisible, setIsExpenseBtnVisible] = useState(true);

    const { isLoading, hasNextPage, fetchNextPage, handleItemLayout, shouldFetch } = useActivities();

    const textRef = useRef();
    const [amount, setAmount] = useState('');

    const { setTransactionData, resetTransaction } = useTransaction();

    const flatListRef = useRef(null);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);

    const handleScroll = useCallback((event) => {
        const yOffset = event.nativeEvent.contentOffset.y;
        setShowScrollToBottom(yOffset > 100);
    }, []);

    const scrollToBottom = useCallback(() => {
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }, []);

    // activity store
    const activities = useGroupActivitiesStore((state) => state.activities[group._id]?.activitiesById || {});
    const activityOrder = useGroupActivitiesStore((state) => state.activities[group._id]?.activityOrder || []);
    const hasHydrated = useGroupActivitiesStore((state) => state._hasHydrated);
    const addActivityToLocalDB = useGroupActivitiesStore((state) => state.addActivityToLocalDB);
    const syncAllPendingActivities = useGroupActivitiesStore((state) => state.syncAllPendingActivities);
    const updateIsSynced = useGroupActivitiesStore((state) => state.updateIsSynced);

    useEffect(() => {
        async function fetchBalance() {
            try {
                const { data } = await apiHelper(`/balance/${group._id}`);
                if (data.length === 0) {
                    setTotalBalance(0);
                    return;
                }

                const { groups } = await groupBalancesAndCalculateTotal(data, user._id);
                setTotalBalance(groups[0].totalBalance);
                setBalances(groups[0]);
            } catch (error) {
                console.error(error);
            }
        }

        if (group._id) {
            fetchBalance();
        }
    }, [activities]);

    useEffect(() => {
        // handle fetch
        if (shouldFetch && hasNextPage && !isLoading) {
            fetchNextPage();
        }
    }, [shouldFetch, hasNextPage, isLoading]);

    const handleInputChange = useCallback((text) => {
        if (text.length === 0) {
            setIsExpenseBtnVisible(false);
        } else if (!isNaN(text) && Number(text) > 0) {
            setIsExpenseBtnVisible(true);
        } else {
            setIsExpenseBtnVisible(false);
        }
        setAmount(text);
    }, []);

    const handleActivitySend = async (message) => {
        // hendle chats
        console.log('isConnected ====================;;;;;;;;;;;;;------------', isConnected);
        setAmount('');
        if (message.replace(/^\s+|\s+$/g, '') == '') {
            return;
        }
        if (isConnected) {
            const { activityId, otherId } = addActivityToLocalDB(
                { activityType: 'chat', relatedId: { message: message } },
                group._id,
                user,
                false,
                false,
            );
            await apiHelper
                .post(`/group/${group._id}/chat`, {
                    message: message,
                    activityId: activityId,
                    chatId: otherId,
                })
                .then(() => {
                    console.log('sent');
                    updateIsSynced({
                        _id: activityId,
                        group: group._id,
                    });
                    console.log('added to local db');
                })
                .catch((err) => {
                    console.error(err);
                });
        } else {
            addActivityToLocalDB({ activityType: 'chat', relatedId: { message: message } }, group._id, user, false, true);
        }
    };

    const fetchActivity = useCallback(async (activity) => {
        console.log('fetchActivity---------------- ', activity);
        if (activity.creator._id === user._id) {
            // updateIsSynced(activity); we can keey here but not necessary
        } else {
            console.log(' [[[[[[[[[[[[[[[[[[[[[[ caling else ]]]]]]]]]]]]]]]]]]]]]]]]]');
            addActivityToLocalDB(activity, activity.group, user, true);
        }
    }, []);

    useSocket('activity created', fetchActivity);

    useEffect(() => {
        async function f() {
            if (isConnected) {
                // sync here
                syncAllPendingActivities();
            }
        }
        f();
    }, [isConnected]);

    // clearPendingActivities();

    return (
        <SafeAreaView style={styles.container}>
            <ImageBackground
                source={require('../assets/chatBackground_new.png')}
                style={{
                    width: calcWidth(100),
                    height: '100%',
                    marginTop: StatusBar.currentHeight,
                    position: 'absolute',
                }}
            />
            <KeyboardAvoidingView
                style={{
                    flex: 1,
                }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={25}
            >
                {/* Top header */}
                <>
                    <Pressable
                        style={styles.header}
                        onPress={() => {
                            navigation.navigate(PAGES.GROUP_SETTINGS, {
                                balance: totalBalance != 0,
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
                <>
                    <BalanceGroupPin totalBalance={totalBalance} balances={balances} />
                </>

                {/* Flat List */}
                <>
                    <View style={{ flex: 1 }}>
                        <FlatList
                            ref={flatListRef}
                            inverted
                            data={activityOrder}
                            keyExtractor={(item) => item}
                            renderItem={({ item, index }) => {
                                const currentCreator = activities[item].creator;
                                const previousCreator =
                                    index < activityOrder.length - 1 ? activities[activityOrder[index + 1]].creator : null;
                                const showCreator = !previousCreator || currentCreator._id !== previousCreator._id;

                                const currentDate = new Date(activities[item].createdAt);
                                const previousDate =
                                    index < activityOrder.length - 1 ? new Date(activities[activityOrder[index + 1]].createdAt) : null;

                                const showDate = !previousDate || !areDatesEqual(currentDate, previousDate);
                                return (
                                    <View onLayout={() => handleItemLayout(item)}>
                                        <Feed {...activities[item]} contacts={contacts} showCreator={showCreator} showDate={showDate} />
                                    </View>
                                );
                            }}
                            style={{ flex: 1 }}
                            onScroll={handleScroll}
                        />
                        {showScrollToBottom && (
                            <Pressable style={styles.scrollToBottomButton} onPress={scrollToBottom}>
                                <FontAwesome6 name="angles-down" size={calcWidth(5)} color="white" />
                            </Pressable>
                        )}
                    </View>
                </>

                {/* Bottom */}

                <View
                    style={{
                        marginTop: calcWidth(2),
                    }}
                >
                    {/* <View style={styles.payContainer}>
                    will be required when we add "Pay to XYZ rs. 500 feature"
                    <Pressable style={styles.payBtn}>
                        <Text
                            style={{
                                color: 'white',
                                fontSize: getFontSizeByWindowWidth(11),
                                fontWeight: '500',
                            }}
                        >
                            Pay Binny ₹100
                        </Text>
                    </Pressable>
                </View> */}
                    <View style={styles.bottomContainer}>
                        <Pressable
                            style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                paddingHorizontal: calcWidth(2),
                                display: !isExpenseBtnVisible ? 'flex' : 'none',
                            }}
                            onPress={() => setIsExpenseBtnVisible(true)}
                        >
                            <FontAwesome name="angle-right" size={getFontSizeByWindowWidth(27)} color="white" />
                        </Pressable>
                        <Pressable
                            style={[styles.button, { display: isExpenseBtnVisible ? 'flex' : 'none' }]}
                            onPress={() => {
                                setAmount('');
                                resetTransaction();
                                // If it's a number, strip out non-digit characters
                                let amt = parseInt(amount);
                                if (amt <= 0) {
                                    amt = '';
                                }
                                console.log('amt,', amt);
                                setTransactionData((prev) => ({
                                    ...prev,
                                    group,
                                    amount: amt ? '' + amt : '',
                                }));
                                navigation.navigate(PAGES.ADD_TRANSACTION);
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: getFontSizeByWindowWidth(21),
                                    color: 'white',
                                    marginRight: 4,
                                }}
                            >
                                +
                            </Text>
                            <Text style={styles.buttonText}> Expense</Text>
                        </Pressable>
                        <View style={styles.textInputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholderTextColor="#ccc"
                                placeholder="Message..."
                                value={amount}
                                onChangeText={handleInputChange}
                                onFocus={() => setIsExpenseBtnVisible(false)}
                                onBlur={() => {
                                    if (amount === '') {
                                        setIsExpenseBtnVisible(true);
                                    }
                                }}
                            />
                            <Pressable style={styles.sendBtn} onPress={() => handleActivitySend(amount)}>
                                <Ionicons name="send" size={24} color="#663CAB" />
                            </Pressable>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
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

    textInputContainer: {
        flex: 1,
        borderWidth: 1,
        borderRadius: calcWidth(3),
        borderColor: 'white',
        paddingHorizontal: calcWidth(2),
        flexDirection: 'row',
    },

    input: {
        color: 'white',
        fontSize: getFontSizeByWindowWidth(12),
        flex: 1,
        margin: 'auto',
    },

    bottomContainer: {
        borderTopLeftRadius: calcWidth(3),
        borderTopRightRadius: calcWidth(3),
        color: 'white',
        alignContent: 'center',
        justifyContent: 'space-between',
        padding: calcWidth(5),
        flexDirection: 'row',
        gap: calcWidth(3),
        backgroundColor: '#272239',
        minHeight: calcWidth(21),
    },
    button: {
        borderRadius: calcWidth(3),
        backgroundColor: '#663CAB',
        elevation: 3,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: calcWidth(4),
        paddingVertical: calcWidth(1.2),
        flexDirection: 'row',
    },
    buttonText: {
        fontSize: getFontSizeByWindowWidth(12),
        color: 'white',
        alignItems: 'center',
    },
    sendBtn: {
        marginLeft: calcWidth(1),
        justifyContent: 'center',
        alignItems: 'center',
    },
    payContainer: {
        paddingVertical: calcWidth(5),
        justifyContent: 'center',
    },
    payBtn: {
        margin: 'auto',
        paddingVertical: calcWidth(3),
        paddingHorizontal: calcWidth(4),
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: calcWidth(6),
    },
    scrollToBottomButton: {
        position: 'absolute',
        right: calcWidth(4),
        bottom: calcWidth(4),
        backgroundColor: '#272239',
        borderRadius: calcWidth(6),
        padding: calcWidth(2.4),
        zIndex: 100,
    },
});
