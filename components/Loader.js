import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import SplashImage from '../assets/splash.png';

function Loader() {
    return (
        <View style={styles.container}>
            <Image source={SplashImage} style={styles.image} />
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
        flex: 1,
        width: '100%',
        height: '100%',
        resizeMode: 'cover', // or 'contain' depending on your preference
    },
});

export default Loader;
