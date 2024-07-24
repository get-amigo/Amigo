import { calcHeight } from '../helper/res';
import COLOR from './Colors';
const size = 6;
export default {
    backgroundColor: COLOR.BUTTON,
    // Increase the size of the FAB
    height: calcHeight(size), // Default is usually 56, increase this value
    width: calcHeight(size), // Default is usually 56, increase this value
    borderRadius: calcHeight(size), // Adjust the border radius if needed (half of width/height for perfect circle)
    alignItems: 'center',
    justifyContent: 'center',
};
