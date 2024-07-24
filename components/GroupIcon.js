import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image } from 'react-native';

import COLOR from '../constants/Colors';
import groupIcons from '../constants/groupIcons';
import generateRandomNumberBasedOnUUIDAndRange from '../helper/generateRandomNumberBasedOnUUIDAndRange';
import { calcHeight, calcWidth } from '../helper/res';

const defaultSize = 5;

function GroupIcon({ groupId, size = defaultSize }) {
    return groupId ? (
        <Image
            source={groupIcons[generateRandomNumberBasedOnUUIDAndRange(groupId, 0, 39)]}
            style={{
                height: calcHeight(size),
                width: calcHeight(size),
                borderRadius: calcHeight(size),
            }}
        />
    ) : (
        <View
            style={{
                height: calcHeight(size),
                width: calcHeight(size),
                borderRadius: calcHeight(size),
                backgroundColor: COLOR.SKELETON_MASK_COLOR,
            }}
        />
    );
}

export default GroupIcon;
