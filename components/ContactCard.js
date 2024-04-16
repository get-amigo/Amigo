import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons'; // Make sure to install expo-icons or another icon library

// Helper functions for responsive layout
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import COLOR from '../constants/Colors';

function ContactCard({ selected, color, name, phoneNumber, imageURI }) {
    return (
        <View style={styles.container}>
            {imageURI ? (
                <Image source={{ uri: imageURI }} style={styles.profileImage} />
            ) : (
                <View style={[styles.placeHolderView, { backgroundColor: color }]}>
                    <Text>{name.charAt(0).toUpperCase()}</Text>
                </View>
            )}
            <View style={styles.textContainer}>
                <Text style={styles.nameText}>{name}</Text>
                <Text style={styles.phoneText}>{phoneNumber}</Text>
            </View>
            <View style={styles.selectorContainer}>
                {selected ? (
                    <AntDesign name="checkcircle" size={calcWidth(5)} color={COLOR.BUTTON} />
                ) : (
                    <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={calcWidth(5)} color="white" />
                )}
            </View>
        </View>
    );
}

export default ContactCard;
const selectorSize = 5;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: calcWidth(5),
        backgroundColor: COLOR.APP_BACKGROUND,
        justifyContent: 'space-between',
    },
    profileImage: {
        height: calcHeight(5),
        width: calcHeight(5),
        borderRadius: calcHeight(5),
    },
    textContainer: {
        width: calcWidth(60),
    },
    nameText: {
        color: COLOR.TEXT,
        fontSize: getFontSizeByWindowWidth(12),
    },
    phoneText: {
        fontSize: getFontSizeByWindowWidth(10),
        color: COLOR.PRIMARY,
    },
    placeHolderView: {
        height: calcHeight(selectorSize),
        width: calcHeight(selectorSize),
        borderRadius: calcHeight(selectorSize),
        justifyContent: 'center',
        alignItems: 'center',
    },
});
