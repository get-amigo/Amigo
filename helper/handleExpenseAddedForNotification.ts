import * as Notifications from 'expo-notifications';
import PAGES from '../constants/pages';

export interface TransactionProp {
    _id: string;
    amount: number;
    description: string;
    paidBy: string;
    group: {
        _id: string;
        name: string;
    };
    type: string;
    splitAmong: {
        user: string;
        amount: number;
    }[];
    date: string;
    creator: {
        _id: string;
        phoneNumber: string;
        name: string;
    };
    createdAt: string;
    updatedAt: string;
    __v: number;
}
const handleExpenseAddedForNotification = async (transaction: TransactionProp, userId: string) => {
    const groupName = transaction.group.name;
    const creatorName = transaction.creator.name;
    const totalAmount = transaction.amount;

    const userShareObject = transaction.splitAmong.find((item) => item.user === userId);
    const userShare = userShareObject ? userShareObject.amount : 0;

    // notification content
    const title = `${groupName}`;
    const body = `New Expense Added.\n${creatorName} split ₹${totalAmount} with you. Your share: ₹${userShare}`;
    await Notifications.scheduleNotificationAsync({
        content: {
            title: title,
            body: body,
            data: { transaction, screen: PAGES.GROUP_LIST },
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
export default handleExpenseAddedForNotification;
