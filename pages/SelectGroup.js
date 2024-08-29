import { Octicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import GroupIcon from '../components/GroupIcon';
import GroupSelectCard from '../components/GroupSelectCard';
import Search from '../components/Search';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import { useTransaction } from '../context/TransactionContext';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import { useAuth } from '../stores/auth';
import { useGroupList } from '../stores/groupList';

function GroupListScreen({ navigation, route }) {
    const { shouldOpenUpi } = route.params || {};
    const [search, setSearch] = useState('');
    const { setTransactionData } = useTransaction();
    const { groups, fetchData } = useGroupList();
    const { user } = useAuth();
    const [refreshing, setRefreshing] = useState(false);

    const filterGroups = () => (search === '' ? groups : groups.filter((group) => group.name.toLowerCase().includes(search.toLowerCase())));

    useFocusEffect(
        useCallback(() => {
            fetchData(user);
        }, []),
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData(user);
        setRefreshing(false);
    }, []);

    return (
        <View style={styles.container}>
            <View
                style={{
                    marginVertical: calcHeight(2),
                }}
            >
                <Search search={search} setSearch={setSearch} />
            </View>
            <FlatList
                data={filterGroups(groups)}
                ListHeaderComponent={
                    <GroupSelectCard
                        name="Create new group"
                        image={
                            <View
                                style={{
                                    backgroundColor: 'white',
                                    height: calcHeight(5),
                                    width: calcHeight(5),
                                    borderRadius: calcHeight(5),
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Octicons name="people" size={calcHeight(3)} color="black" />
                            </View>
                        }
                        onPress={() => {
                            navigation.navigate(PAGES.CREATE_GROUP);
                        }}
                    />
                }
                renderItem={({ item: group }) => (
                    <GroupSelectCard
                        name={group.name}
                        onPress={() => {
                            setTransactionData((prev) => ({ ...prev, group }));
                            navigation.navigate(PAGES.ADD_TRANSACTION, {
                                shouldOpenUpi,
                            });
                        }}
                        image={<GroupIcon groupId={group._id} />}
                    />
                )}
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    header: {
        fontSize: getFontSizeByWindowWidth(19),
        color: COLOR.TEXT,
        fontWeight: 'bold',
        padding: calcWidth(3),
        margin: calcHeight(2),
    },
    groupName: {
        fontSize: 16,
        marginVertical: 5, // Add margin for better spacing
    },
    group: {
        flexDirection: 'row',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: calcWidth(5),
        borderWidth: 1,
        borderColor: COLOR.BUTTON,
        borderRadius: 10,
        margin: calcHeight(2),
        marginBottom: calcHeight(5),
    },
    input: {
        flex: 1,
        marginLeft: 10,
        color: 'white',
    },
});

export default GroupListScreen;
