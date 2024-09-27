import React, { useRef, useState, useCallback } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import useReplyStore from '../stores/replyStore';

function SwipeableWrapper({ children, chatContent, creator }) {
    const { setIsReplying, setReplyingTo, setToReplyMessage } = useReplyStore();
    const swipeableRef = useRef(null);
    // const { user } = useAuth();
    const [hasCrossedThreshold, setHasCrossedThreshold] = useState(false);
    const hasTriggeredHaptic = useRef(false);

    const renderLeftActions = useCallback((progress, dragX) => {
        const trans = dragX.interpolate({
            inputRange: [-100, 0, 100],
            outputRange: [-50, 0, 0],
            extrapolate: 'clamp',
        });

        dragX.addListener(({ value }) => {
            const dragDistance = Math.abs(value);
            if (dragDistance >= 60 && !hasTriggeredHaptic.current) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                hasTriggeredHaptic.current = true;
            }
        });
        // console.log(creator);

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
    }, []);

    const handleSwipeWillOpen = (direction) => {
        if (direction === 'left' && !hasCrossedThreshold) {
            setHasCrossedThreshold(true);
            setIsReplying(true);
            setReplyingTo(creator);

            if (chatContent.message) {
                setToReplyMessage(chatContent.message);
            } else {
                let amount = chatContent.amount;
                let splitAmong = chatContent.splitAmong?.length;
                setToReplyMessage(`Transaction amount of ₹${amount} split among ${splitAmong} people`);
            }
            // Close the swipeable after a short delay
            setTimeout(() => {
                if (swipeableRef.current) {
                    swipeableRef.current.close();
                }
            }, 50);
        }
    };

    const handleSwipeClose = () => {
        setHasCrossedThreshold(false);
        hasTriggeredHaptic.current = false;
    };

    return (
        <View>
            <Swipeable
                ref={swipeableRef}
                renderLeftActions={renderLeftActions}
                onSwipeableWillOpen={handleSwipeWillOpen}
                onSwipeableClose={handleSwipeClose}
                leftThreshold={60}
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
