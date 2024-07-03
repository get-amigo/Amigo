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

function convertToCustomFormatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (areDatesEqual(today, date)) {
        return 'Today';
    } else if (areDatesEqual(yesterday, date)) {
        return 'Yesterday';
    }
    const dateOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-IN', dateOptions);
    return formattedDate;
}

const StickyDate = ({ isStickyDateVisible }) => {
    return (
        isStickyDateVisible && (
            <View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'transparent',
                    padding: 2,
                    zIndex: 100,
                    alignItems: 'center',
                }}
            >
                <Text
                    style={{
                        color: 'white',
                        paddingHorizontal: calcWidth(2.4),
                        paddingVertical: calcWidth(1.2),
                        borderRadius: calcWidth(3.6),
                        fontSize: getFontSizeByWindowWidth(10.7),
                        fontWeight: '400',
                        backgroundColor: '#272239',
                    }}
                >
                    {/* {convertToCustomFormatDate(createdAt)} */}
                    27 May 2024
                </Text>
            </View>
        )
    );
};

const ActivitiesFeedScreen = ({ navigation }) => {
    const { group } = useGroup();
    const { contacts } = useContacts();
    const { user } = useAuth();
    const isConnected = useNetwork();

    const [totalBalance, setTotalBalance] = useState();
    const [balances, setBalances] = useState();
    const [isExpenseBtnVisible, setIsExpenseBtnVisible] = useState(true);
    const [isStickyDateVisible, setIsStickyDateVisible] = useState(false);

    const { isLoading, hasNextPage, fetchNextPage, handleItemLayout, shouldFetch } = useActivities();

    const [amount, setAmount] = useState('');

    const { setTransactionData, resetTransaction } = useTransaction();

    const flatListRef = useRef(null);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);

    const handleScroll = useCallback((event) => {
        const yOffset = event.nativeEvent.contentOffset.y;
        setShowScrollToBottom(yOffset > 100);
        setIsStickyDateVisible(yOffset > 50);
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
                    updateIsSynced({
                        _id: activityId,
                        group: group._id,
                    });
                })
                .catch((err) => {
                    console.error(err);
                });
        } else {
            addActivityToLocalDB({ activityType: 'chat', relatedId: { message: message } }, group._id, user, false, true);
        }
    };

    const fetchActivity = useCallback(async (activity) => {
        if (activity.creator._id !== user._id) {
            addActivityToLocalDB(activity, activity.group, user, true);
        }
    }, []);

    useSocket('activity created', fetchActivity);

    useEffect(() => {
        async function f() {
            if (isConnected) {
                syncAllPendingActivities();
            }
        }
        f();
    }, [isConnected]);

    return (
        <>
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
                keyboardVerticalOffset={40}
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
                        <StickyDate isStickyDateVisible={isStickyDateVisible} />
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
                                <FontAwesome6 name="angles-down" size={calcWidth(3.5)} color="white" />
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
                        **** will be required when we add "Pay to XYZ rs. 500 feature" ****
                        <Pressable style={styles.payBtn}>
                            <Text
                                style={{
                                    color: 'white',
                                    fontSize: getFontSizeByWindowWidth(10.7),
                                    fontWeight: '600',
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
                                    fontSize: getFontSizeByWindowWidth(15),
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
                        </View>
                        <Pressable style={styles.sendBtn} onPress={() => handleActivitySend(amount)}>
                            <Ionicons name="send" size={calcWidth(5.5)} color="white" />
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </>
    );
};

export default ActivitiesFeedScreen;

const styles = StyleSheet.create({
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
        borderRadius: calcWidth(5.5),
        paddingHorizontal: calcWidth(3),
        flexDirection: 'row',
        backgroundColor: '#272239',
    },

    input: {
        color: 'white',
        fontSize: getFontSizeByWindowWidth(10.7),
        flex: 1,
        margin: 'auto',
        fontWeight: '400',
    },

    bottomContainer: {
        borderTopLeftRadius: calcWidth(3),
        borderTopRightRadius: calcWidth(3),
        alignContent: 'center',
        padding: calcWidth(5),
        flexDirection: 'row',
        gap: calcWidth(2),
        backgroundColor: '#111016',
        minHeight: calcWidth(21),
    },
    button: {
        borderRadius: calcWidth(6.2),
        backgroundColor: '#663CAB',
        elevation: 3,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: calcWidth(3.8),
        paddingVertical: calcWidth(2.5),
        flexDirection: 'row',
    },
    buttonText: {
        fontSize: getFontSizeByWindowWidth(10.7),
        color: 'white',
        alignItems: 'center',
        fontWeight: '400',
    },
    sendBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#8740FD',
        width: calcWidth(10.3),
        height: calcWidth(10.3),
        borderRadius: calcWidth(5.5),
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
        borderColor: '#9566CF',
        borderRadius: calcWidth(6),
    },
    scrollToBottomButton: {
        position: 'absolute',
        right: calcWidth(4),
        bottom: calcWidth(4),
        backgroundColor: '#272239',
        borderRadius: calcWidth(5),
        paddingHorizontal: calcWidth(2.8),
        paddingVertical: calcWidth(2.5),
        zIndex: 100,
    },
});
