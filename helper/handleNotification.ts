import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import handleExpenseAddedForNotification, { TransactionProp } from './handleExpenseAddedForNotification';
import handleMessageAddedForNotification, { MessageProp } from './handleMessageAddedForNotification';
import handleNewMemberAddInGroupForNotification, { GroupJoinedMessageProp } from './handleNewMemberAddInGroupForNotification';
interface RemoteMessageDataProp {
    data: string;
    type: 'TRANSACTION_ADD' | 'CHAT_MESSAGE' | 'GROUP_JOINED';
}
const handleNotification = async (remoteMessage: FirebaseMessagingTypes.RemoteMessage, userID: string) => {
    const remoteMessageData = remoteMessage.data as unknown as RemoteMessageDataProp;
    console.log('here', remoteMessage);
    if (remoteMessage && remoteMessageData) {
        const response = remoteMessageData.data;
        const parsedResponse = JSON.parse(response);
        console.log('parsed', parsedResponse);

        if (remoteMessageData.type === 'TRANSACTION_ADD') {
            await handleExpenseAddedForNotification(parsedResponse as TransactionProp, userID);
        } else if (remoteMessageData.type === 'CHAT_MESSAGE') {
            await handleMessageAddedForNotification(parsedResponse as MessageProp);
        } else if (remoteMessageData.type === 'GROUP_JOINED') {
            await handleNewMemberAddInGroupForNotification(parsedResponse as GroupJoinedMessageProp);
        }
    }
};
export default handleNotification;
