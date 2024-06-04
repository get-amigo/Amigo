import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../stores/auth';
import { useExpense } from '../stores/expense'; // Custom hook for fetching transactions
import ExpenseCard from '../components/ExpenseCard';
import DatePickerSelector from '../components/DatePickerSelector'; // Separate component for date picker
import TypeSelector from '../components/TypeSelector';
import COLOR from '../constants/Colors';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect from React Navigation
import { SafeAreaView } from 'react-native-safe-area-context';

function ExpenseScreen() {
    const { expense, resetParams, loading } = useExpense();

    useFocusEffect(
        useCallback(() => {
            resetParams();
        }, []),
    );

    if (loading)
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.header}>Expense Summary</Text>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        margin: calcWidth(5),
                    }}
                >
                    <View style={styles.selectorContainer}>
                        <TypeSelector />
                        <DatePickerSelector />
                    </View>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: calcWidth(1),
                            backgroundColor: COLOR.SKELETON_MASK_COLOR,
                            borderRadius: 10,
                        }}
                    >
                        <FontAwesome5 name="redo" size={calcWidth(3)} color="rgba(255,255,255,0.66)" style={{ opacity: 0 }} />
                        <Text
                            style={{
                                color: COLOR.TEXT,
                                opacity: 0,
                                fontSize: getFontSizeByWindowWidth(10),
                            }}
                        >
                            Reset
                        </Text>
                    </View>
                </View>
                <FlatList data={[{}, {}, {}]} renderItem={({ item }) => <ExpenseCard item={item} loading />} style={styles.list} />
            </SafeAreaView>
        );
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>Expense Summary</Text>
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    margin: calcWidth(5),
                }}
            >
                <View style={styles.selectorContainer}>
                    <TypeSelector />
                    <DatePickerSelector />
                </View>
                <TouchableOpacity
                    onPress={resetParams}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: calcWidth(1),
                    }}
                >
                    <FontAwesome5 name="redo" size={calcWidth(3)} color="rgba(255,255,255,0.66)" />
                    <Text style={{ color: COLOR.TEXT }}>Reset</Text>
                </TouchableOpacity>
            </View>

            {expense.length === 0 ? (
                <Text style={styles.noTransactionsText}>No Transactions Found</Text>
            ) : (
                <FlatList
                    data={expense}
                    keyExtractor={(item, index) => item.id || index.toString()}
                    renderItem={({ item }) => <ExpenseCard item={item} />}
                    style={styles.list}
                />
            )}
        </SafeAreaView>
    );
}

export default ExpenseScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLOR.APP_BACKGROUND,
    },
    header: {
        fontSize: getFontSizeByWindowWidth(19),
        color: COLOR.TEXT,
        fontWeight: 'bold',
        marginHorizontal: calcHeight(3),
        marginVertical: calcHeight(2),
    },
    selectorContainer: {
        flexDirection: 'row',
        gap: calcWidth(4),
        alignItems: 'center',
    },
    noTransactionsText: {
        fontSize: getFontSizeByWindowWidth(15),
        color: COLOR.TEXT,
        textAlign: 'center',
        marginTop: 20,
    },
    list: {
        // Add styles for your FlatList if needed
    },
    // Add other styles that you might have used in your component
});
