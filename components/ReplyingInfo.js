import React from 'react';
import { Image, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import useReplyStore from '../stores/replyStore';
import * as Haptics from 'expo-haptics';
import cross from '../assets/icons/cross1.png';

function ReplyingInfo({ to, message }) {
    const { setIsReplying, setReplyingTo, setToReplyMessage } = useReplyStore();

    const handleClose = () => {
        setIsReplying(false);
        setReplyingTo(null);
        setToReplyMessage(null);
    };

    return (
        <View style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={styles.header}>
                    <Text style={styles.toText}>{to}</Text>
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            handleClose();
                        }}
                    >
                        <Image source={cross} style={styles.crossIcon} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.messageText}>{message}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#272239',
        padding: 10,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    innerContainer: {
        backgroundColor: '#463e63',
        padding: 13,
        borderRadius: 13,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    toText: {
        color: '#a38df2',
        fontWeight: '700',
        fontSize: 20,
    },
    crossIcon: {
        width: 15,
        height: 15,
        tintColor: '#a38df2',
    },
    messageText: {
        color: 'white',
        fontSize: 13,
        marginTop: 5,
    },
});

export default ReplyingInfo;
