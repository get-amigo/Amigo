import {
    Pressable,
    StyleSheet,
    Text,
    View,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
    TextInput,
    ScrollView,
    FlatList,
} from 'react-native';
import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import sliceText from '../helper/sliceText';
import getMembersString from '../utility/getMembersString';
import { Image } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import GroupIcon from '../components/GroupIcon';
import { useGroup } from '../context/GroupContext';
import ScannerIcon from '../assets/icons/scanner.png';
import apiHelper from '../helper/apiHelper';
import useGroupActivitiesStore from '../stores/groupActivitiesStore';
import { useContacts } from '../hooks/useContacts';
import Feed from '../components/Feed';
import useActivities from '../hooks/useActivities';

const ActivitiesFeedScreen = ({ navigation }) => {
    console.log('mounted');
    const { group } = useGroup();
    const { contacts } = useContacts();

    const { isLoading, hasNextPage, fetchNextPage } = useActivities();

    // activity store
    const activities = useGroupActivitiesStore((state) => state.activities[group._id]?.activitiesById || {});
    const activityOrder = useGroupActivitiesStore((state) => state.activities[group._id]?.activityOrder || []);
    const hasHydrated = useGroupActivitiesStore((state) => state._hasHydrated);

    const addOldActivitiesToLocalDB = useGroupActivitiesStore((state) => state.addOldActivitiesToLocalDB);

    // const fetchActivities = async () => {
    //     try {
    //         const { data } = await apiHelper.get(`/activity-feed?groupId=${group._id}`);
    //         addOldActivitiesToLocalDB(data);
    //         console.log('added');
    //     } catch (error) {
    //         console.error('fetchActivities : ', error);
    //     }
    // };

    // useEffect(() => {
    //     fetchActivities();
    // }, []);

    const onReachEnd = () => {
        console.log('END');
        if (hasNextPage && !isLoading) {
            fetchNextPage();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ImageBackground
                source={require('../assets/chatBackground.png')}
                style={{
                    width: calcWidth(100),
                    height: calcHeight(100),
                    backgroundColor: '#1B1727',
                }}
            >
                {/* Top header */}
                <>
                    <Pressable
                        style={styles.header}
                        onPress={() => {
                            navigation.navigate(PAGES.GROUP_SETTINGS, {
                                balance: totalBalance != 0,
                            });
                        }}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: calcWidth(5),
                            }}
                        >
                            <Pressable onPress={() => navigation.goBack()} style={{ marginLeft: 4 }}>
                                <Ionicons name="chevron-back" size={calcHeight(3)} color="white" />
                            </Pressable>
                            <GroupIcon groupId={group._id} />
                            {/* <GroupIcon groupId={'78234jhvsdf87324'} /> */}
                            <View style={styles.groupNameContainer}>
                                <Text style={styles.groupName}>{sliceText(group.name, 25)}</Text>
                                <Text style={styles.groupMembers}>{getMembersString(group.members, 20)}</Text>
                            </View>
                        </View>
                        <Pressable
                            onPress={() => {
                                // setTransactionData((prev) => ({
                                //     ...prev,
                                //     group,
                                // }));
                                navigation.navigate(PAGES.SCANNER);
                            }}
                        >
                            <Image
                                source={ScannerIcon}
                                style={{
                                    width: calcHeight(3),
                                    height: calcHeight(3),
                                    marginRight: calcWidth(5),
                                }}
                            />
                        </Pressable>
                    </Pressable>
                </>

                {/* Flat List */}
                <>
                    <FlatList
                        inverted
                        data={activityOrder}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => <Feed {...activities[item]} contacts={contacts} />}
                        style={styles.flatlist}
                        onEndReached={onReachEnd}
                        onEndReachedThreshold={0.5}
                    />
                </>

                {/* Bottom */}
                {/* <>
                    <KeyboardAvoidingView
                        style={styles.bottom}
                        behavior={Platform.OS === 'ios' ? 'padding' : null}
                        keyboardVerticalOffset={calcHeight(9)}
                    >
                        <View style={styles.wrapper1}></View>
                        <View style={styles.wrapper2}>
                            <TextInput
                                style={styles.input}
                                placeholderTextColor="#ccc"
                                // ref={textRef}
                                placeholder="Start Typing..."
                                // textAlign="center"
                                // value={amount}
                                // onChangeText={handleInputChange}
                            />
                        </View>
                    </KeyboardAvoidingView>
                </> */}
            </ImageBackground>
        </SafeAreaView>
    );
};

export default ActivitiesFeedScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLOR.APP_BACKGROUND,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: calcHeight(2.1),
        backgroundColor: COLOR.APP_BACKGROUND,
        shadowRadius: 0.5,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowColor: '#000000',
        elevation: 2,
    },
    groupName: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: getFontSizeByWindowWidth(12),
    },
    groupMembers: {
        color: '#A5A5A5',
        fontSize: getFontSizeByWindowWidth(11),
    },

    flatlist: {
        flex: 1,
        // backgroundColor: 'red',
    },
    bottom: {
        // flex: Platform.OS === 'ios' ? 1 : 0,
        flex: 0.1,
        backgroundColor: 'green',
    },

    wrapper1: { flex: 1 },
    wrapper2: { flex: 1 },

    input: {
        backgroundColor: 'black',
        borderRadius: calcWidth(2),
        borderColor: 'gray',
        borderWidth: 1,
        color: 'white',
        fontSize: getFontSizeByWindowWidth(12),
    },
});
