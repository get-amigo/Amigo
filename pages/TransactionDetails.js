import { Entypo } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import CalendarIcon from '../assets/icons/calendar.png';
import AmountInput from '../components/AmountInput';
import SharedList from '../components/SharedList';
import TransactionDetailsButton from '../components/TransactionDetailsButton';
import { getCategoryIcon } from '../constants/Categories';
import COLOR from '../constants/Colors';
import TransactionNumberOfVisibleNames from '../constants/TransactionNumberOfVisibleNames';
import formatDateToDDMMYYYY from '../helper/formatDateToDDMMYYYY';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import sliceText from '../helper/sliceText';
import useCustomColor from '../hooks/useCustomColor';

const TransactionDetail = ({
    route: {
        params: { transaction },
    },
}) => {
    const [date, setDate] = useState();
    const [expandNames, setExpandNames] = useState(false);

    const generateColor = useCustomColor();

    useEffect(() => {
        setDate(new Date(transaction.date));
    }, [transaction]);

    return (
        <ScrollView alwaysBounceVertical={false}>
            <View
                style={{
                    alignItems: 'center',
                    marginTop: calcHeight(5),
                }}
            >
                <AmountInput amount={transaction.amount} isTextInput={false} />
                <Text
                    style={{
                        fontSize: getFontSizeByWindowWidth(14),
                        color: COLOR.TEXT,
                    }}
                >
                    {sliceText(transaction.description, 40)}
                </Text>
                <Text
                    style={{
                        color: 'grey',
                        marginVertical: calcHeight(3),
                        fontSize: getFontSizeByWindowWidth(12),
                    }}
                >
                    Created By {transaction.creator.name}
                </Text>
                <View
                    style={{
                        width: '50%',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        gap: calcWidth(5),
                        marginBottom: calcHeight(4),
                    }}
                >
                    <View
                        style={{
                            backgroundColor: '#4D426C',
                            flexDirection: 'row',
                            borderRadius: 10,
                            paddingVertical: calcWidth(1),
                            paddingHorizontal: calcWidth(4),
                            gap: calcWidth(1),
                            alignItems: 'center',
                        }}
                    >
                        <Image
                            style={{
                                width: calcWidth(3),
                                height: calcWidth(3),
                            }}
                            source={CalendarIcon}
                        />
                        <Text
                            style={{
                                fontSize: getFontSizeByWindowWidth(10),
                                color: 'white',
                            }}
                        >
                            {formatDateToDDMMYYYY(date)}
                        </Text>
                    </View>
                    <View
                        style={{
                            backgroundColor: '#4D426C',
                            flexDirection: 'row',
                            borderRadius: 10,
                            paddingVertical: calcWidth(2),
                            paddingHorizontal: calcWidth(4),
                            gap: calcWidth(1),
                            alignItems: 'center',
                        }}
                    >
                        {getCategoryIcon(transaction.type)}
                        <Text
                            style={{
                                fontSize: getFontSizeByWindowWidth(10),
                                color: 'white',
                            }}
                        >
                            {transaction.type}
                        </Text>
                    </View>
                </View>
            </View>
            <View style={styles.boxContainer}>
                <View
                    style={{
                        borderTopLeftRadius: calcWidth(5),
                        borderTopRightRadius: calcWidth(5),
                        backgroundColor: COLOR.BUTTON,
                    }}
                >
                    <Text style={styles.headerLabel}>Paid by</Text>
                </View>
                <View style={styles.headerContainer}>
                    <View style={styles.userDetail}>
                        <View
                            style={[
                                styles.circle,
                                {
                                    backgroundColor: generateColor(transaction.paidBy._id),
                                },
                            ]}
                        />
                        <Text style={styles.userName}>{transaction.paidBy.name}</Text>
                        <Text style={styles.userAmount}>₹ {transaction.amount}</Text>
                    </View>
                </View>
                <SharedList transaction={transaction} generateColor={generateColor} expandNames={expandNames} />
            </View>
            <View
                style={{
                    alignItems: 'center',
                }}
            >
                {transaction.splitAmong.length > TransactionNumberOfVisibleNames && (
                    <TransactionDetailsButton
                        onPress={() => {
                            setExpandNames((prev) => !prev);
                        }}
                        title={
                            <>
                                {expandNames ? (
                                    <Text>Show Less</Text>
                                ) : (
                                    <Text>
                                        {transaction.splitAmong.length - TransactionNumberOfVisibleNames} more participants{'\t'}
                                    </Text>
                                )}
                                <Entypo name={expandNames ? 'chevron-up' : 'chevron-down'} size={calcHeight(2.1)} color="white" />
                            </>
                        }
                    />
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    boxContainer: {
        backgroundColor: COLOR.PAYMENT_BACKGROUND,
        margin: calcWidth(5),
        borderTopStartRadius: 30,
        borderTopEndRadius: 30,
    },
    centeredView: {
        alignItems: 'center',
    },
    amountText: {
        fontSize: getFontSizeByWindowWidth(25),
        color: COLOR.TEXT,
        fontWeight: 'bold',
    },
    descriptionText: {
        fontSize: getFontSizeByWindowWidth(10),
        color: COLOR.TEXT,
    },
    datePickerContainer: {
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryContainer: {
        backgroundColor: 'white',
        flexDirection: 'row',
    },
    createdByText: {
        color: COLOR.TEXT,
    },
    header: {
        borderTopLeftRadius: calcWidth(5),
        borderTopRightRadius: calcWidth(5),
        backgroundColor: COLOR.BUTTON,
    },
    userDetailContainer: {
        padding: calcWidth(2),
    },
    userDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: calcWidth(5),
        marginVertical: calcHeight(3),
    },
    circle: {
        width: calcWidth(2),
        height: calcWidth(2),
        borderRadius: calcWidth(2) / 2,
        marginRight: calcWidth(2),
    },
    userName: {
        color: COLOR.TEXT,
        fontSize: getFontSizeByWindowWidth(12),
    },
    userAmount: {
        color: COLOR.TEXT,
        fontSize: getFontSizeByWindowWidth(12),
        fontWeight: 'bold',
        marginLeft: 'auto',
    },
    headerLabel: {
        color: COLOR.TEXT,
        fontSize: getFontSizeByWindowWidth(12),
        padding: calcWidth(3),
    },
});

export default TransactionDetail;
