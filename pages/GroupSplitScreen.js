import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTransaction } from '../context/TransactionContext';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import sliceText from '../helper/sliceText';
import { FontAwesome5 } from '@expo/vector-icons';
import UserAvatar from '../components/UserAvatar';

const GroupSplitScreen = ({ navigation }) => {
    const { transactionData, setTransactionData } = useTransaction();
    const [members, setMembers] = useState([]);
    const membersRef = useRef(members);

    useEffect(() => {
        const parsedMembers = transactionData.group.members.map((member) => {
            const memberAmount = transactionData.splitAmong.find(({ user }) => user._id === member._id)?.amount;
            return {
                amount: memberAmount || 0,
                user: member,
                included: !!memberAmount,
                isAmountManuallyEntered: false,
            };
        });
        setMembers(parsedMembers);
    }, [transactionData]);

    useEffect(() => {
        membersRef.current = members;
    }, [members]);

    const countIncludedMembers = () => members.filter((member) => member.included).length;
    const allSelected = () => countIncludedMembers() === members.length;
    const selectionFraction = () => `${countIncludedMembers()}/${members.length}`;

    const submitSplit = () => {
        const includedMembers = members.filter((member) => member.included);
        const totalSplitAmount = includedMembers.reduce((acc, member) => acc + member.amount, 0);

        if (totalSplitAmount !== transactionData.amount) {
            alert('The split amounts do not sum up to the total transaction amount.');
            return;
        }

        setTransactionData((prev) => ({
            ...prev,
            splitAmong: includedMembers,
        }));
        navigation.goBack();
    };

    const splitEqually = () => {
        const includedMembers = members.filter((member) => member.included);
        if (includedMembers.length === 0) return;

        const totalAmount = transactionData.amount;
        const equalShare = Math.floor(totalAmount / includedMembers.length);
        let remainder = totalAmount % includedMembers.length;

        setMembers((prevMembers) =>
            prevMembers.map((member) => {
                if (member.included) {
                    const adjustedAmount = equalShare + (remainder > 0 ? 1 : 0);
                    remainder = Math.max(0, remainder - 1);
                    return { ...member, amount: adjustedAmount, isAmountManuallyEntered: false };
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
                        isAmountManuallyEntered: !member.included && member.isAmountManuallyEntered,
                        amount: !member.included ? 0 : member.amount,
                    };
                }
                return member;
            });
            redistributeAmounts(updatedMembers);
            return updatedMembers;
        });
    };

    const redistributeAmounts = (updatedMembers) => {
        const totalAmount = transactionData.amount;
        const manuallyEnteredTotal = updatedMembers.reduce(
            (acc, member) => (member.isAmountManuallyEntered && member.included ? acc + member.amount : acc),
            0,
        );
        const amountToDistribute = totalAmount - manuallyEnteredTotal;
        const membersNotEntered = updatedMembers.filter((member) => !member.isAmountManuallyEntered && member.included);
        const perUserPayment = Math.floor(amountToDistribute / membersNotEntered.length);
        const remainder = amountToDistribute % membersNotEntered.length;

        let distributedRemainder = 0;
        setMembers((prevMembers) =>
            prevMembers.map((member) => {
                if (!member.isAmountManuallyEntered && member.included) {
                    const adjustedAmount = perUserPayment + (distributedRemainder < remainder ? 1 : 0);
                    distributedRemainder = Math.max(0, distributedRemainder - 1);
                    return { ...member, amount: adjustedAmount };
                }
                return member;
            }),
        );
    };

    const handleAmountChange = (amount, id) => {
        const newAmount = Math.max(parseInt(amount) || 0, 0);
        const totalAmount = transactionData.amount;
        const manuallyEnteredTotal = members.reduce(
            (acc, member) => (member.isAmountManuallyEntered && member.user._id !== id && member.included ? acc + member.amount : acc),
            newAmount,
        );

        if (manuallyEnteredTotal > totalAmount) return;

        setMembers((prevMembers) => {
            const amountToDistribute = totalAmount - manuallyEnteredTotal;
            const membersNotEntered = prevMembers.filter(
                (member) => !member.isAmountManuallyEntered && member.user._id !== id && member.included,
            );
            const perUserPayment = Math.floor(amountToDistribute / membersNotEntered.length);
            const remainder = amountToDistribute % membersNotEntered.length;

            let distributedRemainder = 0;
            return prevMembers.map((member) => {
                if (member.user._id === id) {
                    return { ...member, amount: newAmount, isAmountManuallyEntered: true, included: true };
                }
                if (!member.isAmountManuallyEntered && member.included) {
                    const adjustedAmount = perUserPayment + (distributedRemainder < remainder ? 1 : 0);
                    distributedRemainder = Math.max(0, distributedRemainder - 1);
                    return { ...member, amount: adjustedAmount };
                }
                return member;
            });
        });
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={submitSplit}>
                    <Text style={styles.tabBarText}>Done</Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const renderItem = ({ item }) => (
        <View style={styles.memberContainer}>
            <View style={styles.memberInfo}>
                <TouchableOpacity onPress={() => toggleMemberIncluded(item.user._id)}>
                    <MaterialCommunityIcons
                        name={item.included ? 'checkbox-marked' : 'checkbox-blank-outline'}
                        size={calcWidth(7)}
                        color={item.included ? COLOR.BUTTON : COLOR.TEXT}
                    />
                </TouchableOpacity>
                <View style={styles.memberDetails}>
                    <UserAvatar user={item.user} />
                    <Text style={styles.memberName}>{item.user.name}</Text>
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

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>₹{transactionData.amount || 0} Paid by</Text>
                <Pressable onPress={() => navigation.navigate(PAGES.SELECT_PAID_BY)} style={styles.paidByButton}>
                    <UserAvatar size={2} user={transactionData.paidBy} />
                    <Text style={styles.paidByText}>{sliceText(transactionData.paidBy.name, 7)}</Text>
                </Pressable>
            </View>
            <View style={styles.splitHeader}>
                <Text style={styles.splitHeaderText}>Split between</Text>
            </View>
            <View style={styles.memberSelection}>
                <TouchableOpacity
                    onPress={() => {
                        const toggleAll = allSelected()
                            ? members.map((member) => toggleMemberIncluded(member.user._id))
                            : members.map((member) => !member.included && toggleMemberIncluded(member.user._id));
                    }}
                >
                    <MaterialCommunityIcons
                        name={allSelected() ? 'checkbox-marked' : 'checkbox-blank-outline'}
                        size={calcWidth(7)}
                        color={allSelected() ? COLOR.BUTTON : COLOR.TEXT}
                    />
                </TouchableOpacity>
                <Text style={styles.selectionText}>{selectionFraction()} Selected</Text>
                <TouchableOpacity onPress={splitEqually} style={styles.splitEquallyButton}>
                    <FontAwesome5 name="redo" size={calcWidth(3)} color={COLOR.BUTTON} />
                    <Text style={styles.splitEquallyText}>Split Equally</Text>
                </TouchableOpacity>
            </View>
            <FlatList data={members} renderItem={renderItem} keyExtractor={(item) => item.user._id} />
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
    paidByButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        padding: calcHeight(0.5),
        borderColor: '#D9D9D9',
        borderRadius: 5,
    },
    paidByText: {
        color: COLOR.TEXT,
        fontWeight: 'bold',
        fontSize: getFontSizeByWindowWidth(12),
    },
    splitHeader: {
        paddingHorizontal: calcWidth(5),
        paddingBottom: calcHeight(2),
        marginTop: calcHeight(5),
        borderBottomColor: 'rgba(255, 255, 255, 0.13)',
        borderBottomWidth: 1,
    },
    splitHeaderText: {
        color: COLOR.TEXT,
        fontSize: getFontSizeByWindowWidth(15),
        fontWeight: 'bold',
    },
    memberSelection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: calcHeight(3),
    },
    selectionText: {
        color: '#FFFFFF',
    },
    splitEquallyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: calcWidth(1),
    },
    splitEquallyText: {
        color: COLOR.BUTTON,
    },
    memberContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: calcHeight(3),
        alignItems: 'center',
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: calcWidth(10),
    },
    memberDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    memberName: {
        fontSize: getFontSizeByWindowWidth(15),
        fontWeight: 'bold',
        color: COLOR.TEXT,
        marginLeft: calcWidth(2),
    },
    rowCentered: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center',
    },
    amount: {
        color: COLOR.TEXT,
        fontSize: getFontSizeByWindowWidth(20),
    },
    tabBarText: {
        color: COLOR.BUTTON,
        fontSize: getFontSizeByWindowWidth(15),
    },
});

export default GroupSplitScreen;
