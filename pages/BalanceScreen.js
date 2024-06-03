import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, SafeAreaView, View, Text, FlatList, Pressable, Image } from 'react-native';
import apiHelper from '../helper/apiHelper';
import PAGES from '../constants/pages';
import FabIcon from '../components/FabIcon';
import { useFocusEffect } from '@react-navigation/native';
import COLOR from '../constants/Colors';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import EmptyScreen from '../components/EmptyScreen';
import NoBalance from '../assets/NoBalance.png';
import GroupBalanceCard from '../components/GroupBalanceCard';
import { useAuth } from '../stores/auth';
import ScanIcon from '../assets/icons/scan.png';
import UserAvatar from '../components/UserAvatar';
const headerIconSize = calcHeight(1);
import NetInfo from '@react-native-community/netinfo';
import groupBalancesAndCalculateTotal from '../utility/groupBalancesAndCalculateTotal';
import { useBalance } from '../stores/balance';

function BalanceScreen({ navigation }) {
    const { user } = useAuth();
    const { fetchData, loading, totalBalances, balances } = useBalance();

    useFocusEffect(
        useCallback(() => {
            fetchData(user);
        }, []),
    );

    if (loading)
        return (
            <SafeAreaView style={styles.container}>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        margin: calcWidth(headerIconSize),
                    }}
                >
                    <Pressable onPress={() => navigation.navigate(PAGES.SCANNER)}>
                        <Image
                            source={ScanIcon}
                            style={{
                                width: calcWidth(headerIconSize),
                                height: calcWidth(headerIconSize),
                            }}
                        />
                    </Pressable>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Pressable
                            onPress={() => {
                                navigation.navigate(PAGES.ACCOUNT);
                            }}
                        >
                            <UserAvatar user={user} size={4} />
                        </Pressable>
                    </View>
                </View>
                <View
                    style={{
                        padding: calcWidth(2),
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            backgroundColor: COLOR.SKELETON_MASK_COLOR,
                            padding: calcHeight(2),
                            borderRadius: 10,
                            justifyContent: 'space-between',
                            marginTop: calcHeight(1),
                        }}
                    >
                        <Text
                            style={{
                                color: COLOR.TEXT,
                                fontWeight: 'bold',
                            }}
                        ></Text>
                        <Text
                            style={{
                                color: COLOR.TEXT,
                                fontWeight: 'bold',
                            }}
                        ></Text>
                    </View>
                </View>
                <FlatList
                    data={[{}, {}, {}]}
                    renderItem={({ item }) => <GroupBalanceCard group={item} loading />}
                    style={{
                        marginTop: calcHeight(5),
                    }}
                />
            </SafeAreaView>
        );

    return (
        <SafeAreaView style={styles.container}>
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    margin: calcWidth(headerIconSize),
                }}
            >
                <Pressable onPress={() => navigation.navigate(PAGES.SCANNER)}>
                    <Image
                        source={ScanIcon}
                        style={{
                            width: calcWidth(headerIconSize),
                            height: calcWidth(headerIconSize),
                        }}
                    />
                </Pressable>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}
                >
                    <Pressable
                        onPress={() => {
                            navigation.navigate(PAGES.ACCOUNT);
                        }}
                    >
                        <UserAvatar user={user} size={4} />
                    </Pressable>
                </View>
            </View>
            <View
                style={{
                    padding: calcWidth(2),
                }}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        backgroundColor: COLOR.BUTTON,
                        padding: calcHeight(2),
                        borderRadius: 10,
                        justifyContent: 'space-between',
                        marginTop: calcHeight(1),
                    }}
                >
                    <Text
                        style={{
                            color: COLOR.TEXT,
                            fontWeight: 'bold',
                        }}
                    >
                        Total Balance
                    </Text>
                    <Text
                        style={{
                            color: COLOR.TEXT,
                            fontWeight: 'bold',
                        }}
                    >
                        ₹ {totalBalances}
                    </Text>
                </View>
            </View>
            {balances && balances.length == 0 ? (
                <EmptyScreen
                    onPress={() => {
                        navigation.navigate(PAGES.ADD_TRANSACTION);
                    }}
                    image={NoBalance}
                    title="No Transactions Yet"
                />
            ) : (
                <FlatList
                    data={balances}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <GroupBalanceCard group={item} />}
                    style={{
                        marginTop: calcHeight(5),
                    }}
                />
            )}
            {balances && balances.length != 0 && (
                <FabIcon
                    onPress={() => {
                        navigation.navigate(PAGES.ADD_TRANSACTION);
                    }}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLOR.APP_BACKGROUND,
    },
    header: {
        fontSize: getFontSizeByWindowWidth(19),
        color: COLOR.TEXT,
        fontWeight: 'bold',
        alignContent: 'left',
        padding: calcWidth(3),
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

export default BalanceScreen;
