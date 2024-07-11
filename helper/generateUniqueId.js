import { ObjectId } from 'bson';

function generateUniqueId() {
    const id = new ObjectId().toString();
    return id;
}

export default generateUniqueId;
