import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Image, Pressable, ScrollView, Keyboard } from 'react-native';
import COLOR from '../constants/Colors';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import OTPImage from '../assets/OTPImage.png';
import OTPFilled from '../assets/OTPFilled.png';
import { useOtp } from '../context/OtpContext';
import Button from '../components/Button';
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
    const [seconds, setSeconds] = useState(30);
    const { verifyOtp, loginWithPhoneNumber, loading: isAuthStateLoading } = useOtp();

    useEffect(() => {
        const interval = setInterval(() => {
            if (seconds > 0) {
                setSeconds(seconds - 1);
            }

            if (seconds === 0) {
                clearInterval(interval);
            }
        }, 1000);
        return () => {
            clearInterval(interval);
        };
    }, [seconds]);

    useEffect(() => {
        if (isAuthStateLoading) {
            Keyboard.dismiss();
        }
    }, [isAuthStateLoading]);

    const resendOTP = () => {
        setSeconds(30);
        loginWithPhoneNumber(phoneNumber);
    };

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
                inputRef.current.focus();
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

    return (
        <ScrollView style={{ flex: 1 }} keyboardDismissMode="none" keyboardShouldPersistTaps="always">
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
                        blurOnSubmit={false}
                        onSubmitEditing={handleVerifyOTP}
                    />
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.resendText}>Didn't get the OTP? </Text>

                        <Pressable
                            disabled={seconds > 0}
                            style={{
                                color: seconds >= 0 ? '#808080' : 'red',
                            }}
                            onPress={() => seconds === 0 && resendOTP()}
                        >
                            {seconds > 0 ? (
                                <Text
                                    style={{
                                        color: '#808080',
                                        fontSize: getFontSizeByWindowWidth(10.5),
                                        fontWeight: 'normal',
                                        marginLeft: calcWidth(1),
                                    }}
                                >
                                    Resend SMS in {seconds.toString().padStart(2, '0')}s
                                </Text>
                            ) : (
                                <Text
                                    style={{
                                        color: '#FFFFFF',
                                        fontSize: getFontSizeByWindowWidth(10.5),
                                        fontWeight: 'bold',
                                        marginLeft: calcWidth(1),
                                    }}
                                >
                                    Resend
                                </Text>
                            )}
                        </Pressable>
                    </View>
                    <Button loading={loading || isAuthStateLoading} title="Verify OTP" onPress={handleVerifyOTP} />
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
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
        justifyContent: 'center',
        alignItems: 'center',
        height: calcHeight(7),
    },
    indicator: {
        marginTop: calcHeight(3),
        paddingHorizontal: calcWidth(2),
    },
    highlightedBox: {
        width: calcWidth(11),
        borderBottomWidth: 2,
        borderColor: COLOR.PRIMARY,
        textAlign: 'center',
        fontSize: getFontSizeByWindowWidth(15),
        color: COLOR.TEXT,
        justifyContent: 'center',
        alignItems: 'center',
        height: calcHeight(7),
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
        fontSize: getFontSizeByWindowWidth(10.5),
    },
});

export default OTPScreen;
