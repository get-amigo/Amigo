import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect from React Navigation
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DatePickerSelector from '../components/DatePickerSelector'; // Separate component for date picker
import ExpenseCard from '../components/ExpenseCard';
import TypeSelector from '../components/TypeSelector';
import COLOR from '../constants/Colors';
import safeAreaStyle from '../constants/safeAreaStyle';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import { useExpense } from '../stores/expense'; // Custom hook for fetching transactions

function ExpenseScreen() {
    const { expense, resetParams, loading, fetchExpense, type, range } = useExpense();
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            resetParams();
        }, []),
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchExpense();
        setRefreshing(false);
    }, []);

    if (loading)
        return (
            <SafeAreaView style={safeAreaStyle}>
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
        <SafeAreaView style={safeAreaStyle}>
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
                {type || (range.endDate && range.startDate) ? (
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
                ) : (
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: calcWidth(1),
                        }}
                    >
                        <FontAwesome5 name="redo" size={calcWidth(3)} color="#595957" />
                        <Text style={{ color: '#595957' }}>Reset</Text>
                    </View>
                )}
            </View>

            {expense.length === 0 ? (
                <Text style={styles.noTransactionsText}>No Transactions Found</Text>
            ) : (
                <FlatList
                    data={expense}
                    keyExtractor={(item, index) => item.id || index.toString()}
                    renderItem={({ item }) => <ExpenseCard item={item} />}
                    style={styles.list}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[COLOR.REFRESH_INDICATOR_ARROW]}
                            tintColor={COLOR.REFRESH_INDICATOR_COLOR_IOS}
                            progressBackgroundColor={COLOR.REFRESH_INDICATOR_BACKGROUND}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
}

export default ExpenseScreen;

const styles = StyleSheet.create({
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
