import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, Image, TouchableOpacity, FlatList } from 'react-native';
import LoginImage from '../assets/Login.png';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import Button from '../components/Button';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import { useOtp } from '../context/OtpContext';
import COUNTRY from '../constants/Countries';

const LoginScreen = ({ navigation }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [isPhoneFocused, setIsPhoneFocused] = useState(false);
    const [error, setError] = useState(false);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    const { loginWithPhoneNumber } = useOtp();

    const getTextInputStyle = (isFocused) => ({
        ...styles.phoneNumberInput,
        borderBottomColor: isFocused ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.5)',
    });

    const toggleDropdown = () => {
        setIsDropdownVisible(!isDropdownVisible);
    };

    const handleSelectCountry = (country) => {
        setCountryCode(country.code);
        setIsDropdownVisible(false);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => handleSelectCountry(item)}
        >
            <Text style={styles.countryCode}>{item.code}</Text>
            <Text style={styles.countryName}>{item.name}</Text>
        </TouchableOpacity>
    );

    const handleSendOTP = async () => {
        if (!phoneNumber || phoneNumber.length !== 10) {
            setError(true);
            return;
        }

        loginWithPhoneNumber(countryCode + phoneNumber);

        navigation.navigate(PAGES.OTP, { phoneNumber: countryCode + phoneNumber });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={styles.header}>
                    <Image source={LoginImage} style={styles.image} resizeMode="contain" />
                    <View style={styles.textContainer}>
                        <Text style={styles.headerText}>Hi there!</Text>
                        <Text style={styles.promptText}>Please enter your phone number</Text>
                    </View>
                </View>
                <View style={styles.inputContainer}>
                    <View style={styles.phoneNumberRow}>
                        <TouchableOpacity onPress={toggleDropdown}  style={{
        borderBottomWidth: 1,
        borderBottomColor: isDropdownVisible ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.5)',
        marginTop: calcHeight(0.3),
    }}>
                            <Text style={styles.countryCodeText}>{countryCode}</Text>
                        </TouchableOpacity>
                        <TextInput
                        style={{
                            ...getTextInputStyle(isPhoneFocused),
                            ...(error ? { borderBottomColor: COLOR.ERROR_BORDER } : {}),
                        }}
                        keyboardType="phone-pad"
                        value={phoneNumber}
                        onChangeText={(value) => {
                            setPhoneNumber(value);
                            setError(false);
                        }}
                        onFocus={() => setIsPhoneFocused(true)}
                        onBlur={() => setIsPhoneFocused(false)}
                        placeholderTextColor="#D3D3D3"
                    />
                    </View>
                    
                </View>
                {isDropdownVisible && (
                    <View style={styles.dropdownContainer}>
                        <FlatList
                            data={COUNTRY}
                            keyExtractor={(item) => `${item.code}-${item.name}`}
                            renderItem={renderItem}
                        />
                    </View>
                )}
                <Button title="Send OTP" onPress={handleSendOTP} />
            </View>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLOR.APP_BACKGROUND,
    },
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
    inputContainer: {
        alignItems: 'center',
        marginHorizontal: calcWidth(6),
        marginTop: calcHeight(2),
    },
    phoneNumberInput: {
        flex: 1,
        color: COLOR.TEXT,
        fontSize: 18,
        borderBottomWidth: 1,
        paddingBottom: calcHeight(2),
        marginLeft: calcWidth(1),
        fontWeight: 'bold',
    },
    countryCodeText: {
        color: COLOR.TEXT,
        fontSize: 18,

    },
    phoneNumberRow: {
        flexDirection: 'row',
    },
    dropdownContainer: {
        // position: 'absolute',
        top: calcHeight(2), 
        left: calcWidth(6),
        width: calcWidth(80),
        maxHeight:calcHeight(40),
        backgroundColor: COLOR.BORDER_COLOR,
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: calcHeight(1),
        paddingHorizontal: calcWidth(2),
    },
    countryCode: {
        width: calcWidth(12),
        color: COLOR.TEXT,
        fontSize: 16,
    },
    countryName: {
        color: COLOR.TEXT,
        fontSize: 16,
    },
});

export default LoginScreen;
