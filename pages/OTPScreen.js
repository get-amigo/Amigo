import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, Image, Pressable, TouchableOpacity, ActivityIndicator } from 'react-native';
import COLOR from '../constants/Colors';
import Button from '../components/Button';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import OTPImage from '../assets/OTPImage.png';
import Loader from '../components/Loader';
import OTPFilled from '../assets/OTPFilled.png';
import { useOtp } from '../context/OtpContext';
import * as Haptics from 'expo-haptics';

const OTPScreen = ({
    navigation,
    route: {
        params: { phoneNumber },
    },
}) => {
    const [otp, setOtp] = useState('');
    const inputRef = useRef();
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(null);
    const [seconds, setSeconds] = useState(30);
    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds((seconds) => (seconds > 0 ? seconds - 1 : 0));
        }, 1000);

        const timeout = setTimeout(() => {
            setTimer(true);
        }, 30000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, []);

    const { verifyOtp, loginWithPhoneNumber, loading: isAuthStateLoading } = useOtp();

    const handleOTPChange = (text) => {
        setError(false);
        setOtp(text);
    };

    const handleVerifyOTP = () => {
        if (otp.length < 6) {
            setError(true);
            return;
        }
        setLoading(true);
        verifyOtp(otp)
            .then(() => {
                setLoading(false);
            })
            .catch(() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                setLoading(false);
                setError(true);
            });
    };
    const otpBoxes = Array.from({ length: 6 }).map((_, index) => {
        const digit = otp[index] || '';
        const isFocused = index === otp.length;
        const boxStyle = isFocused ? styles.highlightedBox : styles.otpInput;

        return (
            <Pressable
                key={index}
                style={{
                    ...boxStyle,
                    ...(error ? { borderBottomColor: COLOR.ERROR_BORDER } : {}),
                }}
                onPress={() => inputRef.current.focus()}
            >
                <Text style={styles.otpText}>{digit}</Text>
            </Pressable>
        );
    });

    return loading ? (
        <Loader />
    ) : (
        <SafeAreaView style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={styles.header}>
                    <Image source={otp.length != 6 ? OTPImage : OTPFilled} style={styles.image} resizeMode="contain" />
                    <View style={styles.textContainer}>
                        <Text style={styles.headerText}>OTP Verification</Text>
                        <Text style={styles.promptText}>Enter the code sent to {phoneNumber}</Text>
                    </View>
                </View>
                <View
                    style={{
                        alignItems: 'center',
                    }}
                >
                    <View style={styles.otpContainer}>{otpBoxes}</View>

                    <TextInput
                        ref={inputRef}
                        style={styles.hiddenInput}
                        keyboardType="number-pad"
                        value={otp}
                        onChangeText={handleOTPChange}
                        maxLength={6}
                        autoFocus
                    />
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.resendText}>Didn't receive the code? </Text>

                        {timer ? (
                            <TouchableOpacity onPress={() => loginWithPhoneNumber(phoneNumber)}>
                                <Text
                                    style={{
                                        fontWeight: 'bold',
                                        ...styles.resendText,
                                    }}
                                >
                                    Resend
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <Text style={styles.resendText}>Resend in {seconds} </Text>
                        )}
                    </View>

                    {isAuthStateLoading ? (
                        <ActivityIndicator size="medium" color={COLOR.PRIMARY} style={styles.indicator} />
                    ) : (
                        <Button title="Verify" onPress={handleVerifyOTP} />
                    )}
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
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: calcHeight(4),
        width: '80%',
    },
    otpInput: {
        width: calcWidth(11),
        borderBottomWidth: 1,
        textAlign: 'center',
        fontSize: getFontSizeByWindowWidth(10),
        color: COLOR.TEXT,
        justifyContent: 'center', // Center content vertically
        alignItems: 'center', // Center content horizontally
        height: calcHeight(7), // Make sure to set a fixed height for vertical alignment to work
    },
    indicator: {
        marginTop: calcHeight(4),
    },
    highlightedBox: {
        width: calcWidth(11),
        borderBottomWidth: 2,
        borderColor: COLOR.PRIMARY,
        textAlign: 'center',
        fontSize: getFontSizeByWindowWidth(15),
        color: COLOR.TEXT,
        justifyContent: 'center', // Center content vertically
        alignItems: 'center', // Center content horizontally
        height: calcHeight(7), // Make sure to set a fixed height for vertical alignment to work
    },
    otpText: {
        fontSize: getFontSizeByWindowWidth(15),
        color: COLOR.TEXT,
    },
    hiddenInput: {
        position: 'absolute',
        width: 1,
        height: 1,
        opacity: 0,
    },
    resendText: {
        color: COLOR.PRIMARY,
        fontSize: getFontSizeByWindowWidth(12),
    },
});

export default OTPScreen;
