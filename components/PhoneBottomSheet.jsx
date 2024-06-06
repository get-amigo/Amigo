import { Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet';
import COLOR from '../constants/Colors';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import { PhoneNumberBottomSheetContext } from '../context/PhoneNumberBottomSheetContext';
import { useContacts } from '../hooks/useContacts';
import { parsePhoneNumber } from 'libphonenumber-js';

const PhoneBottomSheet = () => {
    const { bottomSheetRef, phoneNumber, setPhoneNumber } = useContext(PhoneNumberBottomSheetContext);
    const { setSelectedContacts } = useContacts();
    const [error, setError] = useState();

    const renderBackdrop = useCallback((props) => <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />, []);

    const snapPoints = useMemo(() => ['40%', '70%'], []);

    const handleSheetChanges = useCallback((index) => {
        console.log('handleSheetChanges', index);
    }, []);

    const handleClose = useCallback(() => {
        setError();
    }, []);

    const addToSelectedContacts = (phoneNumber) => {
        // validate phone number
        if (phoneNumber && !isNaN(Number(phoneNumber))) {
            phoneNumber = phoneNumber.substring(0, 10);
            const parsedNumber = parsePhoneNumber(phoneNumber, 'IN');
            if (parsedNumber && parsedNumber.isPossible() && phoneNumber.length == 10) {
                // if phone number is valid
                setSelectedContacts((prev) => [...prev, { phoneNumber }]);
                bottomSheetRef.current.close();
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
        <BottomSheet
            ref={bottomSheetRef}
            enablePanDownToClose
            onChange={handleSheetChanges}
            snapPoints={snapPoints}
            index={-1}
            backgroundStyle={{
                backgroundColor: COLOR.APP_BACKGROUND,
            }}
            handleIndicatorStyle={{
                backgroundColor: COLOR.PRIMARY,
            }}
            handleStyle={
                {
                    // backgroundColor: 'red',
                    // borderRadius: 30,
                    // borderTopWidth: 1,
                    // borderTopColor: COLOR.PRIMARY_1,
                }
            }
            backdropComponent={renderBackdrop}
            onClose={handleClose}
        >
            <BottomSheetView style={styles.contentContainer}>
                <View style={styles.form}>
                    <Text style={styles.modalText}>Enter Phone Number</Text>
                    <BottomSheetTextInput
                        keyboardType="number-pad"
                        maxLength={10}
                        style={[styles.textInput, error && { borderColor: COLOR.ERROR_BORDER }]}
                        onChangeText={setPhoneNumber}
                        value={phoneNumber}
                        textContentType="telephoneNumber"
                    />
                    <View>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                    <View style={styles.buttonWrapper}>
                        <Pressable style={styles.button} onPress={() => addToSelectedContacts(phoneNumber)}>
                            <Text style={styles.textStyle}>Add</Text>
                        </Pressable>
                    </View>
                </View>
            </BottomSheetView>
        </BottomSheet>
    );
};

export default PhoneBottomSheet;

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        paddingHorizontal: calcWidth(5),
        paddingVertical: calcWidth(3),
    },
    input: {
        marginTop: 8,
        marginBottom: 10,
        borderRadius: 10,
        fontSize: 16,
        lineHeight: 20,
        padding: 8,
        backgroundColor: 'rgba(151, 151, 151, 0.25)',
    },
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
        fontSize: getFontSizeByWindowWidth(14),
    },
    modalText: {
        color: COLOR.PRIMARY,
        fontWeight: 'bold',
        fontSize: getFontSizeByWindowWidth(17),
    },
    form: {},
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
    cross: {
        position: 'absolute',
        right: calcWidth(4),
        top: calcWidth(4),
    },
});
