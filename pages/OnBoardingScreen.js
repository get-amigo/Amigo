import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { MotiView } from 'moti';
import OnboardingImage from '../assets/Onboarding.png';
import { calcWidth, calcHeight, getFontSizeByWindowWidth } from '../helper/res';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import Button from '../components/Button';

const OnboardingScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.innerContainer}>
                <MotiView
                    from={{ opacity: 0, translateY: -1000 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 800 }}
                    style={styles.motiView}
                >
                    <Image source={OnboardingImage} style={styles.image} resizeMode="contain" />
                </MotiView>

                <MotiView
                    from={{ opacity: 0, translateY: 1000 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 800 }}
                    style={styles.motiView}
                >
                    <Text style={styles.title}>Group payments made easy</Text>
                    <Text style={styles.subtitle}>Keep track of your shared expenses and balances</Text>
                    <Button title="Continue with Phone number" onPress={() => navigation.navigate(PAGES.LOGIN)} />
                    <Text
                        style={{
                            marginVertical: calcHeight(2),
                            color: '#8c89a1',
                            fontSize: getFontSizeByWindowWidth(8),
                        }}
                    >
                        By Pressing on "Continue with Phone Number" you agree to our{' '}
                        <Text
                            style={{ color: 'white' }}
                            onPress={() => WebBrowser.openBrowserAsync('https://bhaumik-tandan.github.io/Amigo-Privacy-Policy/')}
                        >
                            Privacy Policy
                        </Text>{' '}
                        and{' '}
                        <Text
                            style={{ color: 'white' }}
                            onPress={() =>
                                WebBrowser.openBrowserAsync('https://bhaumik-tandan.github.io/Amigo-Privacy-Policy/terms-and-conditions')
                            }
                        >
                            Terms and Conditions
                        </Text>
                    </Text>
                </MotiView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLOR.APP_BACKGROUND,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    innerContainer: {
        width: calcWidth(80),
        alignItems: 'center',
    },
    motiView: {
        width: '100%',
        alignItems: 'center',
    },
    image: {
        width: calcWidth(60),
        height: calcHeight(30),
        marginBottom: calcHeight(5),
    },
    title: {
        fontSize: getFontSizeByWindowWidth(20),
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginHorizontal: calcWidth(10),
    },
    subtitle: {
        fontSize: getFontSizeByWindowWidth(10),
        color: 'white',
        textAlign: 'center',
        marginTop: calcHeight(2),
    },
    button: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: calcWidth(80),
        paddingVertical: calcHeight(2),
        borderRadius: 10,
        backgroundColor: COLOR.BUTTON,
        elevation: 3,
    },
    buttonText: {
        fontSize: getFontSizeByWindowWidth(12),
        color: 'white',
        fontWeight: '600',
        alignItems: 'center',
    },
});

export default OnboardingScreen;
