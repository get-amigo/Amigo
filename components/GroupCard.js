import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import { useGroup } from '../context/GroupContext';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import sliceText from '../helper/sliceText';
import getMembersString from '../utility/getMembersString';
import GroupIcon from './GroupIcon';
function GroupCard({ group, loading }) {
    if (loading)
        return (
            <View style={styles.container}>
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
        );
    const navigation = useNavigation();
    const { setGroup } = useGroup();
    return (
        <Pressable
            onPress={() => {
                setGroup(group);
                navigation.navigate(PAGES.GROUP);
            }}
            style={styles.container}
        >
            <GroupIcon groupId={group._id} />
            <View style={styles.textContainer}>
                <Text style={styles.nameText}>{sliceText(group.name, 20)}</Text>
                <Text style={styles.memberText}>{getMembersString(group.members, 30)}</Text>
            </View>
        </Pressable>
    );
}

export default GroupCard;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: calcWidth(6),
        borderBottomColor: 'rgba(255, 255, 255, 0.13)',
        borderBottomWidth: 1,
    },
    textContainer: {
        width: calcWidth(60),
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
