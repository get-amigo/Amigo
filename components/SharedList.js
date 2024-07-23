import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import SharedItem from '../components/SharedItem';
import COLOR from '../constants/Colors';
import TransactionNumberOfVisibleNames from '../constants/TransactionNumberOfVisibleNames';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';

const SharedList = ({ transaction, generateColor, expandNames, setExpandNames }) => {
    const visibleUsers = transaction.splitAmong.slice(0, TransactionNumberOfVisibleNames); // Display only the first 5 users

    return (
        <View>
            <Text style={styles.sharedLabel}>Shared with</Text>
            <View style={styles.sharedContainer}>
                <FlatList
                    data={expandNames ? transaction.splitAmong : visibleUsers}
                    keyExtractor={(item) => item.user._id}
                    renderItem={({ item, index }) => <SharedItem user={item.user} amount={item.amount} generateColor={generateColor} />}
                />
            </View>
        </View>
    );
};

export default SharedList;

const styles = StyleSheet.create({
    sharedLabel: {
        color: COLOR.TEXT,
        fontSize: getFontSizeByWindowWidth(14),
        padding: calcWidth(2),
        backgroundColor: COLOR.BUTTON,
    },
    sharedUser: {
        color: COLOR.TEXT,
        fontSize: getFontSizeByWindowWidth(14),
    },
    sharedDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: calcHeight(1),
        marginHorizontal: calcWidth(5),
    },
});
