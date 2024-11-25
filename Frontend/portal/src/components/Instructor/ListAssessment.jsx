import React, { useState } from 'react';

const students = [
    { id: 'S001', name: 'Alice Johnson' },
    { id: 'S002', name: 'Bob Smith' },
    { id: 'S003', name: 'Charlie Brown' },
    { id: 'S004', name: 'Diana Prince' },
    { id: 'S005', name: 'Edward Kenway' },
];

export default function ListAssessment() {
    // State to hold assessment scores
    const [assessments, setAssessments] = useState(
        students.reduce((acc, student) => {
            acc[student.id] = { assignment: '', midterm: '', final: '' };
            return acc;
        }, {})
    );

    const handleInputChange = (studentId, assessmentType, value) => {
        setAssessments({
            ...assessments,
            [studentId]: {
                ...assessments[studentId],
                [assessmentType]: value,
            },
        });
    };

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-semibold mb-4">Assessment List</h2>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-3">Student ID</th>
                            <th scope="col" className="px-6 py-3">Student Name</th>
                            <th scope="col" className="px-6 py-3">Assignment</th>
                            <th scope="col" className="px-6 py-3">Midterm</th>
                            <th scope="col" className="px-6 py-3">Final</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr key={student.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{student.id}</td>
                                <td className="px-6 py-4">{student.name}</td>
                                <td className="px-6 py-4">
                                    <input
                                        type="number"
                                        value={assessments[student.id].assignment}
                                        onChange={(e) => handleInputChange(student.id, 'assignment', e.target.value)}
                                        className="border border-gray-300 rounded p-1"
                                        placeholder="Enter Assignment Score"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <input
                                        type="number"
                                        value={assessments[student.id].midterm}
                                        onChange={(e) => handleInputChange(student.id, 'midterm', e.target.value)}
                                        className="border border-gray-300 rounded p-1"
                                        placeholder="Enter Midterm Score"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <input
                                        type="number"
                                        value={assessments[student.id].final}
                                        onChange={(e) => handleInputChange(student.id, 'final', e.target.value)}
                                        className="border border-gray-300 rounded p-1"
                                        placeholder="Enter Final Score"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}