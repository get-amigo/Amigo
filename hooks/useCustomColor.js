import COLOR from '../constants/Colors';
import getAvatarColor from '../constants/getAvatarColor';
import { useAuth } from '../stores/auth';
function useCustomColor() {
    const { user } = useAuth();

    const generateColor = (id) => {
        return id === user._id ? COLOR.BUTTON : getAvatarColor(id);
    };

    return generateColor;
}

export default useCustomColor;
