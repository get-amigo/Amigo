import { create } from '../helper/zustand';

const useReplyStore = create((set) => ({
    replyingTo: null,
    isReplying: false,
    toReplyMessage: null,
    setReplyingTo: (reply) => set({ replyingTo: reply }),
    setIsReplying: (status) => set({ isReplying: status }),
    setToReplyMessage: (message) => set({ toReplyMessage: message }),
    resetReply: () => set({ replyingTo: null, isReplying: false, toReplyMessage: null }),
}));

export default useReplyStore;
