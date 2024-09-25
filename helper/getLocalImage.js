import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

import openSettings from './openSettings';

async function getLocalImage() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
        if (!permissionResult.canAskAgain) {
            // Limited access was selected, handle accordingly
        } else {
            // Access denied
            Alert.alert('Permission Required', 'We need permission to access your photos to get the QR code.', [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Open Settings',
                    onPress: openSettings,
                },
            ]);
            return;
        }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
    });

    if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
        const selectedImagePath = result.assets[0].uri;

        const fileInfo = await FileSystem.getInfoAsync(selectedImagePath);

        if (fileInfo.exists) {
            return selectedImagePath;
        } else {
            console.error('Source image does not exist.');
            throw new Error('Image does not exist');
        }
    } else {
        console.log('Image selection canceled or result.uri is null.');
        throw new Error('Image selection canceled');
    }
}

export default getLocalImage;
