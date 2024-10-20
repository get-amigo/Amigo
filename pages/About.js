import { Foundation } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import icon from '../assets/icon.png';
import COLOR from '../constants/Colors';
import about from '../constants/about';
import { calcHeight, calcWidth } from '../helper/res';

const About = () => {
    const renderLink = (iconName, text, onPress = () => {}) => (
        <Pressable style={styles.link} onPress={onPress}>
            <Foundation name={iconName} size={calcHeight(3)} color="white" />
            <Text style={styles.linkText}>{text}</Text>
        </Pressable>
    );

    return (
        <ScrollView contentContainerStyle={styles.scrollViewContent} alwaysBounceVertical={false}>
            <View style={styles.header}>
                <Image source={icon} style={styles.icon} />
                <Text style={styles.headerText}>What's Amigo</Text>
            </View>
            <Text style={styles.text}>{about}</Text>
            <View style={styles.linksContainer}>
                {renderLink('info', 'Terms and conditions', () => WebBrowser.openBrowserAsync('https://www.getamigo.today/terms'))}
                {renderLink('lock', 'Privacy Policy', () => WebBrowser.openBrowserAsync('https://www.getamigo.today/privacy'))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollViewContent: {
        margin: calcHeight(2),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: calcWidth(3),
    },
    icon: {
        width: calcHeight(4),
        height: calcHeight(4),
    },
    headerText: {
        color: COLOR.TEXT,
        fontWeight: 'bold',
    },
    text: {
        color: 'rgba(255,255,255,0.75)',
        marginTop: calcHeight(2),
        lineHeight: calcHeight(2.5),
    },
    linksContainer: {
        marginVertical: calcHeight(2),
    },
    link: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: calcWidth(3),
        marginVertical: calcHeight(1),
    },
    linkText: {
        color: COLOR.TEXT,
    },
});

export default About;
