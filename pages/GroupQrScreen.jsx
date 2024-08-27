import { WEBSITE_URL } from '@env';
import Entypo from '@expo/vector-icons/Entypo';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { QRCode } from 'react-native-qrcode-composer';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import logo from '../assets/icons/qrIcon.png';
import GroupIcon from '../components/GroupIcon';
import COLOR from '../constants/Colors';
import apiHelper from '../helper/apiHelper';
import { calcWidth, getFontSizeByWindowWidth } from '../helper/res';

const GroupQrScreen = ({ route }) => {
    const groupId = route.params.groupId;
    const groupName = route.params.groupName;
    const [inviteToken, setInviteToken] = useState();

    const qrCodeView = useRef(null);

    useEffect(() => {
        async function getToken() {
            try {
                const shareUrl = await apiHelper.get(`/group/${groupId}/token`);
                setInviteToken(shareUrl.data);
            } catch (e) {
                console.error('Error in getting token', e);
            }
        }
        getToken();
    }, []);

    const captureQrCode = async () => {
        if (qrCodeView.current) {
            try {
                const uri = await qrCodeView.current.capture();
                shareQrCode(uri);
            } catch (error) {
                console.error('Error capturing QR code:', error);
            }
        }
    };

    const shareQrCode = async (imageUri) => {
        const shareOptions = {
            dialogTitle: 'Group Invite QR Code',
            UTI: 'jpg',
            url: imageUri,
        };

        try {
            await Sharing.shareAsync(imageUri, shareOptions);
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.container}>
            <View style={styles.wrapper}>
                <ViewShot style={styles.boxWrapper} options={{ format: 'jpg', quality: 1 }} ref={qrCodeView}>
                    <View style={styles.box}>
                        <View style={styles.groupImageContainer}>
                            <GroupIcon size={calcWidth(1.9)} groupId={groupId} />
                        </View>
                        <Text style={styles.groupName}>{groupName}</Text>
                        <Text style={styles.lightText}>Amigo group</Text>
                        <View style={styles.qrContainer}>
                            {inviteToken ? (
                                <QRCode
                                    value={`${WEBSITE_URL}/invite/#/join?groupId=${inviteToken}`}
                                    logo={logo}
                                    size={calcWidth(58)}
                                    logoStyle={{ size: calcWidth(15) }}
                                    style={{
                                        errorCorrectionLevel: 'L',
                                        color: 'white',
                                        backgroundColor: COLOR.QR,
                                        detectionMarkerOptions: {
                                            cornerRadius: 0.8,
                                        },
                                        patternOptions: {
                                            connected: false,
                                            cornerRadius: 5,
                                        },
                                    }}
                                />
                            ) : (
                                <View>
                                    <ActivityIndicator size="large" color={'white'} />
                                </View>
                            )}
                        </View>
                    </View>
                    <Text style={styles.info}>
                        This group QR code is private. If it is shared with someone, they can scan it with their Amigo camera to join the
                        group.
                    </Text>
                </ViewShot>
            </View>
            <Pressable onPress={captureQrCode} style={styles.shareButton}>
                <Entypo name="share" size={24} color="white" />
                <Text style={styles.shareText}>Share QR</Text>
            </Pressable>
        </SafeAreaView>
    );
};

export default GroupQrScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    wrapper: { flexDirection: 'column' },
    box: {
        width: calcWidth(75),
        backgroundColor: COLOR.APP_BACKGROUND,
        borderRadius: calcWidth(2),
        position: 'relative',
    },
    groupImageContainer: {
        width: calcWidth(14),
        height: calcWidth(14),
        borderRadius: calcWidth(7),
        position: 'absolute',
        top: -calcWidth(7),
        left: calcWidth(30),
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    groupName: {
        color: 'white',
        marginTop: calcWidth(14),
        fontSize: getFontSizeByWindowWidth(14),
        fontWeight: '500',
        textAlign: 'center',
    },
    lightText: {
        color: COLOR.LIGHT_GRAY,
        fontSize: getFontSizeByWindowWidth(11),
        textAlign: 'center',
        fontWeight: '300',
    },
    info: {
        color: COLOR.LIGHT_GRAY,
        fontSize: getFontSizeByWindowWidth(11),
        marginTop: calcWidth(3),
        maxWidth: calcWidth(80),
        paddingHorizontal: calcWidth(5),
        textAlign: 'center',
        fontWeight: '300',
    },
    qrContainer: {
        width: calcWidth(62),
        height: calcWidth(62),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: calcWidth(2),
        marginHorizontal: 'auto',
        marginTop: calcWidth(4),
        marginBottom: calcWidth(8),
        backgroundColor: COLOR.QR,
    },
    boxWrapper: {
        paddingHorizontal: calcWidth(4),
        paddingTop: calcWidth(12),
        paddingBottom: calcWidth(10),
    },
    shareButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: calcWidth(2),
    },
    shareText: {
        color: 'white',
        fontWeight: '600',
    },
});
