import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import COLOR from '../constants/Colors';
import getFontSize from '../helper/getFontSize';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';

const AmountInput = ({ amount = '', handleInputChange, isTextInput = false, onSubmitEditing }) => {
    const baseFontSize = getFontSizeByWindowWidth(40);
    const [fontSize, setFontSize] = useState(getFontSize('₹' + amount, calcWidth(65), baseFontSize));

    const amountInputRef = useRef();

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (amountInputRef.current) {
                amountInputRef.current.focus();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, []);

    const commonStyles = {
        fontSize,
        lineHeight: fontSize * (Platform.OS === 'ios' ? 1.2 : 1.5),
        paddingVertical: (baseFontSize * 1.2 - fontSize * 1.2) / 2,
    };

    const handleChange = (newAmount) => {
        const sanitizedAmount = newAmount.replace(/\D/g, '');
        if (handleInputChange) {
            handleInputChange(sanitizedAmount);
        }
        setFontSize(getFontSize('₹' + sanitizedAmount, calcWidth(65), baseFontSize));
    };

    return (
        <View
            style={{
                ...styles.rowCentered,
                margin: calcHeight(1),
                marginHorizontal: calcWidth(20),
            }}
        >
            <Text style={[styles.amount, commonStyles]}>₹</Text>
            {isTextInput ? (
                <TextInput
                    style={[styles.amount, commonStyles]}
                    onChangeText={handleChange}
                    value={amount}
                    keyboardType="numeric"
                    placeholderTextColor={COLOR.TEXT}
                    placeholder="0"
                    ref={amountInputRef}
                    blurOnSubmit={false}
                    onSubmitEditing={onSubmitEditing}
                />
            ) : (
                <Text style={[styles.amount, commonStyles]}>{amount}</Text>
            )}
        </View>
    );
};

export default AmountInput;

const styles = StyleSheet.create({
    rowCentered: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    amount: {
        color: COLOR.TEXT,
        fontWeight: 'bold',
    },
});
