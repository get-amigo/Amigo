import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import DatePickerSelector from '../components/DatePickerSelector';
import ExpenseCard from '../components/ExpenseCard';
import TypeSelector from '../components/TypeSelector';
import COLOR from '../constants/Colors';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import { useExpense } from '../stores/expense';

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

    if (loading) {
        return (
            <View style={{ flex: 1 }}>
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
                            Reset Filter
                        </Text>
                    </View>
                </View>
                <FlatList data={[{}, {}, {}]} renderItem={({ item }) => <ExpenseCard item={item} loading />} style={styles.list} />
            </View>
        );
    }

    const isFilterApplied = type || (range.endDate && range.startDate);

    return (
        <View style={{ flex: 1 }}>
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
                    disabled={!isFilterApplied}
                    onPress={resetParams}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: calcWidth(1),
                    }}
                >
                    <FontAwesome5 name="redo" size={calcWidth(3)} color={isFilterApplied ? COLOR.TEXT : COLOR.BUTTON_DISABLED} />
                    <Text style={isFilterApplied ? { color: COLOR.TEXT } : { color: COLOR.BUTTON_DISABLED }}>Reset Filter</Text>
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
        </View>
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
    list: {},
});
