import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SplashImage from '../assets/Loader.gif';
import { calcHeight, calcWidth } from '../helper/res';

function Loader() {
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

export default Loader;
