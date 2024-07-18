function areDatesEqual(date1, date2) {
    const date1Day = date1.getDate();
    const date1Month = date1.getMonth();
    const date1Year = date1.getFullYear();

    const date2Day = date2.getDate();
    const date2Month = date2.getMonth();
    const date2Year = date2.getFullYear();

    return date1Day === date2Day && date1Month === date2Month && date1Year === date2Year;
}

export default areDatesEqual;
