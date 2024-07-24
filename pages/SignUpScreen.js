import React, { useState } from 'react';
import {
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

import SignUpImage from '../assets/SignUp.png'; // Make sure you have an image for the sign-up
import Button from '../components/Button'; // Replace with your actual button component
import COLOR from '../constants/Colors'; // Replace with your actual colors
import PAGES from '../constants/pages'; // Replace with your actual page constants
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res'; // Replace with your actual responsive helpers
import { useAuth } from '../stores/auth';

const SignUpScreen = ({ navigation }) => {
    const [name, setName] = useState(''); // State for the name
    const [isNameFocused, setIsNameFocused] = useState(false); // State to handle the focus styling
    const { addName } = useAuth();

    // Function to calculate remaining character count
    const remainingCharacters = 25 - name.length;

    const getTextInputStyle = (isFocused) => ({
        ...styles.nameInput,
        borderBottomColor: isFocused ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.5)',
    });

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.inner}>
                        <View style={styles.header}>
                            <Image source={SignUpImage} style={styles.image} resizeMode="contain" />
                            <View style={styles.textContainer}>
                                <Text style={styles.headerText}>Your Name</Text>
                                <Text style={styles.promptText}>What should we call you?</Text>
                            </View>
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={getTextInputStyle(isNameFocused)}
                                placeholder="Your name"
                                value={name}
                                onChangeText={setName}
                                onFocus={() => setIsNameFocused(true)}
                                onBlur={() => setIsNameFocused(false)}
                                placeholderTextColor="#D3D3D3"
                                maxLength={25} // Maximum character limit
                            />
                            <Text style={styles.characterCount}>{remainingCharacters} characters left</Text>
                        </View>
                        <View style={styles.buttonContainer}>
                            <Button
                                disabled={name.length < 1}
                                title="Save"
                                onPress={() => {
                                    addName(name);
                                    navigation.navigate(PAGES.GROUP_LIST);
                                }}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLOR.APP_BACKGROUND,
        width: '100%',
    },
    inner: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: calcWidth(5),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: calcWidth(5),
    },
    image: {
        width: calcWidth(20),
        height: calcHeight(20),
        marginRight: calcWidth(5),
    },
    textContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        height: calcHeight(10),
    },
    headerText: {
        fontSize: getFontSizeByWindowWidth(18),
        fontWeight: 'bold',
        color: COLOR.TEXT,
        paddingBottom: calcHeight(3),
    },
    promptText: {
        fontSize: 14,
        color: COLOR.TEXT,
    },
    inputContainer: {
        marginTop: calcHeight(5),
    },
    nameInput: {
        color: COLOR.TEXT,
        fontSize: 18,
        borderBottomWidth: 1,
        marginBottom: 10, // Adjust as needed
        paddingBottom: calcHeight(2),
        paddingHorizontal: calcWidth(5),
    },
    characterCount: {
        fontSize: 12,
        color: COLOR.TEXT,
        textAlign: 'right',
    },
    buttonContainer: {
        alignItems: 'center',
    },
});

export default SignUpScreen;
