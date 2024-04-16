import React, { useEffect, useRef } from 'react';
import { SafeAreaView, View, StyleSheet, Text, Image, Pressable } from 'react-native';
import { calcWidth, calcHeight, getFontSizeByWindowWidth } from '../helper/res';
import { AntDesign } from '@expo/vector-icons';
import COLOR from '../constants/Colors';
import FabIcon from './FabIcon';
function EmptyScreen({ onPress, image, title }) {
    return (
        <SafeAreaView style={styles.container}>
            <Image source={image} style={styles.image} resizeMode="contain" />

            <Text style={styles.text}>{title}</Text>
            <Pressable onPress={onPress}>
                <AntDesign name="pluscircle" size={calcHeight(5)} color={COLOR.BUTTON} />
            </Pressable>
        </SafeAreaView>
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
