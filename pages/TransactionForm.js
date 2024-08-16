import React, { useEffect, useRef } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Toast from 'react-native-root-toast';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { StackActions } from '@react-navigation/native';

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

function TransactionFormScreen({ navigation, route }) {
    const { transactionData, setTransactionData, resetTransaction, upiParams, setUpiParams, newGroup, setNewGroup } = useTransaction();
    const descriptionRef = useRef();
    const { user } = useAuth();
    const { setGroup } = useGroup();
    const isConnected = useNetwork();
    const { newGroup: routeNewGroup } = route.params || {};

    const addActivityToLocalDB = useGroupActivitiesStore((state) => state.addActivityToLocalDB);
    const updateIsSynced = useGroupActivitiesStore((state) => state.updateIsSynced);

    useEffect(() => {
        if (routeNewGroup) {
            setNewGroup(routeNewGroup);
        }
    }, [routeNewGroup, setNewGroup]);

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

    const remainingCharacters = transactionData?.description ? 100 - transactionData.description.length : 100;

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

        if (!transactionData.description) {
            Alert.alert('Description Missing');
            return;
        }

        try {
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
                const { activityId, relatedId } = addActivityToLocalDB(newActivity, newActivity.relatedId.group._id, user, false, false);
                const newTransactionWithId = { ...newTransaction, activityId, transactionId: relatedId };

                await apiHelper.post('/transaction', newTransactionWithId);
                setUpiParams({});
                updateIsSynced({
                    _id: activityId,
                    group: newActivity.relatedId.group._id,
                });
            } else {
                addActivityToLocalDB(newActivity, newActivity.relatedId.group._id, user, false, true);
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
        <ScrollView style={styles.container} alwaysBounceVertical={false}>
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
                        scrollEnabled
                    />
                </Pressable>
                <Text style={styles.remainingCharacters}>{remainingCharacters} characters left</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.verticalScrollView}>
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

            {getPreviousPageName(navigation) !== PAGES.GROUP && (
                <View>
                    <Pressable
                        style={styles.addGroupBtn}
                        onPress={() => navigation.navigate(PAGES.SELECT_GROUP)}
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
                        onPress={() => navigation.navigate(PAGES.SELECT_PAID_BY)}
                    >
                        <Text style={styles.buttonText}>Paid By {transactionData.paidBy?.name}</Text>
                    </Pressable>
                    <Pressable
                        style={styles.button}
                        onPress={() => navigation.navigate(PAGES.GROUP_SPLIT_SCREEN, { newGroup })}
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
    description: {
        color: 'white',
        paddingHorizontal: calcWidth(3),
    },
    descriptionContainer: {
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: calcWidth(5),
        height: calcHeight(6),
        marginBottom: calcHeight(2),
    },
    remainingCharacters: {
        color: 'gray',
        marginTop: calcHeight(1),
        marginBottom: calcHeight(2),
        textAlign: 'right',
    },
    verticalScrollView: {
        flexDirection: 'row',
        marginBottom: calcHeight(2),
    },
    categoryItem: {
        paddingHorizontal: calcWidth(5),
        paddingVertical: calcHeight(2),
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: calcWidth(2),
        borderRadius: calcWidth(5),
        backgroundColor: COLOR.CATEGORY_BACKGROUND,
    },
    selectedCategory: {
        backgroundColor: COLOR.SELECTED_CATEGORY_BACKGROUND,
    },
    categoryText: {
        color: 'white',
        marginTop: calcHeight(1),
    },
    addGroupBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLOR.ADD_GROUP_BUTTON_BACKGROUND,
        padding: calcWidth(2),
        borderRadius: calcWidth(5),
        marginBottom: calcHeight(2),
    },
    buttonWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        marginLeft: calcWidth(2),
        fontSize: getFontSizeByWindowWidth(14),
    },
    paidByAndSplitContainer: {
        marginBottom: calcHeight(2),
    },
    button: {
        backgroundColor: COLOR.BUTTON_BACKGROUND,
        padding: calcWidth(3),
        borderRadius: calcWidth(5),
        marginBottom: calcHeight(1),
    },
    submitBtnContainer: {
        marginTop: calcHeight(2),
    },
    submitBtn: {
        backgroundColor: COLOR.SUBMIT_BUTTON_BACKGROUND,
        padding: calcWidth(3),
    },
});

export default TransactionFormScreen;
