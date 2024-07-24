import editNamesAsync from '../helper/editNamesAsync';

/**
 * Groups data items by their group ID and name.
 * @param {Array} dataItems - Array of data items to be grouped.
 * @returns {Array} An array of grouped data items.
 */
function groupDataItemsByGroup(dataItems) {
    const groups = {};

    dataItems.forEach((item) => {
        const groupId = item.group._id.toString();

        if (!groups[groupId]) {
            groups[groupId] = {
                _id: item.group._id,
                name: item.group.name,
                documents: [],
            };
        }

        groups[groupId].documents.push({
            _id: item._id,
            lender: item.lender,
            borrower: item.borrower,
            amount: item.amount,
            // Additional fields can be added as needed
        });
    });

    return Object.values(groups);
}

/**
 * Calculates the total balance for a user within each group.
 * @param {Object} group - Group object containing documents.
 * @param {string} userId - User ID for balance calculation.
 * @returns {Object} An object containing balance details for the user within the group.
 */
function calculateUserBalanceInGroup(group, userId) {
    const borrowers = [];
    const lenders = [];
    let borrowerCount = 0;
    let lenderCount = 0;
    let totalBalance = 0;

    group.documents.forEach((document) => {
        if (document.lender._id === userId) {
            borrowers.push({
                name: document.borrower.name,
                _id: document.borrower._id,
                amount: document.amount,
                phoneNumber: document.borrower.phoneNumber,
            });
            totalBalance += document.amount;
            borrowerCount++;
        } else if (document.borrower._id === userId) {
            lenders.push({
                name: document.lender.name,
                _id: document.lender._id,
                amount: document.amount,
                phoneNumber: document.lender.phoneNumber,
            });
            totalBalance -= document.amount;
            lenderCount++;
        }
    });

    return {
        borrowers,
        lenders,
        borrowerCount,
        lenderCount,
        totalBalance,
        name: group.name,
        _id: group._id,
    };
}

/**
 * Groups balances by group and calculates the total balance for a specific user.
 * @param {Array} balances - Array of balance objects to group.
 * @param {string} userId - ID of the user for whom to calculate the total balance.
 * @returns {Object} An object containing grouped balances and the user's total balance.
 */
async function groupBalancesAndCalculateTotal(balances, userId) {
    const groupedBalances = groupDataItemsByGroup(balances);
    let userTotalBalance = 0;
    const userGroups = [];

    // Use for...of loop for async/await
    for (const group of groupedBalances) {
        const groupBalanceDetails = calculateUserBalanceInGroup(group, userId);
        groupBalanceDetails.lenders = await editNamesAsync(groupBalanceDetails.lenders, userId);
        groupBalanceDetails.borrowers = await editNamesAsync(groupBalanceDetails.borrowers, userId);
        userGroups.push(groupBalanceDetails);
        userTotalBalance += groupBalanceDetails.totalBalance;
    }

    return { groups: userGroups, userTotalBalance };
}

export default groupBalancesAndCalculateTotal;
