import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

import COLOR from '../constants/Colors';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';

const Button = ({ onPress, title, styleOverwrite = {}, disabled, loading }) => {
    return (
        <TouchableOpacity
            style={{ ...styles.button, ...styleOverwrite, opacity: disabled || loading ? 0.5 : 1 }}
            onPress={onPress}
            disabled={disabled || loading}
        >
            {loading ? (
                <ActivityIndicator color="white" style={{ alignItems: 'center' }} />
            ) : (
                <Text style={styles.buttonText}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        display: 'flex',
        justifyContent: 'center', // Centers child horizontally in the container
        alignItems: 'center',
        width: calcWidth(80),
        paddingVertical: calcHeight(2),
        borderRadius: 10,
        backgroundColor: COLOR.BUTTON,
        elevation: 3,
        marginTop: calcHeight(4),
    },
    buttonText: {
        fontSize: getFontSizeByWindowWidth(12),
        color: 'white',
        fontWeight: '600',
        alignItems: 'center',
    },
});

export default Button;
