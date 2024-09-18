import { CameraView } from 'expo-camera';
import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFocusEffect } from '@react-navigation/native';
import getLocalImage from '../helper/getLocalImage';
import getQrDataFromImage from '../helper/getQrDataFromImage';
import { calcHeight, calcWidth } from '../helper/res';
import QRFooterButton from './QRFooterButton';
import QRIndicator from './QRIndicator';

const CameraScanner = ({ handleBarCodeScanned }) => {
    const { bottom } = useSafeAreaInsets();

    const [scanned, setScanned] = useState(false);
    const [isTorchOn, setTorchOn] = useState(false);

    useFocusEffect(
        useCallback(() => {
            return () => {
                setTorchOn(false);
            };
        }, []),
    );

    async function getImage() {
        setTorchOn(false);
        const image = await getLocalImage();
        const scannedResults = await getQrDataFromImage(image);
        if (scannedResults.length > 0) {
            handleBarCodeScanned(scannedResults[0]);
            return;
        }
        Alert.alert('Alert', 'No QR code found in image');
    }

    const handleBarCode = (event) => {
        setScanned(true);
        handleBarCodeScanned(event);
        setTimeout(() => {
            setScanned(false);
        }, 1000);
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing="back"
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
                onBarcodeScanned={scanned ? null : handleBarCode}
                enableTorch={isTorchOn}
            >
                <View style={styles.buttonContainer}>
                    <QRIndicator />
                    <View style={[styles.footer, { bottom: 30 + bottom }]}>
                        <QRFooterButton
                            onPress={() => setTorchOn((isTorchOn) => !isTorchOn)}
                            isActive={isTorchOn}
                            iconName="flashlight-sharp"
                        />
                        <QRFooterButton onPress={getImage} iconName="image" />
                    </View>
                </View>
            </CameraView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    scannerContainer: {
        width: calcWidth(100),

        height: calcHeight(100),
        overflow: 'hidden',
        zIndex: 1,
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: '10%',
    },
});

export default CameraScanner;
