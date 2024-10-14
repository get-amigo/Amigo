import { Feather, FontAwesome5 } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { parsePhoneNumber } from 'libphonenumber-js';
import React, { useState } from 'react';
import { FlatList, Image, KeyboardAvoidingView, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import ArrowDown2 from '../assets/icons/Arrow-bottom.png';
import ArrowDown from '../assets/icons/Arrow-down.png';
import SearchIcon from '../assets/icons/Search.png';
import COLOR from '../constants/Colors';
import COUNTRY from '../constants/Countries';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import { useContacts } from '../hooks/useContacts';

const AddMemberModal = ({
    setIsBottomSheetVisible,
    isBottomSheetVisible,
    toggleBottomSheet,
    error,
    setError,
    setPhoneNumber,
    phoneNumber,
}) => {
    const { setSelectedContacts } = useContacts();
    const [contactName, setContactName] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const indiaIndex = COUNTRY.findIndex((country) => country.name === 'India');
    const [selectedCountry, setSelectedCountry] = useState(COUNTRY[indiaIndex]);
    const [countryCode, setCountryCode] = useState('+91');
    const [isPhoneFocused, setIsPhoneFocused] = useState(false);

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

    const addToSelectedContacts = async () => {
        // validate phone number
        if (phoneNumber && !isNaN(Number(phoneNumber))) {
            //  phoneNumber = phoneNumber.substring(0, 10);
            const parsedNumber = parsePhoneNumber(phoneNumber, 'IN');
            if (parsedNumber && parsedNumber.isPossible() && phoneNumber.length == 10) {
                // if phone number is valid
                try {
                    const contact = {
                        [Contacts.Fields.FirstName]: contactName, // Use contact name
                        [Contacts.Fields.PhoneNumbers]: [{ number: phoneNumber, isPrimary: true }],
                    };
                    const contactId = await Contacts.addContactAsync(contact);
                    console.log('Contact saved with ID:', contactId);

                    setSelectedContacts((prev) => [...prev, { phoneNumber, countryCode: '+91', name: contactName }]);
                    toggleBottomSheet();
                    setError('');
                } catch (err) {
                    console.error('Error saving contact:', err);
                    setError('Failed to save contact');
                }
            } else {
                // if phone number is not valid
                setError('Invalid Phone Number');
            }
        } else {
            // if phone number is not valid
            setError('Invalid Phone Number');
        }
    };

    return (
        <Modal
            onBackdropPress={() => setIsBottomSheetVisible(false)}
            onBackButtonPress={() => setIsBottomSheetVisible(false)}
            isVisible={isBottomSheetVisible}
            swipeDirection="down"
            onSwipeComplete={toggleBottomSheet}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            animationInTiming={200}
            animationOutTiming={250}
            backdropTransitionInTiming={300}
            backdropTransitionOutTiming={350}
            style={bottomSheetStyle.sheet}
            statusBarTranslucent
        >
            <KeyboardAvoidingView>
                <View style={bottomSheetStyle.modalContent}>
                    <View style={bottomSheetStyle.center}>
                        <View style={bottomSheetStyle.barIcon} />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.headerText}>New Contact</Text>
                    </View>
                    <View style={bottomSheetStyle.wrapper}>
                        <Text style={bottomSheetStyle.modalText}>Enter Contact Name</Text>

                        <View style={styles.phoneNumberRow}>
                            <FontAwesome5 name="user" size={calcWidth(5)} color="#D3D3D3" style={styles.iconStyle} />
                            <TextInput
                                style={{
                                    ...getTextInputStyle(isPhoneFocused),
                                }}
                                onChangeText={setContactName}
                                value={contactName}
                                onFocus={() => setIsPhoneFocused(true)}
                                onBlur={() => setIsPhoneFocused(false)}
                            />
                        </View>

                        <Text style={bottomSheetStyle.modalText}>Enter Phone Number</Text>

                        <View style={styles.phoneNumberRow}>
                            <Feather name="phone" size={calcWidth(5)} style={styles.iconStyle} />
                            <TouchableOpacity
                                onPress={toggleModal}
                                style={{
                                    borderBottomWidth: 1,
                                    borderBottomColor: isModalVisible ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.5)',
                                    marginTop: calcHeight(1),
                                    flexDirection: 'row',
                                    paddingBottom: calcHeight(1),
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
                                maxLength={10}
                                onChangeText={setPhoneNumber}
                                value={phoneNumber}
                                onFocus={() => setIsPhoneFocused(true)}
                                onBlur={() => setIsPhoneFocused(false)}
                                onSubmitEditing={addToSelectedContacts}
                            />
                        </View>

                        <View>
                            <Text style={bottomSheetStyle.errorText}>{error}</Text>
                        </View>
                        <View style={bottomSheetStyle.buttonWrapper}>
                            <Pressable style={bottomSheetStyle.button} onPress={addToSelectedContacts}>
                                <Text style={bottomSheetStyle.textStyle}>Add</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
                {/* Country selection modal */}
                <Modal
                    animationType="slide"
                    transparent
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
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default AddMemberModal;

const bottomSheetStyle = StyleSheet.create({
    sheet: {
        // justifyContent: 'flex-end',
        margin: 0,
    },
    modalContent: {
        backgroundColor: COLOR.APP_BACKGROUND,
        paddingTop: 12,
        paddingHorizontal: 12,
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        minHeight: calcHeight(50),
        paddingBottom: 20,
    },
    center: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    barIcon: {
        width: 60,
        height: 5,
        backgroundColor: '#bbb',
        borderRadius: 3,
        marginBottom: 5,
    },
    wrapper: {
        flex: 1,
        paddingHorizontal: calcWidth(5),
        paddingVertical: calcWidth(3),
    },

    textStyle: {
        color: COLOR.PRIMARY,
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: getFontSizeByWindowWidth(14),
    },
    modalText: {
        fontSize: getFontSizeByWindowWidth(10),
        color: COLOR.TEXT,
        paddingTop: 20,
        paddingBottom: 5,
    },
    buttonWrapper: {
        marginTop: calcHeight(5),
        minWidth: calcWidth(50),
    },
    button: {
        paddingVertical: calcWidth(2),
        paddingHorizontal: calcWidth(5),
        color: COLOR.PRIMARY,
        backgroundColor: COLOR.BUTTON,
        borderRadius: 4,
    },
    errorText: {
        marginTop: calcHeight(0.7),
        color: COLOR.ERROR_BORDER,
        fontSize: getFontSizeByWindowWidth(10),
    },
});
const styles = StyleSheet.create({
    textContainer: {
        alignItems: 'center',
    },
    headerText: {
        fontSize: getFontSizeByWindowWidth(18),
        fontWeight: 'bold',
        color: COLOR.TEXT,
        paddingTop: calcHeight(2),
    },

    phoneNumberInput: {
        flex: 1,
        color: COLOR.TEXT,
        fontSize: 18,
        borderBottomWidth: 1,
        paddingBottom: calcHeight(1),
        paddingLeft: calcWidth(2),
        fontWeight: 'bold',
    },
    countryCodeText: {
        color: COLOR.TEXT,
        fontSize: 18,

        fontWeight: 'bold',
        paddingBottom: calcHeight(1),
    },
    phoneNumberRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconStyle: {
        color: '#D3D3D3',
        marginRight: calcWidth(5),
        marginTop: calcHeight(0.5),
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
