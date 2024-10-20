import { parsePhoneNumber } from 'libphonenumber-js';
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Modal from 'react-native-modal';

import COLOR from '../constants/Colors';
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

    const addToSelectedContacts = (phoneNumber) => {
        // validate phone number
        if (phoneNumber && !isNaN(Number(phoneNumber))) {
            phoneNumber = phoneNumber.substring(0, 10);
            const parsedNumber = parsePhoneNumber(phoneNumber, 'IN');
            if (parsedNumber && parsedNumber.isPossible() && phoneNumber.length == 10) {
                // if phone number is valid
                setSelectedContacts((prev) => [...prev, { phoneNumber, countryCode: '+91' }]);
                toggleBottomSheet();
                setError();
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
            <View style={bottomSheetStyle.modalContent}>
                <View style={bottomSheetStyle.center}>
                    <View style={bottomSheetStyle.barIcon} />
                </View>
                <View style={bottomSheetStyle.wrapper}>
                    <Text style={bottomSheetStyle.modalText}>Enter Phone Number</Text>
                    <TextInput
                        keyboardType="number-pad"
                        maxLength={10}
                        style={[bottomSheetStyle.textInput, error && { borderColor: COLOR.ERROR_BORDER }]}
                        onChangeText={setPhoneNumber}
                        value={phoneNumber}
                        textContentType="telephoneNumber"
                        onSubmitEditing={() => addToSelectedContacts(phoneNumber)}
                    />
                    <View>
                        <Text style={bottomSheetStyle.errorText}>{error}</Text>
                    </View>
                    <View style={bottomSheetStyle.buttonWrapper}>
                        <Pressable style={bottomSheetStyle.button} onPress={() => addToSelectedContacts(phoneNumber)}>
                            <Text style={bottomSheetStyle.textStyle}>Add</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default AddMemberModal;

const bottomSheetStyle = StyleSheet.create({
    sheet: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalContent: {
        backgroundColor: COLOR.APP_BACKGROUND,
        paddingTop: 12,
        paddingHorizontal: 12,
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        minHeight: calcHeight(70),
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
        color: COLOR.PRIMARY,
        fontWeight: 'bold',
        fontSize: getFontSizeByWindowWidth(17),
    },
    textInput: {
        color: COLOR.PRIMARY,
        borderBottomWidth: 0.8,
        borderBottomColor: 'gray',
        fontSize: getFontSizeByWindowWidth(16),
        marginTop: calcHeight(2),
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
        fontSize: getFontSizeByWindowWidth(14),
    },
});
