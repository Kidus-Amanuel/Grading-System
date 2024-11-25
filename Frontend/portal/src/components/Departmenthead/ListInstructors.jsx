import React from 'react';

const instructors = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Alice Johnson' },
    { id: 4, name: 'Bob Brown' },
    { id: 5, name: 'Charlie White' },
];

export default function ListInstructors() {
    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg mb-6">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>
                        <th scope="col" className="px-6 py-3">Instructor ID</th>
                        <th scope="col" className="px-6 py-3">Instructor Name</th>
                    </tr>
                </thead>
                <tbody>
                    {instructors.map((instructor) => (
                        <tr key={instructor.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4">{instructor.id}</td>
                            <td className="px-6 py-4 font-medium text-gray-900">{instructor.name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}