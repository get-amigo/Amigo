import React, { useLayoutEffect, useEffect, useRef, useState } from 'react';
import { StyleSheet, SafeAreaView, View, Text, Image, Pressable, TextInput, TouchableOpacity, Platform, Share, Alert } from 'react-native';
import { useAuth } from '../stores/auth';
import COLOR from '../constants/Colors';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import SignUpImage from '../assets/SignUp.png';
import UserAvatar from '../components/UserAvatar';
import { Feather, Octicons, AntDesign, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import MenuOption from '../components/AccountPageOption';
import PAGES from '../constants/pages';
import { useBalance } from '../stores/balance';

function ProfileScreen({ navigation }) {
    const { user, logout, editUser, deleteAccount } = useAuth();
    const [editMode, setEditMode] = useState(false);
    const [name, setName] = useState(user.name);
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

    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () =>
                editMode ? (
                    <TouchableOpacity onPress={() => setEditMode(false)}>
                        <Text style={[styles.bottomBarText, { fontWeight: 'bold' }]}>Cancel</Text>
                    </TouchableOpacity>
                ) : undefined,
            headerRight: () =>
                editMode ? (
                    <TouchableOpacity onPress={submitUserData}>
                        <Text style={[styles.bottomBarText, { fontWeight: 'bold' }]}>Done</Text>
                    </TouchableOpacity>
                ) : undefined,
        });
    }, [navigation, editMode]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.userInfo}>
                <UserAvatar user={user} size={7} />
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

            {menuOptions.map((option, index) => (
                <MenuOption
                    key={index}
                    label={option.label}
                    iconName={option.iconName}
                    IconComponent={option.IconComponent}
                    onPress={option.onPress}
                />
            ))}

            <MenuOption
                label="Logout"
                iconName="logout"
                IconComponent={MaterialIcons}
                additionalStyle={styles.logoutStyle}
                onPress={logoutHandler}
            />
            <MenuOption
                label="Delete"
                iconName="delete-forever"
                IconComponent={MaterialIcons}
                additionalStyle={{ color: COLOR.DELETION_COLOR }}
                onPress={deleteHandler}
                color={COLOR.DELETION_COLOR}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLOR.APP_BACKGROUND,
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
    },
});

export default ProfileScreen;
