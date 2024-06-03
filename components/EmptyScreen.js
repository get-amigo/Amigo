import React from 'react';
import { SafeAreaView, View, StyleSheet, Text, Image, Pressable } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { calcWidth, calcHeight, getFontSizeByWindowWidth } from '../helper/res';
import COLOR from '../constants/Colors';

function EmptyScreen({ onPress, image, title }) {
    return (
        <SafeAreaView style={styles.container}>
            <Image source={image} style={styles.image} resizeMode="contain" />
            <Text style={styles.text}>{title}</Text>
            <Pressable onPress={onPress} style={styles.pressable}>
                <View style={styles.iconContainer}>
                    {[...Array(2).keys()].map((index) => (
                        <MotiView
                            key={index}
                            from={{ opacity: 0.5, scale: 0 }}
                            animate={{ opacity: 0, scale: 1.5 }}
                            transition={{
                                type: 'timing',
                                duration: 2000,
                                delay: index * 300,
                                loop: true,
                                repeatReverse: true,
                            }}
                            style={styles.motiView}
                        />
                    ))}
                    <AntDesign name="pluscircle" size={calcHeight(5)} color={COLOR.BUTTON} />
                </View>
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
    motiView: {
        position: 'absolute',
        width: calcHeight(5) * 2,
        height: calcHeight(5) * 2,
        backgroundColor: COLOR.BUTTON,
        borderRadius: calcHeight(5),
    },
    pressable: {
        marginTop: calcHeight(3),
    },
    iconContainer: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        width: calcHeight(5) * 2,
        height: calcHeight(5) * 2,
    },
});

export default EmptyScreen;
