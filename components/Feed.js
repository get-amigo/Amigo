import { Octicons, EvilIcons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View, Pressable, Text, Image } from 'react-native';

import ClockIcon from '../assets/icons/clock.png';
import UserAvatar from '../components/UserAvatar';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import editNames from '../helper/editNames';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import { useAuth } from '../stores/auth';

function convertToCustomFormat(dateString) {
    const date = new Date(dateString);
    const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    const formattedDate = date.toLocaleDateString('en-IN', dateOptions);
    const formattedTime = date.toLocaleTimeString('en-IN', timeOptions);
    return formattedDate + ' ' + formattedTime;
}

function getDateAndMonth(dateString) {
    // Parse the dateString into a Date object
    const date = new Date(dateString);

    // Array of month names
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    return day + ' ' + month;
}

function ActivityHeader({ icon, iconName, size, text }) {
    return (
        <View style={styles.header}>
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignContent: 'center',
                    alignItems: 'center',
                    gap: calcWidth(2),
                }}
            >
                <View
                    style={{
                        borderWidth: 1,
                        padding: calcWidth(1),
                        borderRadius: calcWidth(5),
                        borderColor: 'white',
                    }}
                >
                    <MaterialIcons name="call-split" size={calcWidth(3)} color="white" />
                </View>
                <Text
                    style={{
                        fontSize: getFontSizeByWindowWidth(10),
                        color: 'white',
                        fontWeight: 'bold',
                    }}
                >
                    Split an expense
                </Text>
            </View>
            <Text style={styles.headerText}>
                {icon &&
                    React.createElement(icon, {
                        name: iconName,
                        size,
                        color: 'white',
                    })}
                {'    '}
                {text}
            </Text>
        </View>
    );
}

function Amount({ amount, description }) {
    return (
        <View style={styles.flexContainer}>
            <Text style={styles.amount}>₹</Text>
            <View>
                <Text style={styles.amount}>{amount}</Text>
                {description && <Text style={styles.description}>{description}</Text>}
            </View>
        </View>
    );
}

function TransactionActivity({ transaction, createdAt, contacts, synced, creator }) {
    const { user } = useAuth();
    const navigation = useNavigation();

    return (
        <Pressable
            onPress={() => {
                const editedTransaction = transaction;
                for (const i in editedTransaction.splitAmong) {
                    editedTransaction.splitAmong[i].user = editNames([transaction.splitAmong[i].user], user._id, contacts)[0];
                }
                editedTransaction.paidBy = editNames([transaction.paidBy], user._id, contacts)[0];

                navigation.navigate(PAGES.TRANSACTION_DETAIL, {
                    transaction: {
                        ...editedTransaction,
                        creator,
                    },
                });
            }}
        >
            <ActivityHeader icon={Octicons} iconName="person" size={calcHeight(1.8)} text={`${transaction.splitAmong?.length}`} />
            <View style={{ marginTop: calcHeight(3) }}>
                <Amount amount={transaction.amount} description={transaction.description} />
            </View>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: calcHeight(3),
                }}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        gap: calcWidth(2),
                    }}
                >
                    <EvilIcons name="calendar" size={calcWidth(5)} color="white" />
                    <Text style={styles.description}>{getDateAndMonth(createdAt)}</Text>
                </View>
                {synced === false && (
                    <Image
                        source={ClockIcon}
                        style={{
                            height: calcHeight(1),
                            width: calcHeight(1),
                        }}
                    />
                )}
            </View>
        </Pressable>
    );
}

function PaymentActivity({ payment, contacts }) {
    const { user } = useAuth();
    const [payer, receiver] = editNames([payment.payer, payment.receiver], user._id, contacts);
    return (
        <View
            style={{
                gap: calcHeight(2),
            }}
        >
            <Text style={styles.description}>
                {payer.name} paid {receiver.name}
            </Text>
            <Amount amount={payment.amount} description={payment.description} />
        </View>
    );
}

function ChatActivity({ chat, synced }) {
    function convertToCustomFormat(dateString) {
        const date = new Date(dateString);
        const timeOptions = {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        };
        const formattedTime = date.toLocaleTimeString('en-US', timeOptions);
        return formattedTime;
    }
    return (
        <View>
            <Text
                style={{
                    color: 'white',
                }}
            >
                {chat.message}
            </Text>
            <View
                style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    flex: 1,
                    alignContent: 'center',
                    justifyContent: 'flex-end',
                    gap: calcWidth(1),
                }}
            >
                <Text
                    style={{
                        color: 'grey',
                        fontSize: getFontSizeByWindowWidth(10),
                    }}
                >
                    {convertToCustomFormat(chat.createdAt)}
                </Text>
                {/* incase sync is missing for the data comming from the backend it should have the right sync */}
                {synced === false && <Image source={ClockIcon} style={{ height: calcHeight(1), width: calcHeight(1) }} />}
            </View>
        </View>
    );
}

function Feed(props) {
    const { user } = useAuth();
    const { creator, activityType, createdAt } = props;

    const renderActivity = () => {
        const activityStrategy = ActivityStrategyFactory(activityType);
        if (activityStrategy) {
            return activityStrategy.renderActivity(props);
        }
        return null;
    };

    return (
        <View
            style={[
                styles.transactionContainer,
                {
                    justifyContent: user._id === creator?._id ? 'flex-end' : 'flex-start',
                },
            ]}
        >
            {user._id !== creator?._id && <UserAvatar user={creator} />}
            <View
                style={{
                    marginLeft: user._id === creator?._id ? 0 : calcWidth(2),
                }}
            >
                {user._id !== creator?._id && (
                    <View
                        style={{
                            alignItems: 'center',
                            flexDirection: 'row',
                        }}
                    >
                        <Text
                            style={{
                                color: COLOR.BUTTON,
                            }}
                        >
                            {' '}
                            {creator.name}
                        </Text>
                        <Text
                            style={{
                                color: 'white',
                            }}
                        >
                            {' '}
                            {convertToCustomFormat(createdAt)}
                        </Text>
                    </View>
                )}
                <View
                    style={[
                        styles.transactionCard,
                        {
                            backgroundColor: user._id === creator?._id ? '#663CAB' : '#342F4F',
                            ...(user._id === creator?._id
                                ? {
                                      borderBottomLeftRadius: calcHeight(1),
                                      borderBottomRightRadius: calcHeight(2),
                                      borderTopLeftRadius: calcHeight(2),
                                  }
                                : {
                                      borderBottomLeftRadius: calcHeight(2),
                                      borderBottomRightRadius: calcHeight(1),
                                      borderTopRightRadius: calcHeight(2),
                                  }),
                        },
                    ]}
                >
                    {renderActivity()}
                </View>
            </View>
        </View>
    );
}

const ActivityStrategyFactory = (activityType) => {
    switch (activityType) {
        case 'transaction':
            return {
                renderActivity: ({ relatedId: transaction, createdAt, contacts, synced, creator }) => (
                    <TransactionActivity
                        transaction={transaction}
                        createdAt={createdAt}
                        contacts={contacts}
                        synced={synced}
                        creator={creator}
                    />
                ),
            };
        case 'payment':
            return {
                renderActivity: ({ relatedId: payment, contacts }) => <PaymentActivity payment={payment} contacts={contacts} />,
            };
        case 'chat':
            return {
                renderActivity: ({ creator, relatedId, createdAt, synced }) => (
                    <ChatActivity
                        chat={{
                            creator,
                            message: relatedId?.message,
                            createdAt,
                        }}
                        synced={synced}
                    />
                ),
            };
        default:
            return null;
    }
};

const styles = StyleSheet.create({
    transactionContainer: {
        flex: 1,
        flexDirection: 'row',
        margin: calcWidth(3),
        marginVertical: calcHeight(4),
    },
    transactionCard: {
        padding: calcWidth(5),
        width: calcWidth(70),
        backgroundColor: '#342F4F',
        borderBottomLeftRadius: calcHeight(1),
        borderBottomRightRadius: calcHeight(1),
        marginTop: calcHeight(1),
    },
    description: {
        fontSize: getFontSizeByWindowWidth(10),
        color: 'white',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerText: {
        color: 'white',
    },
    amount: {
        fontSize: getFontSizeByWindowWidth(20),
        color: COLOR.TEXT,
        fontWeight: 'bold',
        marginRight: calcWidth(2),
    },
    flexContainer: {
        flexDirection: 'row',
        marginLeft: calcWidth(2),
    },
    createdAt: {
        fontSize: getFontSizeByWindowWidth(12),
        color: 'white',
        marginTop: calcHeight(2),
    },
});

export default Feed;
