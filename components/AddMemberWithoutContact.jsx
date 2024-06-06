import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import { AntDesign } from '@expo/vector-icons';
import COLOR from '../constants/Colors';
import parsePhoneNumber from 'libphonenumber-js';
import { useContacts } from '../hooks/useContacts';
import { Entypo } from '@expo/vector-icons';
import { PhoneNumberBottomSheetContext } from '../context/PhoneNumberBottomSheetContext';

const AddMemberWithoutContact = () => {
    const { bottomSheetRef, setPhoneNumber } = useContext(PhoneNumberBottomSheetContext);
    const { search, contacts, selectedContacts, setSelectedContacts } = useContacts();

    const [isContactFound, setIsContactFound] = useState(true);

    const isContactAvailable = () => {
        if (contacts && contacts.length == 0) {
            setIsContactFound(false);
        } else {
            setIsContactFound(true);
        }
    };

    useEffect(() => {
        isContactAvailable();
    }, [search]);

    const handleOpenSheet = (number) => {
        // open bottom sheet
        bottomSheetRef.current.expand();

        // validate phone number - check only whether the number have digits only
        const isNumber = !isNaN(Number(number));
        if (isNumber) {
            setPhoneNumber(number);
        } else {
            setPhoneNumber();
        }
    };

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
    profileImage: {
        height: calcHeight(5),
        width: calcHeight(5),
        borderRadius: calcHeight(5),
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

const modalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLOR.APP_BACKGROUND_TRANSLUCENT,
        paddingBottom: calcHeight(20),
    },
    modalView: {
        backgroundColor: COLOR.APP_BACKGROUND,
        borderRadius: 20,
        padding: 35,
        paddingTop: calcHeight(10),
        alignItems: 'center',
        shadowColor: '#756a9c',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        height: calcHeight(33),
    },

    textStyle: {
        color: COLOR.PRIMARY,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        color: COLOR.PRIMARY,
        fontWeight: 'bold',
        fontSize: getFontSizeByWindowWidth(12),
    },
    form: {},
    textInput: {
        color: COLOR.PRIMARY,
        borderBottomWidth: 0.8,
        borderBottomColor: COLOR.PRIMARY_1,
        width: calcWidth(50),
    },
    buttonWrapper: {
        marginTop: 'auto',
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
        fontWeight: 'bold',
        fontSize: getFontSizeByWindowWidth(11),
    },
    cross: {
        position: 'absolute',
        right: calcWidth(4),
        top: calcWidth(4),
    },
});
