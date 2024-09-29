import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import UserAvatar from '../components/UserAvatar';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import { useTransaction } from '../context/TransactionContext';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import sliceText from '../helper/sliceText';
import useContactsNamesMap from '../hooks/useContactsNamesMap';
import editNames from '../helper/editNames';
import { useAuth } from '../stores/auth';

const GroupSplitScreen = ({ navigation }) => {
    const contactsNamesMap = useContactsNamesMap();
    const { user } = useAuth();
    const { transactionData, setTransactionData } = useTransaction();
    const [members, setMembers] = useState([]);
    const membersRef = useRef(members); // because `useLayoutEffect` can't access the updated `member` state.

    useEffect(() => {
        const parsedMembers = [];

        for (const member of transactionData.group.members) {
            const memberAmount = transactionData.splitAmong.find(({ user }) => user._id == member._id)?.amount;
            parsedMembers.push({
                amount: memberAmount || 0,
                user: member,
                included: memberAmount && true,
                isAmountManuallyEntered: false,
            });
        }
        setMembers([...parsedMembers]);
    }, []);

    useEffect(() => {
        membersRef.current = members; // Dirty code but required for `useLayoutEffect`. Read: https://tghosh.hashnode.dev/an-in-depth-look-at-closures-in-react
    }, [members]);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={submitSplit}>
                    <Text style={[styles.tabBarText]}>Done</Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const submitSplit = () => {
        let totalSplitAmount = 0;
        const includedMembers = [];

        membersRef.current.forEach((member) => {
            if (member.included) {
                includedMembers.push({
                    user: member.user,
                    amount: member.amount,
                });
                totalSplitAmount += member.amount;
            }
        });

        // Compare with the total transaction amount
        if (totalSplitAmount != transactionData.amount) {
            Alert.alert('Alert', 'The split amounts do not sum up to the total transaction amount.');
            return;
        }

        setTransactionData((prev) => ({
            ...prev,
            splitAmong: includedMembers,
        }));
        navigation.goBack();
    };

    const countIncludedMembers = () => {
        return members.filter((member) => member.included).length;
    };

    const allSelected = () => {
        return countIncludedMembers() === members.length;
    };

    const selectionFraction = () => {
        return `${countIncludedMembers()}/${members.length}`;
    };

    const splitEqually = () => {
        // Count the number of included members
        const includedCount = members.filter((member) => member.included).length;

        if (includedCount === 0) {
            return; // Exit if no members are included
        }

        // Calculate the amount to be assigned to each included member
        const totalAmount = transactionData.amount || 0;
        const equalShare = Math.floor(totalAmount / includedCount);
        let remainder = totalAmount % includedCount;

        // Update the members state
        setMembers((prevMembers) =>
            prevMembers.map((member) => {
                if (member.included) {
                    // Distribute the remainder among the first few members
                    let adjustedAmount = equalShare;
                    if (remainder > 0) {
                        adjustedAmount += 1;
                        remainder--;
                    }
                    return {
                        ...member,
                        amount: adjustedAmount,
                        isAmountManuallyEntered: false,
                    };
                }
                return member;
            }),
        );
    };

    const toggleMemberIncluded = (memberId) => {
        if (!memberId) return;
        setMembers((prevMembers) => {
            const updatedMembers = prevMembers.map((member) => {
                if (member.user._id === memberId) {
                    return {
                        ...member,
                        included: !member.included,
                        isAmountManuallyEntered: member.included ? false : member.isAmountManuallyEntered,
                        amount: member.included ? 0 : member.amount,
                    };
                }
                return member;
            });
            redistributeAmounts(updatedMembers);
            return updatedMembers;
        });
    };

    const redistributeAmounts = (updatedMembers) => {
        const totalAmount = transactionData.amount || 0;

        // Calculate total amount already manually entered by included members
        const manuallyEnteredTotal = updatedMembers.reduce((acc, member) => {
            return member.isAmountManuallyEntered && member.included ? acc + member.amount : acc;
        }, 0);

        // Calculate remaining amount to distribute
        const amountToDistribute = totalAmount - manuallyEnteredTotal;

        // Distribute the remaining amount among the members who haven't manually entered their amounts and are included
        const membersNotEntered = updatedMembers.filter((m) => !m.isAmountManuallyEntered && m.included);
        const perUserPayment = Math.max(Math.floor(amountToDistribute / membersNotEntered.length), 0);
        const remainder = amountToDistribute % membersNotEntered.length;

        let distributedRemainder = 0;
        updatedMembers.forEach((member) => {
            if (!member.isAmountManuallyEntered && member.included) {
                let adjustedAmount = perUserPayment;
                if (distributedRemainder < remainder) {
                    adjustedAmount += 1;
                    distributedRemainder++;
                }
                member.amount = adjustedAmount;
            }
        });
    };

    const handleAmountChange = (amount, id) => {
        const newAmount = Math.max(parseInt(amount) || 0, 0);
        const totalAmount = transactionData.amount || 0;

        let manuallyEnteredTotal = newAmount;
        members.forEach((member) => {
            if (member.isAmountManuallyEntered && member.user._id !== id && member.included) {
                manuallyEnteredTotal += member.amount;
            }
        });

        if (manuallyEnteredTotal > totalAmount) {
            // Handle the case where the total exceeds the limit
            // Reset newAmount or alert the user
            return; // Exit the function or reset newAmount as needed
        }

        setMembers((prevMembers) => {
            const amountToDistribute = totalAmount - manuallyEnteredTotal;
            const membersNotEntered = prevMembers.filter((m) => !m.isAmountManuallyEntered && m.user._id !== id && m.included);
            const perUserPayment = Math.max(Math.floor(amountToDistribute / membersNotEntered.length), 0);
            const remainder = amountToDistribute % membersNotEntered.length;

            let distributedRemainder = 0;
            return prevMembers.map((member) => {
                if (member.user._id === id) {
                    return {
                        ...member,
                        amount: newAmount,
                        isAmountManuallyEntered: true,
                        included: true,
                    };
                } else if (!member.isAmountManuallyEntered && member.included) {
                    let adjustedAmount = perUserPayment;
                    if (distributedRemainder < remainder) {
                        adjustedAmount += 1;
                        distributedRemainder++;
                    }
                    return { ...member, amount: adjustedAmount };
                }
                return member;
            });
        });
    };

    const renderItem = ({ item }) => {
        return (
            <View style={styles.memberContainer}>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: calcWidth(10),
                    }}
                >
                    <TouchableOpacity onPress={() => toggleMemberIncluded(item.user._id)}>
                        <MaterialCommunityIcons
                            name={item.included ? 'checkbox-marked' : 'checkbox-blank-outline'}
                            size={calcWidth(7)}
                            color={item.included ? COLOR.BUTTON : COLOR.TEXT}
                        />
                    </TouchableOpacity>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        <UserAvatar user={item.user} />

                        <Text style={styles.memberName}>{editNames([item.user], user._id, contactsNamesMap)[0].name}</Text>
                    </View>
                </View>

                <View style={styles.rowCentered}>
                    <Text style={styles.amount}>₹</Text>
                    <TextInput
                        style={styles.amount}
                        value={String(item.amount)}
                        onChangeText={(newAmount) => handleAmountChange(newAmount, item.user._id)}
                    />
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>₹{transactionData.amount || 0} Paid by</Text>
                <Pressable
                    onPress={() => navigation.navigate(PAGES.SELECT_PAID_BY)}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap:calcWidth(1),
                        borderWidth: 1,
                        padding: calcHeight(0.5),
                        borderColor: '#D9D9D9',
                        borderRadius: 5,
                    }}
                >
                    <UserAvatar size={2} user={transactionData.paidBy} />

                    <Text
                        style={{
                            color: COLOR.TEXT,
                            fontWeight: 'bold',
                            fontSize: getFontSizeByWindowWidth(12),
                        }}
                    >
                        {sliceText(transactionData.paidBy.name? transactionData.paidBy.name : transactionData.paidBy.phoneNumber, 10)}
                    </Text>
                </Pressable>
            </View>

            <View
                style={{
                    paddingHorizontal: calcWidth(5),
                    paddingBottom: calcHeight(2),
                    marginTop: calcHeight(5),
                    borderBottomColor: 'rgba(255, 255, 255, 0.13)',
                    borderBottomWidth: 1,
                }}
            >
                <Text
                    style={{
                        color: COLOR.TEXT,
                        fontSize: getFontSizeByWindowWidth(15),
                        fontWeight: 'bold',
                    }}
                >
                    Split between
                </Text>
            </View>
            <View style={styles.memberContainer}>
                <TouchableOpacity
                    onPress={() => {
                        if (allSelected()) {
                            members.map((member) => {
                                toggleMemberIncluded(member.user._id);
                            });
                        } else {
                            members.map((member) => {
                                if (!member.included) toggleMemberIncluded(member.user._id);
                            });
                        }
                    }}
                >
                    <MaterialCommunityIcons
                        name={allSelected() ? 'checkbox-marked' : 'checkbox-blank-outline'}
                        size={calcWidth(7)}
                        color={allSelected() ? COLOR.BUTTON : COLOR.TEXT}
                    />
                </TouchableOpacity>
                <Text
                    style={{
                        color: '#FFFFFF',
                    }}
                >
                    {selectionFraction()} Selected
                </Text>
                <TouchableOpacity
                    onPress={() => splitEqually()}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: calcWidth(1),
                    }}
                >
                    <FontAwesome5 name="redo" size={calcWidth(3)} color={COLOR.BUTTON} />
                    <Text
                        style={{
                            color: COLOR.BUTTON,
                        }}
                    >
                        Split Equally
                    </Text>
                </TouchableOpacity>
            </View>
            <FlatList data={members} renderItem={renderItem} keyExtractor={(item) => item.id} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLOR.APP_BACKGROUND,
    },
    header: {
        padding: calcWidth(5),
        alignItems: 'center',
        borderColor: COLOR.BUTTON,
        borderWidth: 1,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: calcHeight(2),
        marginVertical: calcHeight(4),
    },
    headerText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: getFontSizeByWindowWidth(14),
    },
    memberContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: calcHeight(3),
        alignItems: 'center',
    },
    memberName: {
        fontSize: getFontSizeByWindowWidth(15),
        fontWeight: 'bold',
        color: COLOR.TEXT,
        marginLeft: calcWidth(2),
    },
    memberAmount: {
        fontSize: getFontSizeByWindowWidth(15),
        color: COLOR.TEXT,
        fontWeight: 'bold',
    },
    rowCentered: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center',
    },
    amount: {
        alignItems: 'center',
        alignContent: 'center',
        color: COLOR.TEXT,
        fontSize: getFontSizeByWindowWidth(20),
    },
    tabBarText: {
        color: COLOR.BUTTON,
        fontSize: getFontSizeByWindowWidth(15),
    },
});

export default GroupSplitScreen;
