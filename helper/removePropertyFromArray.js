import loadash from 'lodash';
export const removeProperty = (array, property) => {
    return array.map((item) => loadash.omit(item, property));
};
