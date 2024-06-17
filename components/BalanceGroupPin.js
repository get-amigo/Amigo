import React, { useState } from 'react';
import { Text, Pressable, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { calcWidth, calcHeight, getFontSizeByWindowWidth } from '../helper/res';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import BalanceArrow from './BalanceArrow';

const BalanceGroupPin = ({ totalBalance, balances }) => {
    const navigation = useNavigation();

    const handlePress = () => {
        navigation.navigate(PAGES.GROUP_BALANCE, {
            group: balances,
        });
    };

    return (
        !!totalBalance && (
            <Pressable style={styles.container} onPress={handlePress}>
                <View style={styles.arrowContainer}>
                    <View
                        style={[
                            styles.arrowPadding,
                            {
                                backgroundColor:
                                    totalBalance > 0
                                        ? COLOR.BALANCE_ARROW_PADDING_POSITIVE_COLOR
                                        : COLOR.BALANCE_ARROW_PADDING_NEGATIVE_COLOR,
                            },
                        ]}
                    >
                        <BalanceArrow totalBalance={totalBalance} />
                    </View>
                </View>

                <View style={styles.balanceInfo}>
                    <View style={styles.balanceInfoLeft}>
                        <View
                            style={[
                                styles.indicator,
                                {
                                    backgroundColor: totalBalance > 0 ? COLOR.BALANCE_PIN : 'red',
                                },
                            ]}
                        />
                        <View
                            style={{
                                gap: calcHeight(0.5),
                            }}
                        >
                            <Text
                                style={{
                                    color: COLOR.TEXT,
                                    fontSize: getFontSizeByWindowWidth(10),
                                }}
                            >
                                Split expense summary
                            </Text>
                            <Text style={styles.balanceText}>
                                Total {totalBalance < 0 ? 'you owe' : 'you get back'}{' '}
                                <Text
                                    style={{
                                        color: totalBalance > 0 ? COLOR.BALANCE_POSITIVE_COLOR : COLOR.BALANCE_NEGATIVE_COLOR,
                                    }}
                                >
                                    {' '}
                                    ₹{Math.abs(totalBalance)}
                                </Text>
                            </Text>
                        </View>
                    </View>
                    <Text
                        style={{
                            color: COLOR.BUTTON,
                            fontSize: getFontSizeByWindowWidth(10),
                            fontWeight: 'bold',
                        }}
                    >
                        View and settle
                    </Text>
                </View>
            </Pressable>
        )
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: COLOR.BALANCE_PIN,
        paddingVertical: calcHeight(2),
    },
    arrowContainer: {
        justifyContent: 'center',
    },
    arrowPadding: {
        paddingLeft: calcWidth(2),
        flex: 0,
        borderBottomRightRadius: 10,
        borderTopEndRadius: 10,
    },
    balanceInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: calcWidth(5),
    },
    balanceInfoLeft: {
        flexDirection: 'row',
    },
    balanceText: {
        color: COLOR.TEXT,
        fontSize: getFontSizeByWindowWidth(11),
        fontWeight: 'bold',
    },
});

export default BalanceGroupPin;
