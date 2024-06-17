import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Image, Text, View } from 'react-native';
import { MotiView } from 'moti';
import COLOR from '../constants/Colors';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import Logo from '../assets/icon.png';

const SplashScreen = ({ navigation }) => {
    const [animationPhase, setAnimationPhase] = useState(0);

    useEffect(() => {
        setTimeout(() => {
            setAnimationPhase(1);
        }, 1000); // Time for the logo to reach the top
        setTimeout(() => {
            setAnimationPhase(2);
        }, 2500); // Time for the ellipse to disappear and logo to move diagonally
    }, []);

    const textAnimation = [
        { delay: 2500, letter: 'A' },
        { delay: 2700, letter: 'M' },
        { delay: 2900, letter: 'I' },
        { delay: 3100, letter: 'G' },
        { delay: 3300, letter: 'O' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Ellipse background */}
            {animationPhase !== 2 && (
                <MotiView
                    from={{
                        opacity: 0.2,
                    }}
                    animate={{
                        opacity: animationPhase === 1 ? 0 : 1,
                    }}
                    transition={{
                        type: 'timing',
                        duration: 500,
                    }}
                    style={styles.ellipse}
                />
            )}

            {/* Logo animation */}
            <MotiView
                from={{
                    translateY: calcHeight(0),
                    opacity: 0,
                }}
                animate={{
                    translateY: animationPhase === 1 ? -calcHeight(30) : calcHeight(-10),
                    translateX: animationPhase === 2 ? -calcWidth(28) : 0,
                    opacity: 1,
                }}
                transition={{
                    type: 'timing',
                    duration: animationPhase === 1 ? 1000 : 2000,
                }}
                style={styles.logoContainer}
            >
                <Image source={Logo} style={styles.logo} />
            </MotiView>

            {/* Text animation */}
            {animationPhase === 2 && (
                <View style={styles.textContainer}>
                    {textAnimation.map((item, index) => (
                        <MotiView
                            key={index}
                            from={{ opacity: 0, translateX: -calcWidth(2) }}
                            animate={{ opacity: 1, translateX: 0 }}
                            transition={{ type: 'timing', duration: 500, delay: item.delay }}
                            style={styles.textWrapper}
                        >
                            <Text style={styles.text}>{item.letter}</Text>
                        </MotiView>
                    ))}
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLOR.APP_BACKGROUND,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ellipse: {
        width: calcWidth(60),
        height: calcHeight(4),
        backgroundColor: COLOR.BUTTON,
        borderRadius: calcWidth(20),
        position: 'absolute',
        bottom: calcHeight(28),
    },
    logoContainer: {
        position: 'absolute',
        bottom: calcHeight(28),
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: calcWidth(20),
        height: calcHeight(10),
        resizeMode: 'contain',
    },
    textContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: calcHeight(40.8),
        left: calcWidth(36),
    },
    textWrapper: {
        marginHorizontal: 0, // No spacing between letters
    },
    text: {
        fontSize: getFontSizeByWindowWidth(28),
        fontWeight: 'bold',
        color: '#FFF', // Adjust as needed
    },
});

export default SplashScreen;
