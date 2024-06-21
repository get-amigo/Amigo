import { Ionicons, AntDesign, SimpleLineIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
    Text,
    StyleSheet,
    SafeAreaView,
    View,
    Pressable,
    FlatList,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Image,
    ImageBackground,
    Platform,
} from 'react-native';

import LoginIcon from '../assets/Login.png';
import ChatBackground from '../assets/chatBackground.png';
import ScannerIcon from '../assets/icons/scanner.png';
import BalanceGroupPin from '../components/BalanceGroupPin';
import FabIcon from '../components/FabIcon';
import Feed from '../components/Feed';
import GroupIcon from '../components/GroupIcon';
import Loader from '../components/Loader';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import { useGroup } from '../context/GroupContext';
import { useTransaction } from '../context/TransactionContext';
import apiHelper from '../helper/apiHelper';
import editNames from '../helper/editNames';
import checkConnectivity from '../helper/getNetworkStateAsync';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import sliceText from '../helper/sliceText';
import { useContacts } from '../hooks/useContacts';
import useSocket from '../hooks/useSocket';
import { useAuth } from '../stores/auth';
import useGroupActivities from '../stores/groupActivities';
import getMembersString from '../utility/getMembersString';
import groupBalancesAndCalculateTotal from '../utility/groupBalancesAndCalculateTotal';
import syncAllChat from '../utility/syncAllChat';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';

function isNumber(text) {
    return !isNaN(+text);
}

function GroupScreen({ navigation }) {
    const { group } = useGroup();
    const textRef = useRef();
    const { activities, setActivities } = useGroupActivities(group._id);
    const { setTransactionData, resetTransaction } = useTransaction();
    const [amount, setAmount] = useState('');
    const { contacts } = useContacts();
    const { user } = useAuth();
    const [totalBalance, setTotalBalance] = useState();
    const [balances, setBalances] = useState();

    const { fetchNextPage, hasNextPage } = useInfiniteQuery({
        queryKey: ['group', group._id],
        queryFn: async ({ pageParam = null }) => {
            let data;

            if (!pageParam) {
                const res = await apiHelper(`/activity-feed?groupId=${group._id}`);
                data = res.data;
            } else {
                const res = await apiHelper(`/activity-feed?groupId=${group._id}&lastActivityTime=${pageParam}`);
                data = res.data;
            }

            setActivities((prev) => [...prev, ...data]);
            return data;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.length == 0) return null;
            return lastPage[lastPage.length - 1].createdAt;
        },
    });

    useQuery({
        queryKey: ['balance', group._id],
        enabled: !!group._id,
        queryFn: async () => {
            const { data } = await apiHelper(`/balance/${group._id}`);
            if (data.length == 0) {
                setTotalBalance(0);
                return;
            }
            const { groups } = await groupBalancesAndCalculateTotal(data, user._id);
            setTotalBalance(groups[0].totalBalance);
            setBalances(groups[0]);
            return groups;
        },
    });

    const { mutate: addChat } = useMutation({
        mutationFn: async (msg) => {
            const isOnline = await checkConnectivity();
            if (isOnline) {
                await apiHelper.post(`/group/${group._id}/chat`, {
                    message: msg,
                });

                return true;
            }

            return false;
        },
        onMutate: () => {
            setAmount('');
            setActivities((prev) => [
                {
                    activityType: 'chat',
                    createdAt: Date(),
                    creator: { _id: user._id },
                    group: group._id,
                    onModel: 'Chat',
                    relatedId: {
                        message: amount,
                    },
                    synced: false,
                    offlineId: 'temp',
                },
                ...prev,
            ]);
            return amount;
        },
        onSuccess: (data) => {
            if (data) {
                setActivities((prev) => {
                    const index = prev.findIndex((activity) => activity.offlineId === 'temp');
                    prev[index].synced = true;
                    prev[index].offlineId = undefined;
                    return prev;
                });
            }
        },
        onError: (error, variables, context) => {
            console.error('Error adding chat:', error);
            setActivities((prev) => {
                const index = prev.findIndex((activity) => activity.offlineId === 'temp');
                prev[index].synced = false;
                prev[index].offlineId = undefined;
                return prev;
            });
        },
    });

    const fetchActivity = useCallback(async (activity) => {
        if (activity.creator._id === user._id) {
            return;
        }
        setActivities((prev) => [activity, ...prev]);
    }, []);

    useSocket('activity created', fetchActivity);

    const handleInputChange = (text) => {
        if (isNumber(text)) {
            // If it's a number, strip out non-digit characters
            text = text.replace(/[^0-9]/g, '');
        }
        setAmount(text);
    };

    return (
        <SafeAreaView style={styles.container}>
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
                    <Pressable onPress={() => navigation.goBack()}>
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

            <BalanceGroupPin totalBalance={totalBalance} balances={balances} />
            <FlatList
                inverted
                data={activities}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => <Feed {...item} contacts={contacts} />}
                style={{
                    height: calcHeight(totalBalance != 0 ? 65 : 70),
                }}
                onEndReachedThreshold={0.5}
                onEndReached={() => {
                    if (hasNextPage) {
                        fetchNextPage();
                    }
                }}
            />
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
                            width: isNumber(amount) ? calcWidth(60) : calcWidth(75),
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
                {isNumber(amount) ? (
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => {
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
                        onPress={() => addChat(amount)}
                        style={{
                            height: calcHeight(5),
                            justifyContent: 'center',
                        }}
                    >
                        <AntDesign name="enter" size={calcHeight(4)} color={COLOR.BUTTON} />
                    </TouchableOpacity>
                )}
            </KeyboardAvoidingView>
            <Image
                source={ChatBackground}
                style={{
                    position: 'absolute',
                    zIndex: -100,
                    height: calcHeight(90),
                    bottom: 0,
                    backgroundColor: 'black',
                    width: calcWidth(100),
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLOR.APP_BACKGROUND,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: calcHeight(8),
        backgroundColor: COLOR.APP_BACKGROUND,
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
    inputContainer: {
        color: 'white',
        width: calcWidth(60),
        height: calcHeight(5),
        borderRadius: calcWidth(2),
        alignContent: 'center',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: calcWidth(2),
        color: 'white',
        fontSize: getFontSizeByWindowWidth(10),
    },
});

// 9. Export Statement
export default GroupScreen;
