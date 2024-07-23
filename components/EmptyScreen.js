import { AntDesign } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Image, Pressable } from 'react-native';

import FabIcon from './FabIcon';
import COLOR from '../constants/Colors';
import { calcWidth, calcHeight, getFontSizeByWindowWidth } from '../helper/res';

function EmptyScreen({ onPress, image, title }) {
    return (
        <View style={styles.container}>
            <Image source={image} style={styles.image} resizeMode="contain" />

            <Text style={styles.text}>{title}</Text>
            <Pressable onPress={onPress}>
                <AntDesign name="pluscircle" size={calcHeight(5)} color={COLOR.BUTTON} />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        height: calcWidth(70),
        aspectRatio: 1,
    },
    text: {
        fontSize: getFontSizeByWindowWidth(15),
        color: COLOR.PRIMARY,
        fontWeight: 'bold',
        marginBottom: calcHeight(3),
    },
});

export default EmptyScreen;
