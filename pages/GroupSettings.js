import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, TextInput, Image, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DEEP_LINK_URL } from '@env';
import GroupIcon from '../components/GroupIcon';
import Loader from '../components/Loader';
import UserAvatar from '../components/UserAvatar';
import { useGroup } from '../context/GroupContext';
import { calcWidth, calcHeight, getFontSizeByWindowWidth } from '../helper/res';
import COLOR from '../constants/Colors';
import apiHelper from '../helper/apiHelper';
import PAGES from '../constants/pages';
import { Octicons } from '@expo/vector-icons';
import showToast from '../helper/Toast';

const MemberItem = ({ name, phone, _id }) => (
    <View style={styles.memberItem}>
        {name && _id && <UserAvatar user={{ name, _id }} />}
        <View
            style={[
                styles.memberInfo,
                {
                    gap: calcHeight(1),
                },
            ]}
        >
            <Text style={styles.memberName}>{name}</Text>
            <Text style={styles.memberPhone}>{phone}</Text>
        </View>
    </View>
);

function convertToCustomFormat(dateString) {
    const date = new Date(dateString);
    const dateOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    const formattedDate = date.toLocaleDateString('en-IN', dateOptions);
    const formattedTime = date.toLocaleTimeString('en-IN', timeOptions);
    return formattedDate + ', ' + formattedTime;
}

const GroupScreen = ({
    navigation,
    route: {
        params: { balance },
    },
}) => {
    console.log('mounted');
    const { group, setGroup } = useGroup();
    const [groupMembers, setGroupMembers] = useState();
    const [isEditing, setIsEditing] = useState();
    const [groupName, setGroupName] = useState();
    const groupRef = useRef();
    const [loading, setLoading] = useState(false);
    const MAX_LEN = 40;

    const inputRef = useRef(null);

    useEffect(() => {
        setGroupMembers(group.members);
        setIsEditing(false);
        setGroupName(group.name);
    }, [group]);

    const submitGroupData = async () => {
        if (groupRef.current == '') {
            showToast('Group Name cannot be empty');
            return;
        }
        setIsEditing(false);
        apiHelper.patch(`/group?id=${group._id}`, {
            groupName: groupRef.current,
        });
        setGroup((prev) => ({ ...prev, name: groupRef.current }));
    };

    const shareGroupLink = () => {
        Share.share({
            message: 'Join the group at Amigo: ' + `${DEEP_LINK_URL}join?groupId=${group._id}`,
        });
    };

    const leaveGroup = async () => {
        setLoading(true);
        await apiHelper.delete(`/group/${group._id}`);
        navigation.navigate(PAGES.GROUP_LIST);
        setLoading(false);
    };

    const leaveGroupAlert = () => {
        Alert.alert(
            'Confirm group exit',
            'Are you sure you want to leave the group?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Yes, leave the group',
                    onPress: leaveGroup,
                    style: 'destructive', // Set the style to destructive to make it red
                },
            ],
            {
                titleStyle: { color: 'red' }, // Set the title text color to red
            },
        );
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitleAlign: isEditing ? 'center' : 'left',
            headerLeft: () =>
                isEditing ? (
                    <TouchableOpacity onPress={() => setIsEditing(false)}>
                        <Text style={[{ fontWeight: 'bold', color: COLOR.TEXT }]}>Cancel</Text>
                    </TouchableOpacity>
                ) : undefined,

            headerRight: () =>
                isEditing ? (
                    <TouchableOpacity onPress={() => submitGroupData()}>
                        <Text style={[{ fontWeight: 'bold', color: COLOR.TEXT }]}>Done</Text>
                    </TouchableOpacity>
                ) : undefined,
        });
    }, [navigation, isEditing]);

    const renderMemberItem = ({ item }) => <MemberItem name={item.name} phone={item.phoneNumber} _id={item._id} />;

    function renderListHeader() {
        return (
            <>
                <View style={styles.centeredView}>
                    <GroupIcon size={10} groupId={group._id} />
                </View>
                <View style={styles.header}>
                    <View style={styles.nameWrapper}>
                        {isEditing ? (
                            <TextInput
                                ref={inputRef}
                                onChangeText={(text) => {
                                    setGroupName(text);
                                    groupRef.current = text;
                                }}
                                value={groupName}
                                autoFocus
                                style={[styles.groupName]}
                                maxLength={MAX_LEN}
                            />
                        ) : (
                            <Text style={styles.groupName}>{groupName}</Text>
                        )}

                        <TouchableOpacity
                            onPress={() => setIsEditing((prev) => !prev)}
                            style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                flex: 1,
                            }}
                        >
                            <Octicons name="pencil" size={calcWidth(6)} color="white" />
                        </TouchableOpacity>
                    </View>
                    {/* char remaining */}
                    {isEditing && (
                        <View style={{ marginTop: 4 }}>
                            <Text style={styles.characterCount}>{MAX_LEN - groupName?.length} characters left</Text>
                        </View>
                    )}
                    {/* <Text style={styles.groupCreatedAt}>Created on 25 Dec 2023, 10:32 PM</Text> */}
                    <Text style={styles.groupCreatedAt}>Created on {convertToCustomFormat(group.createdAt)}</Text>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate(PAGES.ADD_PEOPLE);
                    }}
                    style={styles.memberItem}
                >
                    <Image source={require('../assets/icons/addMembers.png')} style={{ height: calcHeight(5), width: calcHeight(5) }} />
                    <View
                        style={{
                            marginLeft: calcWidth(3),
                        }}
                    >
                        <Text style={styles.buttonText}>Add new members</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.memberItem} onPress={shareGroupLink}>
                    <Image source={require('../assets/icons/share.png')} style={{ height: calcHeight(5), width: calcHeight(5) }} />
                    <View
                        style={{
                            marginLeft: calcWidth(3),
                        }}
                    >
                        <Text style={styles.buttonText}>Share Group Link</Text>
                    </View>
                </TouchableOpacity>
            </>
        );
    }

    const renderListFooter = () =>
        !balance && (
            <TouchableOpacity style={styles.memberItem} onPress={leaveGroupAlert}>
                <Ionicons name="exit-outline" size={calcHeight(5)} color="rgba(253 ,64,9, 0.59)" />
                <View
                    style={{
                        marginLeft: calcWidth(3),
                    }}
                >
                    <Text style={{ color: 'rgba(253 ,64,9, 0.59)' }}>Leave Group</Text>
                </View>
            </TouchableOpacity>
        );

    return loading ? (
        <Loader />
    ) : (
        <View style={{ flex: 1 }}>
            <FlatList
                data={groupMembers}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderMemberItem}
                ListHeaderComponent={renderListHeader()}
                ListFooterComponent={renderListFooter}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        margin: calcHeight(1),
        padding: calcHeight(2),
        borderBottomWidth: 1,
        borderBottomColor: COLOR.BORDER_COLOR,
    },
    nameWrapper: {
        flexDirection: 'row',
        flex: 1,
        gap: calcWidth(4),
    },
    groupName: {
        fontSize: getFontSizeByWindowWidth(15),
        fontWeight: 'bold',
        color: COLOR.TEXT,
        width: calcWidth(75),
    },

    groupCreatedAt: {
        fontSize: getFontSizeByWindowWidth(10),
        color: COLOR.TEXT,
        marginTop: calcWidth(2.2),
    },
    totalMembersTitle: {
        fontSize: getFontSizeByWindowWidth(12),
        color: COLOR.TEXT,
        fontWeight: 'bold',
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: calcWidth(5),
        borderBottomWidth: 1,
        borderBottomColor: COLOR.BORDER_COLOR,
        marginHorizontal: calcWidth(2),
    },
    memberInfo: {
        flex: 1,
        marginLeft: calcWidth(3),
    },
    memberName: {
        fontSize: getFontSizeByWindowWidth(12),
        color: 'white',
        fontWeight: 'bold',
    },
    memberPhone: {
        fontSize: getFontSizeByWindowWidth(8),
        color: 'white',
    },
    centeredView: {
        alignItems: 'center',
        margin: calcWidth(11),
    },
    spacing: {
        gap: calcWidth(2),
    },
    listHeader: {
        marginBottom: calcWidth(4),
        padding: calcWidth(5),
        borderBottomColor: COLOR.BORDER_COLOR,
        borderBottomWidth: 1,
    },
    buttonText: {
        color: COLOR.BUTTON,
        fontSize: getFontSizeByWindowWidth(12),
        fontWeight: 'bold',
    },
    characterCount: {
        fontSize: 10,
        color: COLOR.TEXT,
        textAlign: 'left',
    },
});

export default GroupScreen;
