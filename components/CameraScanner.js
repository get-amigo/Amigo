import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Button } from 'react-native';
import QRIndicator from './QRIndicator';
import QRFooterButton from './QRFooterButton';
import { calcHeight, calcWidth } from '../helper/res';
import * as BarCodeScanner from 'expo-barcode-scanner';
import getLocalImage from '../helper/getLocalImage';
import getQrDataFromImage from '../helper/getQrDataFromImage';
import { CameraView } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CameraScanner = ({ handleBarCodeScanned, isLit, setIsLit }) => {
    const { bottom } = useSafeAreaInsets();
    async function getImage() {
        const image = await getLocalImage();
        const scannedResults = await getQrDataFromImage(image);
        if (scannedResults.length > 0) {
            handleBarCodeScanned(scannedResults[0]);
            return;
        }
        alert('No QR code found in image');
    }
    const [scanned, setScanned] = useState(false);

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
                facing={'back'}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
                onBarcodeScanned={scanned ? null : handleBarCode}
            >
                <View style={styles.buttonContainer}>
                    <QRIndicator />
                    <View style={[styles.footer, { bottom: 30 + bottom }]}>
                        <QRFooterButton onPress={() => setIsLit((isLit) => !isLit)} isActive={isLit} iconName="flashlight-sharp" />
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
