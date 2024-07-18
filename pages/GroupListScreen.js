import React, { useCallback, useEffect, useState } from 'react';
import { Text, StyleSheet, FlatList, View, TextInput, Keyboard, RefreshControl } from 'react-native';
import Loader from '../components/Loader';
import apiHelper from '../helper/apiHelper';
import PAGES from '../constants/pages';
import FabIcon from '../components/FabIcon';
import { useFocusEffect } from '@react-navigation/native';
import EmptyScreen from '../components/EmptyScreen';
import COLOR from '../constants/Colors';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import GroupCard from '../components/GroupCard';
import NoGroupsImage from '../assets/NoGroups.png';
import Search from '../components/Search';
import { useGroupList } from '../stores/groupList';
import { useAuth } from '../stores/auth';
import safeAreaStyle from '../constants/safeAreaStyle';
import { SafeAreaView } from 'react-native-safe-area-context';

function GroupListScreen({ navigation }) {
    const { groups, loading, search, setSearch, fetchData } = useGroupList();
    const { user } = useAuth();
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            fetchData(user);
        }, []),
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData(user);
        setRefreshing(false);
    }, [user]);

    useEffect(() => {
        fetchData(user);
    }, []);

    const filterGroups = () => (search === '' ? groups : groups.filter((group) => group.name.toLowerCase().includes(search.toLowerCase())));
    if (loading)
        return (
            <SafeAreaView style={safeAreaStyle}>
                <Text style={styles.header}>Groups</Text>
                <>
                    <View
                        style={{
                            alignItems: 'center',
                            marginTop: calcHeight(2),
                            marginBottom: calcHeight(4),
                        }}
                    >
                        <Search search={search} setSearch={setSearch} loading />
                    </View>
                    <FlatList
                        data={[{}, {}, {}]}
                        renderItem={({ item }) => <GroupCard group={item} loading />}
                        onScroll={() => {
                            Keyboard.dismiss();
                        }}
                    />
                </>
                <FabIcon
                    onPress={() => {
                        {
                            navigation.navigate(PAGES.CREATE_GROUP);
                        }
                    }}
                    loading
                />
            </SafeAreaView>
        );

    return (
        <SafeAreaView style={safeAreaStyle}>
            <Text style={styles.header}>Groups</Text>
            {groups && groups.length == 0 ? (
                <EmptyScreen
                    onPress={() => {
                        navigation.navigate(PAGES.CREATE_GROUP);
                    }}
                    image={NoGroupsImage}
                    title="No Groups Yet"
                />
            ) : (
                <>
                    <View
                        style={{
                            alignItems: 'center',
                            marginTop: calcHeight(2),
                            marginBottom: calcHeight(4),
                        }}
                    >
                        <Search search={search} setSearch={setSearch} />
                    </View>
                    <FlatList
                        data={filterGroups(groups)}
                        renderItem={({ item }) => <GroupCard group={item} />}
                        keyExtractor={(item) => item.id} // Replace 'item.id' with the appropriate key property from your group objects
                        onScroll={() => {
                            Keyboard.dismiss();
                        }}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#8740FD']}
                                progressBackgroundColor="#342F4F"
                            />
                        }
                    />
                </>
            )}
            {groups && groups.length != 0 && (
                <FabIcon
                    onPress={() => {
                        {
                            navigation.navigate(PAGES.CREATE_GROUP);
                        }
                    }}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        fontSize: getFontSizeByWindowWidth(19),
        color: COLOR.TEXT,
        fontWeight: 'bold',
        margin: calcHeight(2),
    },
    groupName: {
        fontSize: 16,
        marginVertical: 5, // Add margin for better spacing
    },
    group: {
        flexDirection: 'row',
    },
});

export default GroupListScreen;
