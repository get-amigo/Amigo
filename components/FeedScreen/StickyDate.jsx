import React from 'react';
import { Text, View } from 'react-native';

import { calcWidth, getFontSizeByWindowWidth } from '../../helper/res';

const StickyDate = ({ isStickyDateVisible, stickyDate }) => {
    return (
        isStickyDateVisible &&
        stickyDate !== '' && (
            <View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'transparent',
                    padding: 2,
                    zIndex: 100,
                    alignItems: 'center',
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
                    {stickyDate}
                </Text>
            </View>
        )
    );
};

export default StickyDate;
