import { Dimensions, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import { AntDesign } from '@expo/vector-icons';
import COLOR from '../constants/Colors';
import parsePhoneNumber from 'libphonenumber-js';
import { useContacts } from '../hooks/useContacts';
import { Entypo } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetModal, BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet';

const AddMemberWithoutContact = () => {
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

    // Bottom sheet
    const bottomSheetRef = useRef(null);

    const [error, setError] = useState();
    const [phoneNumber, setPhoneNumber] = useState();

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

            {/* Bottom sheet */}
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
                style={bottomSheetStyle.bottomsheet}
            >
                <BottomSheetView style={bottomSheetStyle.contentContainer}>
                    <View style={bottomSheetStyle.form}>
                        <Text style={bottomSheetStyle.modalText}>Enter Phone Number</Text>
                        <BottomSheetTextInput
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
                </BottomSheetView>
            </BottomSheet>
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

const bottomSheetStyle = StyleSheet.create({
    bottomsheet: {
        // position: 'absolute',
        // bottom: 0,
        // width: '100%',
        // height: Dimensions.get('window').height,
    },
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
