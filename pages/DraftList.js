import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import DraftCard from '../components/DraftCard';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import formatDateToDDMMYYYY from '../helper/formatDateToDDMMYYYY';
import formatTo12HourTime from '../helper/formatTo12HourTime';
import groupDraftsByDate from '../helper/getDraftsByDate';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import { useAuth } from '../stores/auth';
import useDraftTransactionStore from '../stores/draftTransactionStore';
const DraftList = ({ navigation }) => {
    const { user } = useAuth();
    const { getDraftsForUser } = useDraftTransactionStore();
    const [drafts, setDrafts] = useState([]);

    const fetchDrafts = useCallback(async () => {
        const userDrafts = getDraftsForUser(user._id);
        setDrafts(userDrafts);
    }, [user, getDraftsForUser]);

    useFocusEffect(
        useCallback(() => {
            fetchDrafts();
        }, [fetchDrafts]),
    );

    const sections = groupDraftsByDate(drafts);
    return (
        <View style={styles.container}>
            <SectionList
                sections={sections}
                renderItem={({ item }) => {
                    const formattedTime = formatTo12HourTime(item.relatedId.date);
                    const dateTime = `${formatDateToDDMMYYYY(item.relatedId.date)} at ${formattedTime}`;
                    return (
                        <DraftCard
                            groupName={item.relatedId.description}
                            dateTime={dateTime}
                            amount={item.relatedId.amount}
                            onPress={() => {
                                navigation.navigate(PAGES.ADD_TRANSACTION, { draft: item });
                            }}
                        />
                    );
                }}
                renderSectionHeader={({ section: { title } }) => (
                    <View style={styles.header}>
                        <Text style={styles.headerText}>{title}</Text>
                    </View>
                )}
                keyExtractor={(item) => item._id}
            />
        </View>
    );
};
export default DraftList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        marginTop: calcHeight(2),
        paddingLeft: calcWidth(5.6),
    },
    headerText: {
        color: COLOR.PRIMARY,
        fontSize: getFontSizeByWindowWidth(14),
        fontWeight: '700',
    },
});
