import React, { useState } from 'react';
import { SafeAreaView, View, StyleSheet, Text, Image, Pressable } from 'react-native';
import { calcWidth, calcHeight, getFontSizeByWindowWidth } from '../helper/res';
import { AntDesign } from '@expo/vector-icons';
import COLOR from '../constants/Colors';
import FabIcon from './FabIcon';
import { MotiView, AnimatePresence } from 'moti';

function EmptyScreen({ onPress, image, title }) {
    const [pressableState, setPressableState] = useState();

    return (
        <SafeAreaView style={styles.container}>
            <Image source={image} style={styles.image} resizeMode="contain" />
            <Text style={styles.text}>{title}</Text>
            <MotiView
                from={{ opacity: 0.5, scale: 0.1, translateY: 240 }} // Define initial animation state
                animate={{ opacity: 1, scale: 1, translateY: 0 }} // Define target animation state
                transition={{ type: 'timing', delay: 100, duration: 500 }}
            >
                <Pressable
                    onPressIn={() => {
                        // Define an animation on press in
                        setPressableState({ scale: 0.8 });
                    }}
                    onPressOut={() => {
                        // Add a delay before scaling back to 1
                        setTimeout(() => {
                            setPressableState({ scale: 0 });
                        }, 300); // Adjust the delay time as needed
                    }}
                    onPress={onPress}
                >
                    <MotiView
                        animate={pressableState} // Apply pressable state animation
                        transition={{ type: 'timing', duration: 200 }}
                    >
                        <AntDesign name="pluscircle" size={calcHeight(5)} color={COLOR.BUTTON} />
                    </MotiView>
                </Pressable>
            </MotiView>
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
