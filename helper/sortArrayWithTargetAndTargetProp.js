export default function SortArrayWithTargetAndTargetProp({ arr, target, targetProp }) {
    if (target === '') return arr;
    return arr.sort(function (a, b) {
        const lowerA = a[targetProp].toLowerCase();
        const lowerB = b[targetProp].toLowerCase();
        const lowerTarget = target.toLowerCase();
        if (lowerA.startsWith(lowerTarget)) return -1;
        if (lowerB.startsWith(lowerTarget)) return 1;
        if (lowerA.includes(lowerTarget)) return -1;
        if (lowerB.includes(lowerTarget)) return 1;
        if (lowerA.endsWith(lowerTarget)) return -1;
        if (lowerB.endsWith(lowerTarget)) return 1;
    });
}
