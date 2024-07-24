import { AntDesign } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import AddMemberModal from './AddMemberModal';
import COLOR from '../constants/Colors';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import { useContacts } from '../hooks/useContacts';

const AddMemberWithoutContact = () => {
    const { search, contacts } = useContacts();

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

            <AddMemberModal
                setIsBottomSheetVisible={setIsBottomSheetVisible}
                isBottomSheetVisible={isBottomSheetVisible}
                toggleBottomSheet={toggleBottomSheet}
                error={error}
                setError={setError}
                setPhoneNumber={setPhoneNumber}
                phoneNumber={phoneNumber}
            />
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
        borderColor: 'gray',
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
