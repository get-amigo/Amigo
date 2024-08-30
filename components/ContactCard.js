import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import COLOR from '../constants/Colors';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import HighlightedText from './HighlightText';

function ContactCard({ selected, color, name, imageURI, search }) {
    return (
        <View style={styles.container}>
            <View style={styles.contactContainer}>
                {imageURI ? (
                    <Image source={{ uri: imageURI }} style={styles.profileImage} />
                ) : (
                    <View style={[styles.placeHolderView, { backgroundColor: color }]}>
                        <Text>{name.charAt(0).toUpperCase()}</Text>
                    </View>
                )}
                <View style={styles.textContainer}>
                    <HighlightedText text={name} target={search} style={styles.nameText} />
                </View>
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
        paddingVertical: calcWidth(3),
        backgroundColor: COLOR.APP_BACKGROUND,
        justifyContent: 'space-between',
    },
    contactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        height: calcHeight(5),
        width: calcHeight(5),
        borderRadius: calcHeight(5),
        marginRight: calcWidth(3),
    },
    textContainer: {
        width: calcWidth(60),
    },
    nameText: {
        color: COLOR.TEXT,
        fontSize: getFontSizeByWindowWidth(13),
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
        marginRight: calcWidth(3),
    },
});
