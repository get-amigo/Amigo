import { Text, View } from 'react-native';

import getAvatarColor from '../constants/getAvatarColor';
import { calcHeight, getFontSizeByWindowWidth } from '../helper/res';
const selectorSize = 5;

function UserAvar({ user: { name, _id }, size = selectorSize }) {
    return (
        <View
            style={[
                {
                    height: calcHeight(size),
                    width: calcHeight(size),
                    borderRadius: calcHeight(size),
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                { backgroundColor: getAvatarColor(_id) },
            ]}
        >
            <Text
                style={{
                    fontSize: getFontSizeByWindowWidth(size * 2.5),
                }}
            >
                {name && name.charAt(0).toUpperCase()}
            </Text>
        </View>
    );
}

export default UserAvar;
