const compareArrayOfObject = ({ objArray1, objArray2, omit }) => {
    if (!checkIfLengthIsEqual(objArray1, objArray2)) return false;
    return checkIfArrayOfObjectIsEqual({ objArray1: objArray1, objArray2: objArray2, omit: omit });
};
const checkIfArrayOfObjectIsEqual = ({ objArray1, objArray2, omit }) => {
    for (let index = 0; index < objArray1.length; index++) {
        let element1 = objArray1[index];
        let element2 = objArray2[index];
        if (!checkIfObjectIsEqual({ obj1: element1, obj2: element2, omit: omit })) return false;
    }
    return true;
};
const checkIfObjectIsEqual = ({ obj1, obj2, omit }) => {
    for (let key of Object.keys(obj1)) {
        if (key === omit) continue;
        if (!Object.prototype.hasOwnProperty.call(obj2, key)) return false;
        if (obj1[key] !== obj2[key]) return false;
    }
    return true;
};
const checkIfLengthIsEqual = (objArray1, objArray2) => {
    return objArray1.length === objArray2.length;
};
export default compareArrayOfObject;
