import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import DraftCard from '../components/DraftCard';
import PAGES from '../constants/pages';
import formatDateToDDMMYYYY from '../helper/formatDateToDDMMYYYY';
import formatTo12HourTime from '../helper/formatTo12HourTime';
import { useAuth } from '../stores/auth';
import useDraftTransactionStore from '../stores/draftTransactionStore';
const DraftList = ({ navigation }) => {

    const { user } = useAuth();
  const { getDraftsForUser } = useDraftTransactionStore();
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    const fetchDrafts = async () => {
      const userDrafts = getDraftsForUser(user._id);
      console.log(userDrafts)
      setDrafts(userDrafts);
    };
    fetchDrafts();
  }, [user, getDraftsForUser]);

  return (
    <View style={styles.container}>
          <FlatList
        data={drafts}
        renderItem={({ item }) => {
          const formattedDate = formatDateToDDMMYYYY(item.relatedId.date);
          const formattedTime = formatTo12HourTime(item.relatedId.date);
          const dateTime = `${formattedDate} at ${formattedTime}`;
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
});
