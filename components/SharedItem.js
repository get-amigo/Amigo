import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import COLOR from '../constants/Colors';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';

const SharedItem = ({ user, amount, generateColor }) => {
    return (
        <View style={styles.sharedDetail}>
            <View
                style={[
                    styles.circle,
                    {
                        backgroundColor: generateColor(user._id),
                    },
                ]}
            />
            <Text style={styles.sharedUser}>{user.name}</Text>
            <Text style={styles.sharedAmount}>₹ {parseInt(amount)}</Text>
        </View>
    );
};

export default SharedItem;

const styles = StyleSheet.create({
    circle: {
        width: calcWidth(2),
        height: calcWidth(2),
        borderRadius: calcWidth(2) / 2,
        marginRight: calcWidth(2),
    },
    sharedDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: calcHeight(1.5),
        marginHorizontal: calcWidth(5),
    },
    sharedUser: {
        color: COLOR.TEXT,
        fontSize: getFontSizeByWindowWidth(12),
    },
    sharedAmount: {
        color: COLOR.TEXT,
        fontSize: getFontSizeByWindowWidth(12),
        fontWeight: 'bold',
        marginLeft: 'auto',
    },
});
