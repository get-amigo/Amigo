import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Keyboard, RefreshControl, StyleSheet, Text, View } from 'react-native';

import NoGroupsImage from '../assets/NoGroups.png';
import EmptyScreen from '../components/EmptyScreen';
import FabIcon from '../components/FabIcon';
import GroupCard from '../components/GroupCard';
import Search from '../components/Search';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import { useAuth } from '../stores/auth';
import { useGroupList } from '../stores/groupList';

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
            <View style={{ flex: 1 }}>
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
            </View>
        );

    return (
        <View style={{ flex: 1 }}>
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
                    <View style={styles.searchContainer}>
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
                                colors={[COLOR.REFRESH_INDICATOR_ARROW]}
                                tintColor={COLOR.REFRESH_INDICATOR_COLOR_IOS}
                                progressBackgroundColor={COLOR.REFRESH_INDICATOR_BACKGROUND}
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
        </View>
    );
}

const styles = StyleSheet.create({
    searchContainer: {
        alignItems: 'center',
        marginTop: calcHeight(2),
        marginBottom: calcWidth(1.5),
    },
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
