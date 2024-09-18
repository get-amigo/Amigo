import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import sliceText from '../helper/sliceText';
import GroupIcon from './GroupIcon';
function GroupBalanceCard({ group, loading }) {
    if (loading)
        return (
            <Pressable
                onPress={() => {
                    navigation.navigate(PAGES.GROUP_BALANCE, { group });
                }}
                style={styles.container}
            >
                <View
                    style={{
                        flexDirection: 'row',
                    }}
                >
                    <GroupIcon />
                    <View style={styles.textContainer}>
                        <Text
                            style={[
                                styles.nameText,
                                {
                                    backgroundColor: COLOR.SKELETON_MASK_COLOR,
                                    width: calcWidth(30),
                                    borderRadius: 10,
                                },
                            ]}
                        />
                        <Text
                            style={[
                                styles.memberText,
                                {
                                    backgroundColor: COLOR.SKELETON_MASK_COLOR,
                                    width: calcWidth(50),
                                    borderRadius: 10,
                                },
                            ]}
                        />
                    </View>
                </View>
            </Pressable>
        );
    const navigation = useNavigation();
    return (
        <Pressable
            onPress={() => {
                navigation.navigate(PAGES.GROUP_BALANCE, { group });
            }}
            style={styles.container}
        >
            <View
                style={{
                    flexDirection: 'row',
                }}
            >
                <GroupIcon groupId={group._id} />
                <View style={styles.textContainer}>
                    <Text style={styles.nameText}>{sliceText(group.name, 20)}</Text>
                    <Text style={styles.memberText}>
                        {group.totalBalance > 0
                            ? `${group.lenderCount} participants owe you money`
                            : `You owe money to ${group.borrowerCount} participants`}
                    </Text>
                </View>
            </View>
            <Text
                style={{
                    color: group.totalBalance > 0 ? 'green' : 'red',
                    fontWeight: 'bold',
                }}
            >
                ₹ {Math.abs(parseInt(group.totalBalance))}
            </Text>
        </Pressable>
    );
}

export default GroupBalanceCard;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: calcWidth(5),
        borderBottomColor: 'rgba(255, 255, 255, 0.13)',
        borderBottomWidth: 1,
        justifyContent: 'space-between',
    },
    textContainer: {
        marginLeft: calcWidth(5),
    },
    nameText: {
        color: COLOR.BUTTON,
        fontWeight: 'bold',
        fontSize: getFontSizeByWindowWidth(15),
    },
    memberText: {
        fontSize: getFontSizeByWindowWidth(8),
        color: COLOR.PRIMARY,
        marginTop: calcHeight(0.5),
    },
    placeHolderView: {
        height: calcHeight(5),
        width: calcHeight(5),
        borderRadius: calcHeight(5),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: calcWidth(2),
    },
    selectorContainer: {
        right: calcWidth(5),
    },
});
