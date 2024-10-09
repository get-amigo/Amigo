import * as Notifications from 'expo-notifications';
import PAGES from '../constants/pages';

export interface MessageProp {
    message: string;
    _id: string;
    activityType: string;
    creator: {
        _id: string;
        phoneNumber: string;
        name: string;
    };
    group: {
        _id: string;
        name: string;
        members: string[];
    };
    relatedId: string;
    onModel: string;
}

const handleMessageAddedForNotification = async (message: MessageProp) => {
    const groupName = message.group.name;
    const creatorName = message.creator.name;

    const title = `${groupName}`;
    const body = `New message send by ${creatorName}`;

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
export default handleMessageAddedForNotification;
