import * as Notifications from 'expo-notifications';
import PAGES from '../constants/pages';

export interface GroupJoinedMessageProp {
    group: {
        _id: string;
        name: string;
        members: string[];
        createdAt: string;
        updatedAt: string;
        __v: number;
    };
    invitee: {
        _id: string;
        phoneNumber: string;
        name: string;
    };
    newMembers: {
        _id: string;
        phoneNumber: string;
        name: string;
    }[];
}

const handleNewMemberAddInGroupForNotification = async (message: GroupJoinedMessageProp) => {
    const groupName = message.group.name;
    const invitee = message.invitee.name;
    // const creatorName = message.creator.name;
    let newMembers = message.newMembers.map(({ name, phoneNumber }) => (name ? name : phoneNumber)).join(',');
    console.log(message);
    const title = `${groupName}`;
    const body = `${invitee} added ${newMembers}`;
    console.log('Title : ', title, 'Body: ', body);
    await Notifications.scheduleNotificationAsync({
        content: {
            title: title,
            body: body,
            data: { message, screen: PAGES.GROUP_LIST },
        },
        trigger: { seconds: 1 },
    });
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        }),
    });
};
export default handleNewMemberAddInGroupForNotification;
