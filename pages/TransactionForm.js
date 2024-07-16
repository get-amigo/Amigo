import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Pressable } from 'react-native';
import Toast from 'react-native-root-toast';
import { StackActions } from '@react-navigation/native';

import AmountInput from '../components/AmountInput';
import Button from '../components/Button';
import Loader from '../components/Loader';
import Categories from '../constants/Categories';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import { useTransaction } from '../context/TransactionContext';
import apiHelper from '../helper/apiHelper';
import checkConnectivity from '../helper/getNetworkStateAsync';
import getPreviousPageName from '../helper/getPreviousPageName';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import { useAuth } from '../stores/auth';
import { useGroup } from '../context/GroupContext';
import useGroupActivities, { useGroupActivitiesStore } from '../stores/groupActivities';

function TransactionFormScreen({ navigation }) {
    const [loading, setIsLoading] = useState(false);
    const { transactionData, setTransactionData, resetTransaction, upiParams, setUpiParams } = useTransaction();
    const descriptionRef = useRef();
    const { user } = useAuth();
    const { setGroup } = useGroup();

    const { setActivitiesHash, getActivities } = useGroupActivitiesStore();

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

    // const remainingCharacters = 100 - transactionData.description.length;
    const remainingCharacters = transactionData && transactionData.description ? 100 - transactionData.description.length : 100;

    const handleCategorySelect = (category) => {
        setTransactionData((prev) => ({
            ...prev,
            type: category,
        }));
    };

    const handleSubmit = async () => {
        if (!transactionData.amount) {
            alert('Amount Missing');
            return;
        }

        if (Object.keys(transactionData.group).length === 0) {
            alert('Group not added');
            return;
        }

        if (!transactionData.type) {
            alert('Category Missing');
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

            const activities = Array.from(getActivities(newTransaction.group));
            setActivitiesHash(newTransaction.group, [newActivity, ...activities]);

            const isOnline = await checkConnectivity();

            if (isOnline) {
                apiHelper
                    .post('/transaction', newTransaction)
                    .then((res) => {
                        setActivitiesHash(newTransaction.group, [
                            {
                                ...newActivity,
                                synced: true,
                            },
                            ...activities,
                        ]);
                    })
                    .catch((err) => {
                        console.log('error', err);
                        Alert.alert('Error', JSON.stringify(err));
                    });
            }

            if (upiParams.receiverId) {
                setUpiParams((prev) => ({
                    ...prev,
                    am: newActivity.amount,
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

    return loading ? (
        <Loader />
    ) : (
        <ScrollView style={styles.container}>
            <AmountInput amount={transactionData.amount} handleInputChange={(text) => handleInputChange('amount', text)} isTextInput />

            <View style={styles.rowCentered}>
                <Pressable style={styles.descriptionContainer} onPress={() => descriptionRef.current.focus()}>
                    <TextInput
                        style={styles.description}
                        onChangeText={(text) => handleInputChange('description', text)}
                        value={transactionData.description}
                        placeholder="Description"
                        placeholderTextColor="#ccc"
                        ref={descriptionRef}
                        textAlign="center"
                        maxLength={100}
                        multiline={true}
                    />
                </Pressable>
                <Text style={styles.remainingCharacters}>{remainingCharacters} characters left</Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    marginVertical: calcHeight(3),
                }}
            >
                {Categories.map((item, index) => (
                    <Pressable
                        key={index}
                        style={[
                            styles.categoryItem,
                            transactionData.type === item.name && styles.selectedCategory,
                            {
                                borderColor: '#4D426C',
                                borderWidth: 1,
                                borderRadius: 10,
                                marginHorizontal: calcWidth(1),
                            },
                        ]}
                        onPress={() => handleCategorySelect(item.name)}
                    >
                        {item.icon}
                        <Text style={[styles.categoryText]}>{item.name}</Text>
                    </Pressable>
                ))}
            </ScrollView>
            {getPreviousPageName(navigation) != PAGES.GROUP && (
                <View>
                    <Pressable
                        style={{
                            backgroundColor: '#302B49',
                            padding: calcWidth(4),
                            borderRadius: 8,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                        onPress={() => {
                            navigation.navigate(PAGES.SELECT_GROUP);
                        }}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                        >
                            <MaterialIcons name="group-add" size={calcWidth(8)} color="white" />
                            <Text
                                style={{
                                    color: 'white',
                                    paddingLeft: calcWidth(2),
                                }}
                            >
                                {transactionData.group?.name || 'Add Group'}
                            </Text>
                        </View>
                        <AntDesign name="right" size={calcWidth(5)} color="white" />
                    </Pressable>
                </View>
            )}
            {transactionData.group?.members?.length > 0 && (
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}
                >
                    <Pressable
                        style={{
                            backgroundColor: '#302B49',
                            padding: calcWidth(4),
                            borderRadius: 8,
                            flexDirection: 'row',
                            justifyContent: 'space-evenly',
                            marginTop: calcHeight(2),
                            width: calcWidth(40),
                        }}
                        onPress={() => {
                            navigation.navigate(PAGES.SELECT_PAID_BY);
                        }}
                    >
                        <Text
                            style={{
                                color: 'white',
                            }}
                        >
                            Paid By {transactionData.paidBy?.name}
                        </Text>
                    </Pressable>
                    <Pressable
                        style={{
                            backgroundColor: '#302B49',
                            padding: calcWidth(4),
                            borderRadius: 8,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-evenly',
                            marginTop: calcHeight(2),
                            width: calcWidth(40),
                        }}
                        onPress={() => {
                            navigation.navigate(PAGES.GROUP_SPLIT_SCREEN);
                        }}
                    >
                        <Text
                            style={{
                                color: 'white',
                            }}
                        >
                            Split Equally
                        </Text>
                    </Pressable>
                </View>
            )}
            <View
                style={{
                    alignItems: 'center',
                }}
            >
                <Button
                    styleOverwrite={{
                        width: calcWidth(90),
                        marginTop: calcHeight(2),
                    }}
                    onPress={handleSubmit}
                    title="Submit"
                />
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
        flex: 1,
        color: 'white',
    },
    descriptionContainer: {
        flexDirection: 'row',
        alignSelf: 'center',
        padding: calcWidth(3),
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        width: calcWidth(30),
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
    },
    categoryText: {
        color: COLOR.TEXT,
        fontSize: getFontSizeByWindowWidth(12),
        paddingHorizontal: calcWidth(1),
    },
    selectedCategory: {
        backgroundColor: '#4D426C',
        borderRadius: 10,
        color: COLOR.TEXT,
    },
});

export default TransactionFormScreen;
