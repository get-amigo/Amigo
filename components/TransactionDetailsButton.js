import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';

import COLOR from '../constants/Colors';
import { calcWidth, calcHeight, getFontSizeByWindowWidth } from '../helper/res';
const Button = ({ onPress, title, styleOverwrite = {} }) => {
    return (
        <TouchableOpacity style={{ ...styles.button, ...styleOverwrite }} onPress={onPress}>
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: calcWidth(90),
        paddingVertical: calcHeight(2),
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: COLOR.BUTTON,
        backgroundColor: 'rgba(141, 72, 255, 0.19)',
        elevation: 3,
    },
    buttonText: {
        fontSize: getFontSizeByWindowWidth(12),
        color: 'white',
        fontWeight: '600',
        alignItems: 'center',
    },
});

export default Button;
