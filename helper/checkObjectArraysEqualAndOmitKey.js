const checkIfLengthIsEqual = (objArray1, objArray2) => {
    return objArray1.length === objArray2.length;
};

const checkIfObjectIsEqualAndOmitKey = ({ obj1, obj2, omit }) => {
    for (let key of Object.keys(obj1)) {
        if (key === omit) continue;
        if (!Object.prototype.hasOwnProperty.call(obj2, key)) return false;
        if (obj1[key] !== obj2[key]) return false;
    }
    return true;
};

const checkObjectArraysEqualityAndOmitKey = ({ objArray1, objArray2, omit }) => {
    if (!checkIfLengthIsEqual(objArray1, objArray2)) return false;

    for (let index = 0; index < objArray1.length; index++) {
        let element1 = objArray1[index];
        let element2 = objArray2[index];
        if (!checkIfObjectIsEqualAndOmitKey({ obj1: element1, obj2: element2, omit: omit })) return false;
    }
    return true;
};

export default checkObjectArraysEqualityAndOmitKey;
