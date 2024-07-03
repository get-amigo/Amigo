import React, { useLayoutEffect, useEffect, useRef, useState } from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    Image,
    Pressable,
    TextInput,
    TouchableOpacity,
    Platform,
    Share,
    Alert,
    Dimensions,
} from 'react-native';
import { useAuth } from '../stores/auth';
import COLOR from '../constants/Colors';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import SignUpImage from '../assets/SignUp.png';
import UserAvatar from '../components/UserAvatar';
import { Feather, Octicons, AntDesign, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import MenuOption from '../components/AccountPageOption';
import PAGES from '../constants/pages';
import { useBalance } from '../stores/balance';
import { MotiView } from 'moti';
import { BounceIn, BounceInDown, BounceOut, Easing, FadeInLeft, FadeOutUp } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';

function ProfileScreen({ navigation }) {
    const { user, logout, editUser, deleteAccount } = useAuth();
    const [editMode, setEditMode] = useState(false);
    const [name, setName] = useState(user.name);
    const [originalName, setOriginalName] = useState(user.name);
    const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);
    const { totalBalances } = useBalance();

    const [isSubmitting, setIsSubmitting] = useState(false);

    function submitUserData() {
        setIsSubmitting(true);
    }

    function deleteHandler() {
        if (totalBalances) {
            if (totalBalances < 0) alert(`You have a balance of ₹${totalBalances} to settle before deleting your account`);
            else alert(`You have a balance of ₹${totalBalances} to collect before deleting your account`);
            return;
        }
        if (Platform.OS === 'ios') {
            Alert.prompt(
                'Delete Confirmation',
                'Do you really want to delete your account? Please enter "DELETE" to confirm.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delete',
                        onPress: (text) => {
                            if (text.toUpperCase() === 'DELETE') {
                                deleteAccount();
                            } else {
                                deleteHandler();
                            }
                        },
                        style: 'destructive',
                    },
                ],
                'plain-text',
                '',
            );
        } else {
            Alert.alert('Delete Confirmation', 'Do you really want to delete your account?', [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    onPress: deleteAccount,
                    style: 'destructive',
                },
            ]);
        }
    }

    function logoutHandler() {
        Alert.alert('Logout Confirmation', 'Do you really want to logout?', [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'Logout',
                onPress: logout,
                style: 'destructive',
            },
        ]);
    }

    useEffect(() => {
        if (isSubmitting) {
            if (!name || name === '') {
                alert('Empty Name');
                setIsSubmitting(false);
                return;
            }
            editUser({ name });
            setOriginalName(name);
            setEditMode(false);
            setIsSubmitting(false);
        }
    }, [isSubmitting, name, phoneNumber]);

    const menuOptions = [
        {
            label: 'FAQ',
            iconName: 'message-square',
            IconComponent: Feather,
            onPress: () => navigation.navigate(PAGES.FAQ),
        },
        {
            label: 'About',
            iconName: 'cellphone-dock',
            IconComponent: MaterialCommunityIcons,
            onPress: () => navigation.navigate(PAGES.ABOUT),
        },
    ];

    return (
        <Animated.View style={[styles.container]}>
            <SafeAreaView style={styles.container}>
                <MotiView
                    from={{ opacity: 1, scale: 0.3 }}
                    animate={{ opacity: 1, scale: 3 }}
                    transition={{
                        type: 'timing',
                        duration: 300,
                    }}
                    style={styles.pulsatingCircle}
                />
                <MotiView
                    style={{
                        marginVertical: calcHeight(4),
                    }}
                >
                    {editMode ? (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: calcWidth(4) }}>
                            <TouchableOpacity onPress={() => setEditMode(false)}>
                                <Text style={[styles.bottomBarText, { fontWeight: 'bold' }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={submitUserData}>
                                <Text style={[styles.bottomBarText, { fontWeight: 'bold' }]}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: calcWidth(4), gap: calcWidth(8) }}>
                            <TouchableOpacity
                                onPress={() => {
                                    navigation.navigate(PAGES.BALANCE);
                                }}
                            >
                                <MaterialIcons name="arrow-back" size={24} color={'#FFF'} />
                            </TouchableOpacity>
                            <Text style={{ fontSize: getFontSizeByWindowWidth(17), color: '#FFF', fontWeight: 'bold' }}>Account</Text>
                        </View>
                    )}
                </MotiView>
                <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 600, delay: 0 }}>
                    <View style={styles.userInfo}>
                        <MotiView
                            id="userav"
                            from={{
                                position: 'absolute',
                                opacity: 1,
                                top: calcHeight(-11),
                                borderRadius: calcWidth(200),
                                right: calcWidth(-72),
                                scale: 0.5,
                                zIndex: 1,
                            }}
                            animate={{
                                top: calcHeight(0),
                                opacity: 1,
                                right: calcWidth(0),
                                backgroundColor: COLOR.APP_BACKGROUND,
                                scale: 1,
                            }}
                            transition={{ type: 'timing', duration: 500 }}
                        >
                            <UserAvatar user={user} size={7} />
                        </MotiView>
                        <View>
                            {editMode ? (
                                <TextInput style={styles.userName} value={name} onChangeText={setName} autoFocus />
                            ) : (
                                <Text style={styles.userName}>{name}</Text>
                            )}
                            <Text style={styles.userPhone}>{phoneNumber}</Text>
                        </View>
                        <Pressable
                            onPress={() => {
                                setEditMode((prev) => !prev);
                            }}
                        >
                            <Feather name="edit-3" size={calcHeight(3)} color={COLOR.BUTTON} />
                        </Pressable>
                    </View>
                </MotiView>
                <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 600, delay: 0 }}>
                    <Pressable
                        style={styles.inviteFriends}
                        onPress={() => {
                            Share.share({
                                message:
                                    'Download our App: ' +
                                    `${
                                        Platform.OS == 'ios'
                                            ? 'https://apps.apple.com/us/app/qr-generator-app/id6469707187'
                                            : 'https://play.google.com/store/apps/details?id=com.devonetech.android.qrguru&hl=en_IN&gl=US'
                                    }`,
                            });
                        }}
                    >
                        <Octicons name="cross-reference" size={calcHeight(2)} color="white" />
                        <Text style={styles.menuText}>Invite Friends</Text>
                    </Pressable>
                </MotiView>

                {menuOptions.map((option, index) => (
                    <MotiView
                        key={index}
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ type: 'timing', duration: 500, delay: 50 }}
                    >
                        <MenuOption
                            label={option.label}
                            iconName={option.iconName}
                            IconComponent={option.IconComponent}
                            onPress={option.onPress}
                        />
                    </MotiView>
                ))}

                <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 600, delay: 100 }}>
                    <MenuOption
                        label="Logout"
                        iconName="logout"
                        IconComponent={MaterialIcons}
                        additionalStyle={styles.logoutStyle}
                        onPress={logoutHandler}
                    />
                </MotiView>

                <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 600, delay: 130 }}>
                    <MenuOption
                        label="Delete"
                        iconName="delete-forever"
                        IconComponent={MaterialIcons}
                        additionalStyle={{ color: COLOR.DELETION_COLOR }}
                        onPress={deleteHandler}
                        color={COLOR.DELETION_COLOR}
                    />
                </MotiView>
            </SafeAreaView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: 'rgba(39, 34, 57, 1)',
        // backgroundColor: 'rgba(25, 20, 35, 1)',
        backgroundColor: 'rgba(31, 27, 46, 1)',
    },
    userInfo: {
        flexDirection: 'row',
        margin: calcHeight(3),
        // alignItems: 'center',
        justifyContent: 'space-between',
    },
    userImage: {
        width: calcHeight(8),
        height: calcHeight(8),
        padding: calcWidth(3),
        borderWidth: 1,
        borderColor: COLOR.BUTTON,
        borderRadius: calcWidth(15),
    },
    userName: {
        fontWeight: 'bold',
        color: 'white',
        fontSize: getFontSizeByWindowWidth(18),
    },
    userPhone: {
        color: 'white',
        fontSize: getFontSizeByWindowWidth(10),
        paddingTop: calcHeight(1),
    },
    inviteFriends: {
        alignItems: 'center',
        margin: calcHeight(2),
        borderWidth: 1,
        padding: calcWidth(3),
        borderColor: COLOR.BUTTON,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: calcWidth(6),
    },
    logoutStyle: {
        paddingTop: calcHeight(4),
        borderTopWidth: 0.2,
        borderTopColor: 'rgba(255,255,255,0.15)',
    },
    menuText: {
        color: 'white',
        fontWeight: 'bold',
    },
    bottomBarText: {
        color: COLOR.BUTTON,
        fontSize: getFontSizeByWindowWidth(14),
    },
    pulsatingCircle: {
        flex: 1,
        position: 'absolute',
        top: -calcHeight(60),
        left: calcWidth(-2),
        width: calcHeight(100),
        height: calcHeight(100),
        backgroundColor: 'rgba(39, 34, 57, 1)',
        // backgroundColor: COLOR.BUTTON,
        borderRadius: calcHeight(100),
    },
});

export default ProfileScreen;
