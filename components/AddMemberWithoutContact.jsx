import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Modal from 'react-native-modal';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import COLOR from '../constants/Colors';
import { AntDesign } from '@expo/vector-icons';
import { useContacts } from '../hooks/useContacts';
import { parsePhoneNumber } from 'libphonenumber-js';

const AddMemberWithoutContact = () => {
    const { search, contacts, setSelectedContacts } = useContacts();

    const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState();
    const [isContactFound, setIsContactFound] = useState(true);
    const [error, setError] = useState();

    const isContactAvailable = () => {
        if (contacts && contacts.length == 0) {
            setIsContactFound(false);
        } else {
            setIsContactFound(true);
        }
    };

    const toggleBottomSheet = () => {
        setError();
        setIsBottomSheetVisible(!isBottomSheetVisible);
    };

    const handleOpenSheet = (number) => {
        // validate phone number - check only whether the number have digits only
        const isNumber = !isNaN(Number(number));
        if (isNumber) {
            setPhoneNumber(number);
        } else {
            setPhoneNumber();
        }
        // open bottom sheet
        toggleBottomSheet();
    };

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

    useEffect(() => {
        isContactAvailable();
    }, [search]);

    return (
        <>
            <Pressable style={styles.container} onPress={() => handleOpenSheet(search)}>
                <View style={styles.row}>
                    <View style={[styles.placeHolderView, { backgroundColor: 'white' }]}>
                        <AntDesign name="adduser" size={calcHeight(selectorSize - 2.2)} color="black" />
                    </View>
                    {!isContactFound && search?.length > 0 ? (
                        <Text style={styles.text}>
                            Add "<Text style={styles.phoneNuber}>{search}</Text>" to Amigo
                        </Text>
                    ) : (
                        <Text style={styles.text}>Not in your contact list? Add here </Text>
                    )}
                </View>
            </Pressable>

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
        </>
    );
};

export default AddMemberWithoutContact;

const selectorSize = 5;

const styles = StyleSheet.create({
    container: {
        borderRadius: 2,
        marginTop: calcHeight(2),
        paddingBottom: calcHeight(2),
        borderBottomWidth: 0.5,
        borderColor: COLOR.PRIMARY_1,
    },
    text: {
        color: COLOR.PRIMARY,
        fontSize: getFontSizeByWindowWidth(13),
        fontWeight: '600',
        textAlignVertical: 'center',
    },
    row: {
        flexDirection: 'row',
        gap: calcWidth(4),
    },
    placeHolderView: {
        height: calcHeight(selectorSize),
        width: calcHeight(selectorSize),
        borderRadius: calcHeight(selectorSize),
        justifyContent: 'center',
        alignItems: 'center',
    },
    phoneNuber: {
        color: COLOR.BUTTON,
    },
});

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
        minHeight: 400,
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
        borderBottomColor: COLOR.PRIMARY_1,
        fontSize: getFontSizeByWindowWidth(16),
        marginTop: calcHeight(2),
        // width: calcWidth(50),
    },
    buttonWrapper: {
        marginTop: calcHeight(5),
        minWidth: calcWidth(50),
        // flexDirection: 'row',
        // justifyContent: 'space-evenly',
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
        // fontWeight: 'bold',
        fontSize: getFontSizeByWindowWidth(14),
        // textAlign: 'right',
    },
});
