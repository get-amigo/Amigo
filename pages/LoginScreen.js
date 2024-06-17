import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Image,
    TouchableOpacity,
    FlatList,
    Modal,
    Button as RNButton,
    KeyboardAvoidingView,
} from 'react-native';
import LoginImage from '../assets/Login.png';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import Button from '../components/Button';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import { useOtp } from '../context/OtpContext';
import COUNTRY from '../constants/Countries';
import BackImage from '../assets/back.png';
import ArrowDown from '../assets/icons/Arrow-down.png';
import SearchIcon from '../assets/icons/Search.png';
import ArrowDown2 from '../assets/icons/Arrow-bottom.png';

const LoginScreen = ({ navigation }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [isPhoneFocused, setIsPhoneFocused] = useState(false);
    const [error, setError] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const indiaIndex = COUNTRY.findIndex((country) => country.name === 'India');
    const [selectedCountry, setSelectedCountry] = useState(COUNTRY[indiaIndex]);

    const { loginWithPhoneNumber } = useOtp();

    const getTextInputStyle = (isFocused) => ({
        ...styles.phoneNumberInput,
        borderBottomColor: isFocused ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.5)',
    });

    const toggleModal = () => {
        setIsModalVisible(!isModalVisible);
    };

    const handleSelectCountry = (country) => {
        setCountryCode(country.code);
        setSelectedCountry(country);
        setIsModalVisible(false);
    };

    const filteredCountryList = COUNTRY.filter((country) => country.name.toLowerCase().startsWith(searchQuery.toLowerCase()));

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.dropdownItem} onPress={() => handleSelectCountry(item)}>
            <Image source={{ uri: item.flag }} style={styles.flagImage} />
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
        <>
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
                        <TouchableOpacity
                            onPress={toggleModal}
                            style={{
                                borderBottomWidth: 1,
                                borderBottomColor: isModalVisible ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.5)',
                                marginTop: calcHeight(0.3),
                                flexDirection: 'row',
                            }}
                        >
                            <Image source={{ uri: selectedCountry.flag }} style={styles.flagImage} />
                            <Image
                                source={ArrowDown2}
                                style={{ width: calcWidth(3), height: calcHeight(2.4), marginLeft: calcWidth(2) }}
                                resizeMode="contain"
                            />
                        </TouchableOpacity>
                        <View
                            style={{
                                borderBottomColor: isPhoneFocused ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.5)',
                                borderBottomWidth: 1,
                                marginLeft: calcWidth(4),
                            }}
                        >
                            <Text style={styles.countryCodeText}>{countryCode}</Text>
                        </View>
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
                    <Button title="Send OTP" onPress={handleSendOTP} />
                </View>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => {
                    setIsModalVisible(false);
                }}
            >
                <KeyboardAvoidingView style={{ height: calcHeight(100) }}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalView}>
                            <TouchableOpacity
                                style={{ position: 'absolute', left: calcWidth(2), top: calcHeight(1) }}
                                onPress={toggleModal}
                            >
                                <Image source={ArrowDown} style={styles.backImage} resizeMode="contain" />
                            </TouchableOpacity>
                            <TextInput
                                style={styles.countrySearchInput}
                                placeholder="Search country..."
                                placeholderTextColor="#D3D3D3"
                                onChangeText={(text) => setSearchQuery(text)}
                                value={searchQuery}
                            />
                            <Image source={SearchIcon} style={styles.searchIcon} resizeMode="contain" />
                            <FlatList
                                data={filteredCountryList}
                                keyExtractor={(item) => `${item.code}-${item.name}`}
                                renderItem={renderItem}
                            />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
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
        paddingLeft: calcWidth(2),
        fontWeight: 'bold',
    },
    countryCodeText: {
        color: COLOR.TEXT,
        fontSize: 18,
        top: calcHeight(0.3),
        fontWeight: 'bold',
    },
    phoneNumberRow: {
        flexDirection: 'row',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: calcWidth(100),
        height: calcHeight(100),
        backgroundColor: COLOR.APP_BACKGROUND,
        paddingHorizontal: calcWidth(4),
        paddingTop: calcHeight(6),
        paddingBottom: calcHeight(4),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: calcHeight(1.2),
        borderBottomColor: COLOR.BORDER_COLOR,
        borderBottomWidth: 0.5,
    },
    flagImage: {
        width: calcHeight(3),
        height: calcHeight(2.4),
        marginRight: calcWidth(3),
        borderRadius: 2,
    },
    countryCode: {
        width: calcWidth(12),
        color: COLOR.TEXT,
        fontSize: 16,
        fontWeight: '700',
    },
    countryName: {
        color: COLOR.TEXT,
        fontSize: 18,
        fontWeight: 'bold',
    },
    backImage: {
        width: calcWidth(2),
        height: calcHeight(2),
        aspectRatio: 1,
        marginLeft: calcWidth(2),
        marginTop: calcHeight(1),
    },
    countrySearchInput: {
        paddingBottom: calcWidth(2),
        paddingLeft: calcWidth(6),
        marginBottom: calcWidth(4),
        color: COLOR.TEXT,
        fontSize: 18,
        borderBottomWidth: 1,
        borderBottomColor: COLOR.PRIMARY,
        fontWeight: 'bold',
    },
    searchIcon: {
        position: 'absolute',
        top: calcHeight(5.6),
        left: calcWidth(4),
        width: calcWidth(4),
        height: calcHeight(4),
    },
});

export default LoginScreen;
