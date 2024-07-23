import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

import COLOR from '../constants/Colors';
import { calcWidth } from '../helper/res';

function CheckBox({ selected }) {
    return selected ? (
        <Ionicons name="checkmark-circle-sharp" size={calcWidth(7)} color={COLOR.BUTTON} />
    ) : (
        <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={calcWidth(7)} color="white" />
    );
}

export default CheckBox;
