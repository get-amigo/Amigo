import React from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity } from 'react-native';

import UPIApps from '../constants/UpiApps';
import PAGES from '../constants/pages';
import { useTransaction } from '../context/TransactionContext';
import { getFontSizeByWindowWidth } from '../helper/res';

const UPIAppSelection = ({ navigation }) => {
    const { upiParams } = useTransaction();

    const handleSelectApp = async (appName, generateDeeplink) => {
        const deepLink = generateDeeplink(upiParams);
        try {
            const canOpenURL = await Linking.canOpenURL(deepLink);
            console.log(canOpenURL);
            if (canOpenURL) {
                Linking.openURL(deepLink);
                navigation.navigate(PAGES.BALANCE);
            } else {
                Alert.alert('Alert', 'App not found');
            }
        } catch {
            Alert.alert('Alert', 'App not found');
        }
    };

    return (
        <>
            {UPIApps.map((app, index) => (
                <TouchableOpacity key={index} style={styles.button} onPress={() => handleSelectApp(app.name, app.generateDeeplink)}>
                    {app.icon}
                    <Text style={styles.text}>{app.name}</Text>
                </TouchableOpacity>
            ))}
        </>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        color: 'white',
        fontSize: getFontSizeByWindowWidth(20),
    },
});

export default UPIAppSelection;
