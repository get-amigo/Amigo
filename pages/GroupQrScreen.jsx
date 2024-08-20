import { WEBSITE_URL } from '@env';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { QRCode } from 'react-native-qrcode-composer';
import { SafeAreaView } from 'react-native-safe-area-context';
import logo from '../assets/icons/qrIcon.png';
import GroupIcon from '../components/GroupIcon';
import COLOR from '../constants/Colors';
import apiHelper from '../helper/apiHelper';
import { calcWidth, getFontSizeByWindowWidth } from '../helper/res';

const GroupQrScreen = ({ route }) => {
    const groupId = route.params.groupId;
    const groupName = route.params.groupName;
    const [inviteToken, setInviteToken] = useState();

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

    return (
        <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.container}>
            <View style={styles.wrapper}>
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
                    This group QR code is private. If it is shared with someone, they can scan it with their Amigo camera to join the group.
                </Text>
            </View>
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
});
