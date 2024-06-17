import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Linking, Button, Image, Pressable, Text, Alert, AppState } from 'react-native';
import * as BarCodeScanner from 'expo-barcode-scanner';
import CameraScanner from '../components/CameraScanner';
import { useTransaction } from '../context/TransactionContext';
import URL from 'url-parse';
import PAGES from '../constants/pages';
import COLOR from '../constants/Colors';
import openSettings from '../helper/openSettings';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import getFontSize from '../helper/getFontSize';
import SignUpImage from '../assets/SignUp.png';

const QRCodeScanner = ({ navigation }) => {
    const [hasPermission, setHasPermission] = useState(null);
    const [isLit, setIsLit] = useState(false);
    const { setUpiParams } = useTransaction();
    const [barcodeScanEnabled, setBarcodeScanEnabled] = useState(true);

    useEffect(() => {
        const checkCameraPermission = async () => {
            const { status } = await BarCodeScanner.getPermissionsAsync();
            setHasPermission(status === 'granted');
        };

        const handleAppStateChange = (nextAppState) => {
            if (nextAppState === 'active') {
                checkCameraPermission();
            }
        };
        checkCameraPermission();

        AppState.addEventListener('change', handleAppStateChange);

        return () => {
            AppState;
        };
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setHasPermission(false);
            (async () => {
                const { status } = await BarCodeScanner.requestPermissionsAsync();
                setHasPermission(status === 'granted');
            })();
        });

        const unsubscribeBlur = navigation.addListener('blur', () => {
            setBarcodeScanEnabled(false);
        });

        return () => {
            unsubscribe(); // Remove the 'focus' event listener
            unsubscribeBlur(); // Remove the 'blur' event listener
        };
    }, [navigation]);

    const requestCameraPermission = async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
    };

    const parseQueryString = (queryString) => {
        const pairs = queryString.substring(1).split('&');
        const params = {};
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i].split('=');
            params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
        }
        return params;
    };

    const handleBarCodeScanned = ({ data }) => {
        if (!barcodeScanEnabled) return;
        try {
            const url = new URL(data);

            const params = parseQueryString(url.query);

            // Initialize an object to store extracted parameters
            const extractedParams = {
                receiverId: '',
                // Add other common parameters here
            };

            // Check the URL scheme to identify UPI and extract relevant data
            if (url.protocol === 'upi:') {
                extractedParams.receiverId = params['pa'] || ''; // Use 'pa' parameter as receiverId
                Object.assign(extractedParams, params);
                setUpiParams(extractedParams); // Ensure setUpiParams is defined and available
                navigation.navigate(PAGES.ADD_TRANSACTION); // Ensure navigation and PAGES are defined and available
            } else {
                setBarcodeScanEnabled(false);
                Alert.alert('Not a valid UPI URL', null, [
                    {
                        text: 'OK',
                        onPress: () => setBarcodeScanEnabled(true),
                    },
                ]);
                return;
            }
        } catch (error) {
            console.error('Error processing scanned data:', error);
            // Handle error (e.g., show an error message)
        }
    };

    return (
        <View style={styles.container}>
            {!hasPermission ? (
                <View style={{ flexDirection: 'column', gap: calcHeight((224 / 844) * 100), alignItems: 'center' }}>
                    <View style={styles.top}>
                        <Image source={SignUpImage} style={styles.permitImage} />
                        <Text style={{ fontWeight: '600', color: '#FFF', fontSize: getFontSizeByWindowWidth(16), textAlign: 'center' }}>
                            Allow Access to Camera
                        </Text>
                        <Text style={{ fontWeight: '400', color: '#FFF', fontSize: getFontSizeByWindowWidth(10), textAlign: 'center' }}>
                            To scan QR codes, we need access to your camera.
                        </Text>
                        <Text style={{ fontWeight: '400', color: '#FFF', fontSize: getFontSizeByWindowWidth(10), textAlign: 'center' }}>
                            Please allow camera access to continue.
                        </Text>
                    </View>
                    <View>
                        <Text style={{ fontWeight: '500', color: '#FFF', fontSize: getFontSizeByWindowWidth(14), textAlign: 'center' }}>
                            You're always in control
                        </Text>
                        <Text style={{ fontWeight: '400', color: '#FFF', fontSize: getFontSizeByWindowWidth(10), textAlign: 'center' }}>
                            You can change this anytime in your device settings
                        </Text>
                        <Pressable style={styles.btn} onPress={openSettings}>
                            <Text
                                style={{ color: '#FFFFFF', fontSize: getFontSizeByWindowWidth(15), fontWeight: '400', textAlign: 'center' }}
                            >
                                Allow
                            </Text>
                        </Pressable>
                    </View>
                </View>
            ) : (
                <CameraScanner handleBarCodeScanned={handleBarCodeScanned} isLit={isLit} setIsLit={setIsLit} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLOR.APP_BACKGROUND,
        justifyContent: 'center',
    },
    btn: {
        backgroundColor: COLOR.BUTTON,
        marginTop: calcHeight((8 / 844) * 100),
        paddingHorizontal: calcWidth(5),
        paddingVertical: calcHeight(2),
        width: calcWidth((310 / 390) * 100),
        borderRadius: 10,
        alignSelf: 'center',
    },
    permitImage: {
        width: calcWidth((150 / 390) * 100),
        height: calcHeight((180 / 844) * 100),
        alignSelf: 'center',
        marginBottom: calcHeight((12 / 844) * 100),
    },
});

export default QRCodeScanner;
