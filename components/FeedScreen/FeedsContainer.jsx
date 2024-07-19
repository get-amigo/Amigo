import { FontAwesome6 } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import StickyDate from './StickyDate';
import { useGroup } from '../../context/GroupContext';
import areDatesEqual from '../../helper/areDatesEqual';
import formatDateRelativeToToday from '../../helper/formatDateRelativeToToday';
import { calcWidth } from '../../helper/res';
import useActivities from '../../hooks/useActivities';
import { useContacts } from '../../hooks/useContacts';
import useGroupActivitiesStore from '../../stores/groupActivitiesStore';
import Feed from '../Feed';

const FeedsContainer = () => {
    const { group } = useGroup();
    const { contacts } = useContacts();

    const [isStickyDateVisible, setIsStickyDateVisible] = useState(false);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const [stickyDate, setStickyDate] = useState('');
    const { isLoading, hasNextPage, fetchNextPage, shouldFetch, trackViewedItem } = useActivities();

    const flatListRef = useRef(null);

    const activityOrder = useGroupActivitiesStore((state) => state.activities[group._id]?.activityOrder || []);
    const activities = useGroupActivitiesStore((state) => state.activities[group._id]?.activitiesById || {});

    const toggleStickyDateAndScrollButton = useCallback((event) => {
        const yOffset = event.nativeEvent.contentOffset.y;
        setShowScrollToBottom(yOffset > 100);
        if (yOffset > 50 && yOffset < event.nativeEvent.contentSize.height - 750) {
            setIsStickyDateVisible(true);
        } else {
            setIsStickyDateVisible(false);
        }
    }, []);

    const updateStickyDateOnViewableItemsChange = useCallback(
        ({ viewableItems }) => {
            if (viewableItems?.length > 0) {
                const lastVisibleItem = viewableItems[viewableItems.length - 1]?.item;
                const date = formatDateRelativeToToday(activities[lastVisibleItem]?.createdAt);
                setStickyDate(date);
            }
        },
        [activityOrder],
    );

    const scrollToBottom = useCallback(() => {
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }, []);

    useEffect(() => {
        // handle fetch
        if (shouldFetch && hasNextPage && !isLoading) {
            fetchNextPage();
        }
    }, [shouldFetch, hasNextPage, isLoading]);

    return (
        <View style={{ flex: 1 }}>
            <StickyDate isStickyDateVisible={isStickyDateVisible} stickyDate={stickyDate} />
            <FlatList
                ref={flatListRef}
                inverted
                data={activityOrder}
                keyExtractor={(item) => item}
                renderItem={({ item, index }) => {
                    const currentCreator = activities[item].creator;
                    const previousCreator = index < activityOrder.length - 1 ? activities[activityOrder[index + 1]].creator : null;
                    const nextCreator = index > 0 ? activities[activityOrder[index - 1]].creator : null;
                    const showCreatorName = !previousCreator || currentCreator._id !== previousCreator._id;
                    const showCreatorAvatar = !nextCreator || currentCreator._id !== nextCreator._id;

                    const currentDate = new Date(activities[item].createdAt);
                    const previousDate = index < activityOrder.length - 1 ? new Date(activities[activityOrder[index + 1]].createdAt) : null;

                    const showDate = !previousDate || !areDatesEqual(currentDate, previousDate);
                    return (
                        <View onLayout={() => trackViewedItem(item)}>
                            <Feed
                                {...activities[item]}
                                contacts={contacts}
                                showCreatorName={showCreatorName}
                                showCreatorAvatar={showCreatorAvatar}
                                showDate={showDate}
                            />
                        </View>
                    );
                }}
                style={{ flex: 1 }}
                onScroll={toggleStickyDateAndScrollButton}
                onViewableItemsChanged={updateStickyDateOnViewableItemsChange}
                viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
            />
            {showScrollToBottom && (
                <Pressable style={styles.scrollToBottomButton} onPress={scrollToBottom}>
                    <FontAwesome6 name="angles-down" size={calcWidth(3.5)} color="white" />
                </Pressable>
            )}
        </View>
    );
};

export default FeedsContainer;

const styles = StyleSheet.create({
    scrollToBottomButton: {
        position: 'absolute',
        right: calcWidth(4),
        bottom: calcWidth(4),
        backgroundColor: '#272239',
        borderRadius: calcWidth(5),
        paddingHorizontal: calcWidth(2.8),
        paddingVertical: calcWidth(2.5),
        zIndex: 100,
    },
});
