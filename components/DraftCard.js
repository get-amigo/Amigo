import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GroupSettings from '../assets/GroupSettings.png';
import COLOR from '../constants/Colors';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
const DraftCard = ({ groupName, dateTime, amount, onPress }) => {
    return (
        <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
            <View style={styles.imageContainer}>
                <Image source={GroupSettings} style={styles.image} />
            </View>
            <View style={[styles.textContainer, groupName ? null : { justifyContent: 'center' }]}>
                {groupName ? <Text style={styles.groupName}>{groupName}</Text> : null}
                <Text style={styles.dateTime}>{dateTime}</Text>
            </View>
            <Text style={styles.amount}>{`₹ ${amount}`}</Text>
        </TouchableOpacity>
    );
};

export default DraftCard;

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: 'row',
        paddingHorizontal: calcWidth(5.6),
        paddingVertical: calcHeight(2),
        backgroundColor: COLOR.APP_BACKGROUND,
        borderBottomColor: COLOR.BORDER_COLOR,
        borderBottomWidth: calcHeight((1 / 844) * 100),
        alignItems: 'center',
    },
    imageContainer: {
        backgroundColor: COLOR.BUTTON,
        borderRadius: calcWidth(100),
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: calcWidth((9 / 390) * 100),
        paddingVertical: calcWidth((12 / 844) * 100),
        marginRight: calcWidth(8),
    },
    image: {
        width: calcWidth((28 / 390) * 100),
        height: calcHeight((36 / 844) * 100),
    },
    textContainer: {
        flex: 1,
        flexDirection: 'column',
        gap: calcHeight((4 / 844) * 100),
        justifyContent: 'center',
    },
    groupName: {
        fontSize: getFontSizeByWindowWidth(16),
        fontWeight: '700',
        color: COLOR.BUTTON,
    },
    dateTime: {
        fontSize: getFontSizeByWindowWidth(12),
        color: COLOR.PRIMARY,
        fontWeight: '400',
    },
    amount: {
        fontSize: getFontSizeByWindowWidth(15),
        fontWeight: '700',
        color: COLOR.PRIMARY,
    },
});
