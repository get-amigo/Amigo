import React from 'react';
import { SafeAreaView, Image, StyleSheet } from 'react-native';
import SplashImage from '../assets/SplashScreen.gif';
import { calcHeight, calcWidth } from '../helper/res';

function SplashScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <Image source={SplashImage} style={styles.image} />
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
        flex: 1,
        width: calcWidth(100),
        height: calcHeight(100),
        resizeMode: 'cover', // or 'contain' depending on your preference
    },
});

export default SplashScreen;
