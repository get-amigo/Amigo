import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import logo from '../assets/icon.png';
import GroupIcon from '../components/GroupIcon';
import COLOR from '../constants/Colors';
import apiHelper from '../helper/apiHelper';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';

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
                        <GroupIcon size={calcWidth(2.5)} groupId={groupId} />
                    </View>
                    <Text style={styles.groupName}>{groupName}</Text>
                    <Text style={styles.lightText}>Amigo group</Text>
                    <View style={styles.qrContainer}>
                        {inviteToken ? (
                            <QRCode
                                size={calcHeight(18)}
                                value={`joinGroup:${inviteToken}`}
                                logo={logo}
                                logoSize={30}
                                logoBackgroundColor="transparent"
                                color={COLOR.QR}
                            />
                        ) : (
                            <View>
                                <ActivityIndicator size="large" color={COLOR.QR} />
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
        width: calcWidth(18),
        height: calcWidth(18),
        borderRadius: calcWidth(9),
        position: 'absolute',
        top: -calcWidth(9),
        left: calcWidth(28.5),
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
        borderStartColor: 'red',
        backgroundColor: 'white',
        width: calcWidth(42),
        height: calcWidth(42),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: calcWidth(2),
        marginHorizontal: 'auto',
        marginTop: calcWidth(4),
        marginBottom: calcWidth(8),
    },
});
