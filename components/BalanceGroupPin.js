import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import { calcWidth, getFontSizeByWindowWidth } from '../helper/res';

function BalanceArrow({ totalBalance }) {
    return (
        <View
            style={[
                {
                    padding: calcWidth(0.5),
                    borderRadius: calcWidth(5),
                },
                {
                    backgroundColor: totalBalance > 0 ? COLOR.BALANCE_POSITIVE_COLOR : COLOR.BALANCE_NEGATIVE_COLOR,
                },
            ]}
        >
            <Feather name={totalBalance > 0 ? 'arrow-up-right' : 'arrow-down-left'} size={calcWidth(3.4)} color="white" />
        </View>
    );
}

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
                    <View style={[styles.arrowPadding]}>
                        <BalanceArrow totalBalance={totalBalance} />
                    </View>
                </View>

                <View style={styles.balanceInfo}>
                    <View style={styles.balanceInfoLeft}>
                        <View>
                            <Text style={styles.balanceText}>
                                Total {totalBalance < 0 ? 'you pay' : 'you get back'}{' '}
                                <Text
                                    style={{
                                        color: totalBalance > 0 ? COLOR.BALANCE_POSITIVE_COLOR : COLOR.BALANCE_NEGATIVE_COLOR,
                                    }}
                                >
                                    {' '}
                                    ₹ {Math.abs(totalBalance)}
                                </Text>
                            </Text>
                        </View>
                    </View>
                    <Text
                        style={{
                            color: COLOR.BUTTON,
                            fontSize: getFontSizeByWindowWidth(11),
                            fontWeight: '600',
                            borderWidth: 0.7,
                            borderColor: 'white',
                            paddingHorizontal: calcWidth(2.2),
                            paddingVertical: calcWidth(1),
                            textAlign: 'center',
                            borderRadius: calcWidth(3.5),
                            textAlignVertical: 'center',
                        }}
                    >
                        Settle
                    </Text>
                </View>
            </Pressable>
        )
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: COLOR.BALANCE_PIN,
        paddingVertical: calcWidth(2),
        marginBottom: 2,
    },
    arrowContainer: {
        justifyContent: 'center',
        marginLeft: calcWidth(2),
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
        fontWeight: '500',
    },
});

export default BalanceGroupPin;
