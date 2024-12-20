import React, { useLayoutEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import ContactList from '../components/ContactList';
import Loader from '../components/Loader';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import { useGroup } from '../context/GroupContext';
import apiHelper from '../helper/apiHelper';
import { calcHeight, getFontSizeByWindowWidth } from '../helper/res';
import { useContacts } from '../hooks/useContacts';
import { useGroupList } from '../stores/groupList';
import { useAuth } from '../stores/auth';

const AddPeople = ({ navigation }) => {
    const { selectedContacts } = useContacts();
    const { group } = useGroup();
    const [loading, setLoading] = useState(false);
    const { updateMember } = useGroupList();
    const { user } = useAuth();

    async function addMembers() {
        setLoading(true);
        const response = await apiHelper.patch(
            `/group/${group._id}`,
            selectedContacts.map((contact) => ({
                phoneNumber: contact.phoneNumber,
                countryCode: '+91',
            })),
        );
        const membersIdsArray = response.data.members;
        const membersIdsArrayLength = membersIdsArray.length;
        const newMembersIdsStartIndex = membersIdsArrayLength - 1 - (selectedContacts.length - 1);
        const newMembersIdsArray = membersIdsArray.splice(newMembersIdsStartIndex);
        await updateMember({
            groupId: response.data._id,
            newMembers: selectedContacts.map((contact, index) => ({
                _id: newMembersIdsArray[index],
                phoneNumber: contact.phoneNumber,
                countryCode: '+91',
            })),
            userId: user._id,
        });
        setLoading(false);
        navigation.navigate(PAGES.GROUP_LIST);
    }

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={addMembers}>
                    <Text
                        style={[
                            {
                                color: COLOR.BUTTON,
                                fontSize: getFontSizeByWindowWidth(15),
                            },
                        ]}
                    >
                        Done
                    </Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation, selectedContacts]);
    if (loading) return <Loader />;
    return (
        <View
            style={{
                alignItems: 'center',
                margin: calcHeight(5),
            }}
        >
            <ContactList eliminatedContacts={group.members} />
        </View>
    );
};

export default AddPeople;
