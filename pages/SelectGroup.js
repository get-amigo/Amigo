import React, { useCallback, useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import PAGES from '../constants/pages';
import { useFocusEffect } from '@react-navigation/native';
import COLOR from '../constants/Colors';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import Search from '../components/Search';
import GroupSelectCard from '../components/GroupSelectCard';
import { useTransaction } from '../context/TransactionContext';
import GroupIcon from '../components/GroupIcon';
import { Octicons } from '@expo/vector-icons';
import { useGroupList } from '../stores/groupList';
import { SafeAreaView } from 'react-native-safe-area-context';
function GroupListScreen({ navigation }) {
    const [search, setSearch] = useState('');
    const { setTransactionData } = useTransaction();
    const { groups, fetchData } = useGroupList();

    const filterGroups = () => (search === '' ? groups : groups.filter((group) => group.name.toLowerCase().includes(search.toLowerCase())));

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, []),
    );

    return (
        <SafeAreaView style={styles.container}>
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
                        name={'Create new group'}
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
                            navigation.navigate(PAGES.ADD_TRANSACTION);
                        }}
                        image={<GroupIcon groupId={group._id} />}
                    />
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLOR.APP_BACKGROUND,
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
