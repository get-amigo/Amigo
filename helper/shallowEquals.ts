export default function shallowEquals({ obj1, obj2 }: { obj1: Record<string, any>; obj2: Record<string, any> }) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}
