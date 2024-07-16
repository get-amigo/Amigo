import { AntDesign, EvilIcons, Octicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import ClockIcon from '../assets/icons/clock.png';
import UserAvatar from '../components/UserAvatar';
import COLOR from '../constants/Colors';
import PAGES from '../constants/pages';
import editNames from '../helper/editNames';
import formatDateRelativeToToday from '../helper/formatDateRelativeToToday';
import formatTo12HourTime from '../helper/formatTo12HourTime';
import getDateAndMonth from '../helper/getDateAndMonth';
import { calcHeight, calcWidth, getFontSizeByWindowWidth } from '../helper/res';
import { useAuth } from '../stores/auth';

const SELECTOR_SIZE = 4;

function ActivityHeader({ icon, iconName, size, text }) {
    return (
        <View style={styles.header}>
            <Text
                style={{
                    fontSize: getFontSizeByWindowWidth(10.5),
                    color: 'white',
                    fontWeight: '400',
                }}
            >
                Split an Expense
            </Text>
            <Text style={styles.headerText}>
                {icon && <AntDesign name="user" size={size} color="white" />}
                {'  '}
                {text}
            </Text>
        </View>
    );
}

function Amount({ amount, description }) {
    return (
        <>
            <View style={styles.flexContainer}>
                <View>
                    <Text style={styles.amount}>₹ {amount}</Text>
                </View>
            </View>
            <View>{description && description != ' ' && <Text style={styles.description}>{description}</Text>}</View>
        </>
    );
}

function TransactionActivity({ transaction, createdAt, contacts, synced, creator }) {
    const { user } = useAuth();
    const navigation = useNavigation();

    return (
        <Pressable
            style={{
                width: calcWidth(47),
            }}
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
            <View
                style={{
                    gap: calcWidth(3.8),
                }}
            >
                <ActivityHeader
                    icon={Octicons}
                    iconName="person"
                    size={getFontSizeByWindowWidth(10.5)}
                    text={`${transaction.splitAmong?.length}`}
                />
                <View>
                    <Amount amount={transaction.amount} description={transaction.description} />
                </View>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            gap: calcWidth(1.2),
                        }}
                    >
                        <View>
                            <EvilIcons name="calendar" size={calcWidth(5.2)} color="white" style={{ marginTop: 'auto' }} />
                        </View>
                        <Text
                            style={{
                                color: 'white',
                                fontSize: getFontSizeByWindowWidth(10.8),
                                fontWeight: '400',
                            }}
                        >
                            {getDateAndMonth(createdAt)}
                        </Text>
                    </View>
                    <View
                        style={{
                            flexDirection: 'row',
                            marginTop: 'auto',
                        }}
                    >
                        <Text style={{ color: 'white', fontSize: getFontSizeByWindowWidth(7), fontWeight: '300' }}>
                            {formatTo12HourTime(createdAt)}
                        </Text>
                        {synced === false && (
                            <Image
                                source={ClockIcon}
                                style={{
                                    height: calcWidth(2.2),
                                    width: calcWidth(2.2),
                                    margin: 'auto',
                                    marginLeft: calcWidth(1),
                                }}
                            />
                        )}
                    </View>
                </View>
            </View>
        </Pressable>
    );
}

function PaymentActivity({ payment, contacts }) {
    const { user } = useAuth();
    const [payer, receiver] = editNames([payment.payer, payment.receiver], user._id, contacts);
    return (
        <>
            <View
                style={{
                    gap: calcWidth(2.5),
                    width: calcWidth(47),
                }}
            >
                <Text
                    style={{
                        fontSize: getFontSizeByWindowWidth(10.7),
                        color: 'white',
                        fontWeight: '400',
                    }}
                >
                    {payer.name} paid {receiver.name}
                </Text>

                <View style={styles.flexContainer}>
                    <View>
                        <Text style={styles.amount}>₹ {payment.amount}</Text>
                    </View>
                </View>
                <View>
                    {payment.description && payment.description != ' ' && (
                        <Text
                            style={{
                                fontSize: getFontSizeByWindowWidth(10.7),
                                color: 'white',
                                fontWeight: '400',
                            }}
                        >
                            {payment.description}
                        </Text>
                    )}
                </View>
            </View>
            <Text
                style={{
                    color: 'white',
                    fontSize: getFontSizeByWindowWidth(7),
                    fontWeight: '300',
                    marginLeft: 'auto',

                    marginTop: payment.description && payment.description != ' ' ? 0 : -calcWidth(5),
                }}
            >
                {formatTo12HourTime(payment.createdAt)}
            </Text>
        </>
    );
}

function ChatActivity({ chat, synced }) {
    return (
        <View
            style={{
                maxWidth: calcWidth(47),
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'flex-end',
            }}
        >
            <Text
                style={{
                    color: 'white',
                    fontSize: getFontSizeByWindowWidth(10.7),
                    fontWeight: '400',
                }}
            >
                {chat.message}
            </Text>
            <View
                style={{
                    marginLeft: 'auto',
                    flexDirection: 'row',
                }}
            >
                <Text
                    style={{
                        color: 'white',
                        fontSize: getFontSizeByWindowWidth(7),
                        fontWeight: '300',
                        marginLeft: calcWidth(3),
                    }}
                >
                    {formatTo12HourTime(chat.createdAt)}
                </Text>
                {/* incase sync is missing for the data comming from the backend it should have the right sync */}
                {synced === false && (
                    <Image
                        source={ClockIcon}
                        style={{
                            height: calcWidth(2.2),
                            width: calcWidth(2.2),
                            margin: 'auto',
                            marginLeft: calcWidth(1),
                        }}
                    />
                )}
            </View>
        </View>
    );
}

function Feed(props) {
    const { user } = useAuth();
    const { creator, activityType, createdAt, showCreator, showDate } = props;

    const renderActivity = () => {
        const activityStrategy = ActivityStrategyFactory(activityType);
        if (activityStrategy) {
            return activityStrategy.renderActivity(props);
        }
        return null;
    };

    return (
        <>
            {showDate && (
                <View
                    style={{
                        alignItems: 'center',
                        marginVertical: calcWidth(7),
                    }}
                >
                    <Text
                        style={{
                            color: 'white',
                            paddingHorizontal: calcWidth(2.4),
                            paddingVertical: calcWidth(1.2),
                            borderRadius: calcWidth(3.6),
                            fontSize: getFontSizeByWindowWidth(10.7),
                            fontWeight: '400',
                            backgroundColor: '#272239',
                        }}
                    >
                        {formatDateRelativeToToday(createdAt)}
                    </Text>
                </View>
            )}
            <View
                style={[
                    styles.activityContainer,
                    {
                        justifyContent: user._id === creator?._id ? 'flex-end' : 'flex-start',
                        marginTop: showCreator && user._id !== creator?._id ? calcWidth(4) : 0,
                    },
                ]}
            >
                {user._id !== creator?._id && (
                    <View
                        style={{
                            height: calcHeight(SELECTOR_SIZE),
                            width: calcHeight(SELECTOR_SIZE),
                        }}
                    >
                        {showCreator && <UserAvatar user={creator} size={SELECTOR_SIZE} />}
                    </View>
                )}
                <View
                    style={{
                        marginLeft: user._id === creator?._id ? 0 : calcWidth(2),
                    }}
                >
                    {user._id !== creator?._id && showCreator && (
                        <View
                            style={{
                                alignItems: 'center',
                                flexDirection: 'row',
                                marginBottom: -calcWidth(1),
                            }}
                        >
                            <Text
                                style={{
                                    color: COLOR.BUTTON,
                                    fontSize: getFontSizeByWindowWidth(10.7),
                                    fontWeight: '500',
                                }}
                            >
                                {' '}
                                {creator.name}
                            </Text>
                        </View>
                    )}
                    <View
                        style={[
                            styles.activityCard,
                            {
                                backgroundColor: user._id === creator?._id ? '#663CAB' : '#342F4F',
                                ...(user._id === creator?._id
                                    ? {
                                          borderTopLeftRadius: calcWidth(5),
                                          borderBottomRightRadius: calcWidth(5),
                                      }
                                    : {
                                          borderTopRightRadius: calcWidth(5),
                                          borderBottomLeftRadius: calcWidth(5),
                                      }),
                            },
                        ]}
                    >
                        {renderActivity()}
                    </View>
                </View>
            </View>
        </>
    );
}

const ActivityStrategyFactory = (activityType) => {
    switch (activityType) {
        case 'transaction':
            return {
                renderActivity: ({ relatedId: transaction, createdAt, contacts, isSynced: synced, creator }) => (
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
                renderActivity: ({ creator, relatedId, createdAt, isSynced: synced }) => (
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
    activityContainer: {
        flex: 1,
        flexDirection: 'row',
        marginHorizontal: calcWidth(3),
    },
    activityCard: {
        paddingVertical: calcWidth(2.7),
        paddingHorizontal: calcWidth(5.4),
        marginTop: calcWidth(2),
    },
    description: {
        fontSize: getFontSizeByWindowWidth(10.7),
        color: 'white',
        marginTop: calcWidth(3.8),
        fontWeight: '400',
    },
    header: {
        flexDirection: 'row',
        gap: calcWidth(2.5),
        alignItems: 'center',
    },
    headerText: {
        color: 'white',
        fontWeight: '400',
        fontSize: getFontSizeByWindowWidth(10.5),
        marginLeft: 'auto',
    },
    amount: {
        fontSize: getFontSizeByWindowWidth(13.3),
        color: COLOR.TEXT,
        fontWeight: '500',
        marginRight: calcWidth(2),
    },
    flexContainer: {
        flexDirection: 'row',
    },
    createdAt: {
        fontSize: getFontSizeByWindowWidth(12),
        color: 'white',
        marginTop: calcHeight(2),
    },
});

export default Feed;
