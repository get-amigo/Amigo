import formatDateToMonthDay from './formatDateToMonth';

const groupDraftsByDate = (drafts) => {
    const grouped = drafts.reduce((acc, draft) => {
        const date = formatDateToMonthDay(draft.relatedId.date);
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(draft);
        return acc;
    }, {});

    return Object.keys(grouped).map((date) => ({
        title: date,
        data: grouped[date],
    }));
};

export default groupDraftsByDate;
