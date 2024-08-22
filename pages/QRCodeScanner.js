import { WEBSITE_URL } from '@env';
import * as BarCodeScanner from 'expo-barcode-scanner';
import React, { useEffect, useState } from 'react';
import { Alert, AppState, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import URL from 'url-parse';
import apiHelper from '../helper/apiHelper';

import Toast from 'react-native-root-toast';
import SignUpImage from '../assets/SignUp.png';
import CameraScanner from '../components/CameraScanner';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import { useTransaction } from '../context/TransactionContext';
import { useGroup } from '../context/GroupContext';
import openSettings from '../helper/openSettings';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';

const QRCodeScanner = ({ navigation }) => {
    const [hasPermission, setHasPermission] = useState(null);
    const [isLit, setIsLit] = useState(false);
    const { setUpiParams } = useTransaction();
    const [barcodeScanEnabled, setBarcodeScanEnabled] = useState(true);
    const { setGroup } = useGroup();

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

    const parseQueryString = (queryString) => {
        const pairs = queryString.substring(1).split('&');
        const params = {};
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i].split('=');
            params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
        }
        return params;
    };

    const joinGroup = async (groupId) => {
        try {
            const { data } = await apiHelper.post(`group/${groupId}/join`);

            Toast.show(`Joined ${data?.name}`, {
                duration: Toast.durations.LONG,
            });

            setGroup(data);
        } catch (e) {
            console.error(e);
            Toast.show('Already in the group', {
                duration: Toast.durations.LONG,
            });
        }

        navigation.navigate(PAGES.GROUP);
    };

    const handleBarCodeScanned = ({ data }) => {
        if (!barcodeScanEnabled) return;

        if (data.includes(`${WEBSITE_URL}/invite/#/join?groupId=`)) {
            joinGroup(data.substring(`${WEBSITE_URL}/invite/#/join?groupId=`.length));
        } else {
            try {
                const url = new URL(data);
                const params = parseQueryString(url.query);
                // Initialize an object to store extracted parameters
                const extractedParams = {
                    receiverId: '',
                    description: params['tn'] || '',
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
                }
            } catch (error) {
                console.error('Error processing scanned data:', error);
                // Handle error (e.g., show an error message)
            }
        }
    };

    return (
        <View style={styles.container}>
            {!hasPermission ? (
                <View style={{ flex: 1 }}>
                    <View style={styles.top}>
                        <Image source={SignUpImage} style={styles.permitImage} />
                        <Text style={{ fontWeight: '600', color: '#FFF', fontSize: getFontSizeByWindowWidth(16), textAlign: 'center' }}>
                            Allow Access to Camera
                        </Text>
                        <Text
                            style={{
                                fontWeight: '400',
                                color: '#FFF',
                                fontSize: getFontSizeByWindowWidth(12),
                                textAlign: 'center',
                                marginTop: calcHeight(1),
                                opacity: 0.6,
                            }}
                        >
                            To scan QR codes, we need access to your camera.{`\n`}
                            Please allow camera access to proceed.
                        </Text>
                    </View>
                    <View style={styles.bottom}>
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
        width: calcWidth(90),
        borderRadius: 10,
        alignSelf: 'center',
    },
    permitImage: {
        width: calcWidth((150 / 390) * 100),
        height: calcHeight((180 / 844) * 100),
        alignSelf: 'center',
        marginBottom: calcHeight((12 / 844) * 100),
    },
    top: {
        flex: 1,
        marginTop: -calcHeight((180 / 844) * 100) / 2.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottom: {
        marginBottom: calcHeight(4),
        marginTop: 'auto',
    },
});

export default QRCodeScanner;
