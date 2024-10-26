import * as Notifications from 'expo-notifications';
import PAGES from '../constants/pages';
import editNames from './editNames';
import useGroupActivitiesStore from '../stores/groupActivitiesStore';

export interface PaymentSettleData {
    amount: string;
    description: string;
    group: {
        _id: string;
        members: string[];
        name: string;
    };
    payer: {
        _id: string;
        phoneNumber: string;
        name: string;
    };
    receiver: string;
}

const handlePaymentSettleNotification = async (message: PaymentSettleData) => {
    const groupName = message.group.name;
    const amount = message.amount;
    const description = message.description;
    const payeeName = message.payer.name ? message.payer.name : message.payer.phoneNumber;
    const { addActivityToLocalDB } = useGroupActivitiesStore();

    console.log(message);
    const title = `${groupName}`;
    addActivityToLocalDB(message);
    const body = description ? `${payeeName} paid ${amount} for ${description}` : `${payeeName} paid ${amount}`;
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
export default handlePaymentSettleNotification;
