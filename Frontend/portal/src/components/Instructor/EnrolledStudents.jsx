import React from 'react';

const enrolledStudents = [
    { id: 'S001', name: 'Alice Johnson' },
    { id: 'S002', name: 'Bob Smith' },
    { id: 'S003', name: 'Charlie Brown' },
    { id: 'S004', name: 'Diana Prince' },
    { id: 'S005', name: 'Edward Kenway' },
];

export default function EnrolledStudents() {
    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-semibold mb-4">Enrolled Students</h2>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-3">Student ID</th>
                            <th scope="col" className="px-6 py-3">Student Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {enrolledStudents.map((student, index) => (
                            <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{student.id}</td>
                                <td className="px-6 py-4">{student.name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}