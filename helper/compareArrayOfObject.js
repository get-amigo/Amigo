const compareArrayOfObject = (objArray1, objArray2, omit) => {
    if (objArray1.length !== objArray2.length) return false;
    for (let index = 0; index < objArray1.length; index++) {
        let element1 = objArray1[index];
        let element2 = objArray2[index];
        for (let key of Object.keys(element1)) {
            if (key === omit) continue;
            if (!Object.prototype.hasOwnProperty.call(element2, key)) return false;
            if (element1[key] !== element2[key]) return false;
        }
    }
    return true;
};
export default compareArrayOfObject;
