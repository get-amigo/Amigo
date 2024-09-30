import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import handleExpenseAddedForNotification, { TransactionProp } from './handleExpenseAddedForNotification';
import handleMessageAddedForNotification, { MessageProp } from './handleMessageAddedForNotification';
interface RemoteMessageDataProp {
    data: string;
    type: 'TRANSACTION_ADD' | 'CHAT_MESSAGE';
}
const handleNotification = async (remoteMessage: FirebaseMessagingTypes.RemoteMessage, userID: string) => {
    const remoteMessageData = remoteMessage.data as unknown as RemoteMessageDataProp;
    if (remoteMessage && remoteMessageData) {
        const response = remoteMessageData.data;
        const parsedResponse = JSON.parse(response);

        if (remoteMessageData.type === 'TRANSACTION_ADD') {
            await handleExpenseAddedForNotification(parsedResponse as TransactionProp, userID);
        } else if (remoteMessageData.type === 'CHAT_MESSAGE') {
            await handleMessageAddedForNotification(parsedResponse as MessageProp);
        }
    }
};
export default handleNotification;
