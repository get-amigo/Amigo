import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, Image } from 'react-native';
import LoginImage from '../assets/Login.png';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import Button from '../components/Button';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import { useAuth } from '../stores/auth';
import { useOtp } from '../context/OtpContext';
import { sendOtp } from '../helper/otp';

const CountryCodeInput = ({ countryCode }) => (
    <View style={styles.countryCodeContainer}>
        <Text style={styles.countryCodeText}>{countryCode}</Text>
    </View>
);

const LoginScreen = ({ navigation }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode] = useState('+91');
    const [isPhoneFocused, setIsPhoneFocused] = useState(false);
    const [error, setError] = useState(false);

    const { setPayload } = useOtp();

    const getTextInputStyle = (isFocused) => ({
        ...styles.phoneNumberInput,
        borderBottomColor: isFocused ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.5)',
    });

    const handleSendOTP = async () => {
        if (!phoneNumber || phoneNumber.length != 10) {
            setError(true);
            return;
        }

        sendOtp(countryCode + phoneNumber).then((payload) => {
            setPayload(payload);
        });

        navigation.navigate(PAGES.OTP, { phoneNumber: countryCode + phoneNumber });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={styles.header}>
                    <Image source={LoginImage} style={styles.image} resizeMode="contain" />
                    <View style={styles.textContainer}>
                        <Text style={styles.headerText}>Hi there!</Text>
                        <Text style={styles.promptText}>Please enter your phone number</Text>
                    </View>
                </View>
                <View style={styles.inputContainer}>
                    <View style={styles.phoneNumberRow}>
                        <CountryCodeInput countryCode={countryCode} />
                        <TextInput
                            style={{
                                ...getTextInputStyle(isPhoneFocused),
                                ...(error ? { borderBottomColor: COLOR.ERROR_BORDER } : {}),
                            }}
                            keyboardType="phone-pad"
                            value={phoneNumber}
                            onChangeText={(value) => {
                                setPhoneNumber(value);
                                setError(false);
                            }}
                            onFocus={() => setIsPhoneFocused(true)}
                            onBlur={() => setIsPhoneFocused(false)}
                            placeholderTextColor="#D3D3D3"
                        />
                    </View>
                    <Button title="Send OTP" onPress={handleSendOTP} />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLOR.APP_BACKGROUND,
    },
    innerContainer: {
        paddingHorizontal: calcWidth(5),
        marginTop: calcHeight(5),
    },
    header: {
        flexDirection: 'row',
        marginHorizontal: calcWidth(5),
        marginBottom: calcHeight(5),
    },
    image: {
        width: calcWidth(20),
        aspectRatio: 1,
        marginRight: calcWidth(5),
    },
    textContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    headerText: {
        fontSize: getFontSizeByWindowWidth(18),
        fontWeight: 'bold',
        color: COLOR.TEXT,
        paddingBottom: calcHeight(2),
    },
    promptText: {
        fontSize: getFontSizeByWindowWidth(10),
        color: COLOR.TEXT,
    },
    inputContainer: {
        alignItems: 'center',
        marginHorizontal: calcWidth(6),
        marginTop: calcHeight(2),
    },
    phoneNumberInput: {
        flex: 1,
        color: COLOR.TEXT,
        fontSize: 18,
        borderBottomWidth: 1,
        paddingBottom: calcHeight(2),
        marginLeft: calcWidth(1),
        fontWeight: 'bold',
    },
    countryCodeContainer: {
        marginLeft: calcWidth(1),
        width: calcWidth(15),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.5)',
    },
    countryCodeText: {
        color: COLOR.TEXT,
        fontSize: 18,
    },
    phoneNumberRow: {
        flexDirection: 'row',
    },
});

export default LoginScreen;
