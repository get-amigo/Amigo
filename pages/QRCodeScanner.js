import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Linking, Button, Image, Pressable, Text, Alert, TouchableOpacity, AppState } from 'react-native';
import * as BarCodeScanner from 'expo-barcode-scanner';
import CameraScanner from '../components/CameraScanner';
import { useTransaction } from '../context/TransactionContext';
import URL from 'url-parse';
import PAGES from '../constants/pages';
import COLOR from '../constants/Colors';
import openSettings from '../helper/openSettings';
import { MotiView } from 'moti';
import { calcHeight, calcWidth } from '../helper/res';
import { MaterialIcons } from '@expo/vector-icons';
import { getFontSizeByWindowWidth } from '../helper/res';

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

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <MotiView style={styles.container}>
            <MotiView
                from={{ opacity: 1, scale: 0.3 }}
                animate={{ opacity: 1, scale: 3 }}
                transition={{
                    type: 'timing',
                    duration: 800,
                }}
                style={styles.pulsatingCircle}
            />
            <MotiView
                style={styles.container}
                from={{
                    opacity: 0.3,
                    zIndex: 1,
                }}
                animate={{
                    opacity: 1,
                    scale: 1,
                }}
                transition={{ type: 'timing', duration: 800 }}
            >
                {!hasPermission ? (
                    <Pressable onPress={openSettings}>
                        <Text
                            style={{
                                color: COLOR.TEXT,
                            }}
                        >
                            Allow Camera Permission
                        </Text>
                    </Pressable>
                ) : (
                    <MotiView
                        style={styles.container}
                        from={{
                            opacity: 0,
                            zIndex: 1,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                        }}
                        transition={{ type: 'timing', duration: 800 }}
                    >
                        <CameraScanner handleBarCodeScanned={handleBarCodeScanned} isLit={isLit} setIsLit={setIsLit} back={handleBack} />
                    </MotiView>
                )}
            </MotiView>
        </MotiView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
        backgroundColor: 'rgb(31, 27, 46)',
        // backgroundColor: 'red',
    },
    pulsatingCircle: {
        flex: 1,
        position: 'absolute',
        top: -calcHeight(60),
        // left: calcWidth(-2),
        right: calcWidth(-20),
        width: calcHeight(100),
        height: calcHeight(100),
        backgroundColor: 'rgba(39, 34, 57, 1)',
        // backgroundColor: COLOR.BUTTON,
        borderRadius: calcHeight(100),
    },
});

export default QRCodeScanner;
