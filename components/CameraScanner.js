import React, { useState } from 'react';
import { Alert, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CameraView } from 'expo-camera';
import COLOR from '../constants/Colors';
import getLocalImage from '../helper/getLocalImage';
import getQrDataFromImage from '../helper/getQrDataFromImage';
import { calcHeight, calcWidth } from '../helper/res';
import QRFooterButton from './QRFooterButton';
import QRIndicator from './QRIndicator';

const CameraScanner = ({ handleBarCodeScanned, isLit, setIsLit, back }) => {
    const { bottom } = useSafeAreaInsets();
    const [scanned, setScanned] = useState(false);

    async function getImage() {
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
            >
                <View style={{ margin: calcWidth(4) }}>
                    <TouchableOpacity style={{ marginLeft: calcWidth(2), marginTop: calcHeight(2) }} onPress={back}>
                        <Ionicons name="arrow-back" size={calcWidth(7)} color={'#FFF'} />
                    </TouchableOpacity>
                </View>
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
