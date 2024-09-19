import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import useReplyStore from '../stores/replyStore';

function SwipeableWrapper({ children, chatContent }) {
    const { isReplying, setIsReplying, setReplyingTo, setToReplyMessage } = useReplyStore();
    const swipeableRef = useRef(null);
    // console.log(chatContent);

    const renderLeftActions = (progress, dragX) => {
        const trans = dragX.interpolate({
            inputRange: [-100, 0, 100],
            outputRange: [-50, 0, 0],
            extrapolate: 'clamp',
        });

        return (
            <Animated.View
                style={[
                    styles.leftAction,
                    {
                        transform: [{ translateX: trans }],
                    },
                ]}
            ></Animated.View>
        );
    };

    const handleSwipeOpen = () => {
        setIsReplying(true);
        setReplyingTo(chatContent.creator.name);
        if (chatContent.message) {
            setToReplyMessage(chatContent.message);
        } else {
            let amount = chatContent.amount;
            let splitAmong = chatContent.splitAmong?.length;
            setToReplyMessage(`Transaction amount of ₹${amount} split among ${splitAmong} people`);
        }
    };

    const handleSwipeClose = () => {
        setIsReplying(false);
    };

    useEffect(() => {
        if (!isReplying && swipeableRef.current) {
            swipeableRef.current.close();
        }
    }, [isReplying]);

    return (
        <View>
            <Swipeable
                ref={swipeableRef}
                renderLeftActions={renderLeftActions}
                onSwipeableLeftOpen={handleSwipeOpen}
                onSwipeableClose={handleSwipeClose}
                leftThreshold={50}
            >
                <View style={styles.wrapper}>{children}</View>
            </Swipeable>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: 'transparent',
    },
    leftAction: {
        flex: 1,
        backgroundColor: '#381b5c',
        justifyContent: 'center',
        alignItems: 'flex-start',
        borderRadius: 8,
    },
    actionText: {
        color: 'white',
        fontWeight: '450',
        paddingLeft: 4,
    },
    user: {
        fontWeight: 600,
        fontSize: 15,
    },
    iconWrapper: {
        marginLeft: 10,
        backgroundColor: 'gray',
        borderRadius: 20,
        padding: 4,
    },
});

export default SwipeableWrapper;
