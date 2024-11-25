import React from 'react';

const generateRandomStudent = (id) => {
    const names = [
        'Alice Johnson',
        'Bob Smith',
        'Charlie Brown',
        'Diana Prince',
        'Edward Kenway',
        'Fiona Apple',
        'George Lucas',
        'Hannah Montana',
        'Ian Malcolm',
        'Jane Doe',
    ];

    // Generate a random year for the batch between 2016 and 2025
    const year = Math.floor(Math.random() * (2025 - 2016 + 1)) + 2016;
    const batch = `${year} Batch`;

    return {
        studentID: `S00${id}`,
        studentName: names[id % names.length],
        batch: batch,
    };
};

const generateStudents = (count) => {
    return Array.from({ length: count }, (_, index) => generateRandomStudent(index + 1));
};

const students = generateStudents(10); // Generate 10 students

// Function to group students by batch
const groupStudentsByBatch = (students) => {
    return students.reduce((acc, student) => {
        if (!acc[student.batch]) {
            acc[student.batch] = [];
        }
        acc[student.batch].push(student);
        return acc;
    }, {});
};

const groupedStudents = groupStudentsByBatch(students);

export default function ListStudents() {
    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-semibold mb-4">List of Students</h2>
            {Object.entries(groupedStudents).map(([batch, students]) => (
                <div key={batch} className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">{batch}</h3>
                    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Student ID</th>
                                    <th scope="col" className="px-6 py-3">Student Name</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student, index) => (
                                    <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{student.studentID}</td>
                                        <td className="px-6 py-4">{student.studentName}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
}