import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { StackActions } from '@react-navigation/native';
import React, { useEffect, useRef } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Toast from 'react-native-root-toast';

import AmountInput from '../components/AmountInput';
import Button from '../components/Button';
import Categories from '../constants/Categories';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import { useGroup } from '../context/GroupContext';
import { useTransaction } from '../context/TransactionContext';
import apiHelper from '../helper/apiHelper';
import getPreviousPageName from '../helper/getPreviousPageName';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import useNetwork from '../hooks/useNetwork';
import { useAuth } from '../stores/auth';
import useGroupActivitiesStore from '../stores/groupActivitiesStore';
import { useBalance } from '../stores/balance';
function TransactionFormScreen({ navigation }) {
    const { transactionData, setTransactionData, resetTransaction, upiParams, setUpiParams } = useTransaction();
    const descriptionRef = useRef();
    const { user } = useAuth();
    const { setGroup } = useGroup();
    const isConnected = useNetwork();
    const { updateBalances } = useBalance();
    const addActivityToLocalDB = useGroupActivitiesStore((state) => state.addActivityToLocalDB);
    const updateIsSynced = useGroupActivitiesStore((state) => state.updateIsSynced);

    useEffect(() => {
        const { group } = transactionData;
        if (group && group.members) {
            const totalMembers = group.members.length;
            const perUserPayment = Math.floor(transactionData.amount / totalMembers);
            const remainder = transactionData.amount % totalMembers;

            setTransactionData((prev) => ({
                ...prev,
                splitAmong: group.members.map((user, index) => ({
                    amount: perUserPayment + (index < remainder ? 1 : 0),
                    user,
                    paidBy: { _id: user?._id, name: 'You' },
                })),
            }));
        }
    }, [transactionData.amount, transactionData.group]);

    useEffect(() => {
        setTransactionData((prev) => ({
            ...prev,
            paidBy: { _id: user?._id, name: 'You' },
        }));
    }, [transactionData.group]);

    useEffect(() => {
        if (upiParams.am) {
            setTransactionData((prev) => ({
                ...prev,
                amount: upiParams.am || '',
                description: upiParams.description || '',
            }));
        }
        return () => {
            resetTransaction();
        };
    }, []);

    const handleInputChange = (field, value) => {
        if (value.length <= 100) {
            setTransactionData((prev) => ({
                ...prev,
                [field]: value,
            }));
        }
    };

    const remainingCharacters = transactionData && transactionData.description ? 100 - transactionData.description.length : 100;

    const handleCategorySelect = (category) => {
        setTransactionData((prev) => ({
            ...prev,
            type: category,
        }));
    };

    const handleSubmit = async () => {
        if (!transactionData.amount) {
            Alert.alert('Amount Missing');
            return;
        }

        if (Object.keys(transactionData.group).length === 0) {
            Alert.alert('Group not added');
            return;
        }

        if (!transactionData.type) {
            Alert.alert('Category Missing');
            return;
        }

        try {
            // Create a new object with modifications, leaving original transactionData unchanged
            const newTransaction = {
                ...transactionData,
                amount: parseInt(transactionData.amount, 10),
                group: transactionData.group._id,
                paidBy: transactionData.paidBy._id,
                splitAmong: transactionData.splitAmong.map((user) => ({
                    amount: user.amount,
                    user: user.user._id || user.user.id,
                })),
                description: transactionData.description || ' ',
            };
            const newActivity = {
                relatedId: {
                    ...newTransaction,
                    group: transactionData.group,
                    paidBy: transactionData.paidBy,
                    splitAmong: transactionData.splitAmong.map((user) => ({
                        amount: user.amount,
                        user: transactionData.group.members.find((member) => member._id === (user.user._id || user.user.id)),
                    })),
                },
                creator: { _id: user._id, name: 'You' },
                synced: false,
                createdAt: new Date(),
                activityType: 'transaction',
            };

            if (isConnected) {
                const { activityId, relatedId } = addActivityToLocalDB({
                    activity: newActivity,
                    groupId: newActivity.relatedId.group._id,
                    user: user,
                    isSynced: false,
                    addToPending: false,
                });
                const newTransactionWithId = { ...newTransaction, activityId, transactionId: relatedId };
                apiHelper
                    .post('/transaction', newTransactionWithId)
                    .then((value) => {
                        const transactionHistory = value.data.transactionHistory;
                        updateBalances(transactionHistory, user._id);
                        setUpiParams({});
                        //                         setActivitiesHash(newTransaction.group, [
                        //                             {
                        //                                 ...newActivity,
                        //                                 synced: true,
                        //                             },
                        //                             ...activities,
                        //                         ]);
                        updateIsSynced({
                            _id: activityId,
                            group: newActivity.relatedId.group._id,
                        });
                    })
                    .catch((err) => {
                        console.log('error in api post', err);
                        Alert.alert('Error', JSON.stringify(err));
                    });
            } else {
                addActivityToLocalDB({
                    activity: newActivity,
                    groupId: newActivity.relatedId.group._id,
                    user: user,
                    isSynced: false,
                    addToPending: true,
                });
            }

            if (upiParams.receiverId) {
                setUpiParams((prev) => ({
                    ...prev,
                    am: transactionData.amount.toString(),
                }));
                navigation.navigate(PAGES.UPI_APP_SELECTION);
                return;
            }
            Toast.show('Transaction Added', {
                duration: Toast.durations.LONG,
            });
            setGroup(transactionData.group);

            const pushAction = StackActions.push(PAGES.TAB_NAVIGATOR, {});
            navigation.dispatch(pushAction);

            navigation.navigate(PAGES.GROUP);
        } catch (error) {
            console.log('error', error);
            Alert.alert('Error', JSON.stringify(error));
        }
    };

    return (
        <ScrollView style={styles.container} alwaysBounceVertical={false} keyboardShouldPersistTaps="always">
            <AmountInput amount={transactionData.amount} handleInputChange={(text) => handleInputChange('amount', text)} isTextInput />

            <View style={styles.rowCentered}>
                <Pressable style={styles.descriptionContainer} onPress={() => descriptionRef.current.focus()}>
                    <TextInput
                        ref={descriptionRef}
                        style={styles.description}
                        onChangeText={(text) => handleInputChange('description', text)}
                        value={transactionData.description}
                        placeholder="Description"
                        placeholderTextColor="gray"
                        textAlign={transactionData?.description?.length === 0 ? 'left' : 'center'}
                        maxLength={100}
                        multiline
                        scrollEnabled
                    />
                </Pressable>
                <Text style={styles.remainingCharacters}>{remainingCharacters} characters left</Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.verticalScrollView}
                keyboardShouldPersistTaps="always"
            >
                {Categories.map((item, index) => (
                    <Pressable
                        key={index}
                        style={[styles.categoryItem, transactionData.type === item.name && styles.selectedCategory]}
                        onPress={() => handleCategorySelect(item.name)}
                    >
                        {item.icon}
                        <Text style={styles.categoryText}>{item.name}</Text>
                    </Pressable>
                ))}
            </ScrollView>
            {getPreviousPageName(navigation) != PAGES.GROUP && (
                <View>
                    <Pressable
                        style={styles.addGroupBtn}
                        onPress={() => {
                            navigation.navigate(PAGES.SELECT_GROUP);
                        }}
                    >
                        <View style={styles.buttonWrapper}>
                            <MaterialIcons name="group-add" size={calcWidth(8)} color="white" />
                            <Text style={styles.buttonText}>{transactionData.group?.name || 'Add Group'}</Text>
                        </View>
                        <AntDesign name="right" size={calcWidth(5)} color="white" />
                    </Pressable>
                </View>
            )}
            {transactionData.group?.members?.length > 0 && (
                <View style={styles.paidByAndSplitContainer}>
                    <Pressable
                        style={styles.button}
                        onPress={() => {
                            navigation.navigate(PAGES.SELECT_PAID_BY);
                        }}
                    >
                        <Text style={styles.buttonText}>Paid By {transactionData.paidBy?.name}</Text>
                    </Pressable>
                    <Pressable
                        style={styles.button}
                        onPress={() => {
                            navigation.navigate(PAGES.GROUP_SPLIT_SCREEN);
                        }}
                    >
                        <Text style={styles.buttonText}>Split Equally</Text>
                    </Pressable>
                </View>
            )}
            <View style={styles.submitBtnContainer}>
                <Button styleOverwrite={styles.submitBtn} onPress={handleSubmit} title="Submit" />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: calcWidth(5),
        backgroundColor: COLOR.APP_BACKGROUND,
    },
    rowCentered: {
        justifyContent: 'center',
    },
    amount: {
        color: COLOR.TEXT,
        fontSize: getFontSizeByWindowWidth(50),
        lineHeight: calcHeight(8),
        fontWeight: 'bold',
    },
    description: {
        color: 'white',
        paddingHorizontal: calcWidth(3),
    },
    descriptionContainer: {
        alignSelf: 'center',
        padding: calcWidth(2.2),
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        minWidth: calcWidth(30),
        maxWidth: calcWidth(65),
        maxHeight: calcWidth(25),
        justifyContent: 'center',
        alignItems: 'center',
    },
    remainingCharacters: {
        color: COLOR.BUTTON,
        fontSize: getFontSizeByWindowWidth(10),
        alignSelf: 'center',
        paddingTop: calcHeight(1),
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: calcWidth(3),
        paddingVertical: calcHeight(0.5),
        borderColor: COLOR.CATEGORY_BORDER_AND_HIGHLIGHT_COLOR,
        borderWidth: 1,
        borderRadius: 10,
        marginHorizontal: calcWidth(1),
    },
    categoryText: {
        color: COLOR.TEXT,
        fontSize: getFontSizeByWindowWidth(12),
        paddingHorizontal: calcWidth(1),
    },
    selectedCategory: {
        backgroundColor: COLOR.CATEGORY_BORDER_AND_HIGHLIGHT_COLOR,
        borderRadius: 10,
        color: COLOR.TEXT,
    },
    verticalScrollView: {
        marginVertical: calcHeight(3),
    },
    addGroupBtn: {
        backgroundColor: COLOR.PRESSABLE_BACKGROUND,
        padding: calcWidth(4),
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    buttonWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        paddingLeft: calcWidth(2),
    },
    paidByAndSplitContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        backgroundColor: COLOR.PRESSABLE_BACKGROUND,
        padding: calcWidth(4),
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: calcHeight(2),
        width: calcWidth(40),
    },
    submitBtnContainer: {
        alignItems: 'center',
    },
    submitBtn: {
        width: calcWidth(90),
        marginTop: calcHeight(2),
    },
});

export default TransactionFormScreen;
