import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { calcWidth, getFontSizeByWindowWidth } from '../../helper/res';

const StickyDate = ({ isStickyDateVisible, stickyDate }) => {
    return (
        isStickyDateVisible &&
        stickyDate !== '' && (
            <View style={styles.container}>
                <View style={styles.wrapper}>
                    <Text style={styles.text}>{stickyDate}</Text>
                </View>
            </View>
        )
    );
};

export default StickyDate;

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
        padding: 2,
        zIndex: 100,
        alignItems: 'center',
    },
    wrapper: {
        borderRadius: calcWidth(3.6),
        overflow: 'hidden',
    },
    text: {
        color: 'white',
        paddingHorizontal: calcWidth(2.4),
        paddingVertical: calcWidth(1.2),
        fontSize: getFontSizeByWindowWidth(10.7),
        fontWeight: '400',
        backgroundColor: '#272239',
    },
});
