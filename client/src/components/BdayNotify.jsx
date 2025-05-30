import React from 'react'

const BdayNotify = ({ treeData }) => {
    const getBdayNotification = () => {
        const today = new Date();
        const upcoming = [];

        const traverse = (nodes) => {
            nodes.forEach((node) => {
                const birthday = node.attribute?.birthdate;
                if (birthday) {
                    const [year, month, day] = birthday.split('-');
                    const birthdayThisYear = new Date(today.getFullYear(), month - 1, day);

                    const diffTime = birthdayThisYear - today;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays >= 0 && diffDays <= 7) {
                        upcoming.push({
                            name: node.name,
                            date: birthday,
                            inDays: diffDays
                        })
                    }
                }
                if (node.children) traverse(node.children);
            });
        }
        traverse(tree);
        return upcoming.sort((a, b) => a.inDays - b.inDays);
    }

    const upcoming = getBdayNotification();
    return (
        <>
            <div className="w-full max-w-md p-4 bg-blue-50 border border-blue-200 rounded-xl shadow-sm">
                <h3 className="text-blue-700 font-semibold text-lg mb-2">🎉 Upcoming Birthdays</h3>
                {upcoming.length === 0 ? (
                    <p className="text-gray-500">No birthdays in the next 7 days.</p>
                ) : (
                    <ul className="space-y-2">
                        {upcoming.map((b, i) => (
                            <li key={i} className="bg-white p-2 rounded shadow-sm border border-blue-100">
                                <strong>{b.name}</strong> – {b.date} ({b.inDays} day{b.inDays !== 1 ? 's' : ''} left)
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    )
}

export default BdayNotify
