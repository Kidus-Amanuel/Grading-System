import React, { useState } from 'react';
import EditGrade from './EditGrade'; // Import the EditGrade modal component

const students = [
    { id: 'S001', name: 'Alice Johnson', totalAssessment: 85 },
    { id: 'S002', name: 'Bob Smith', totalAssessment: 76 },
    { id: 'S003', name: 'Charlie Brown', totalAssessment: 92 },
    { id: 'S004', name: 'Diana Prince', totalAssessment: 68 },
    { id: 'S005', name: 'Edward Kenway', totalAssessment: 59 },
];

// Function to determine grade based on total assessment score
const getGrade = (total) => {
    if (total >= 90) return 'A';
    if (total >= 80) return 'B';
    if (total >= 70) return 'C';
    if (total >= 60) return 'D';
    return 'F';
};

export default function GradeTable() {
    const [studentsData, setStudentsData] = useState(students);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const handleEditClick = (student) => {
        setSelectedStudent(student);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedStudent(null);
    };

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-semibold mb-4">Student Grades</h2>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-3">Student ID</th>
                            <th scope="col" className="px-6 py-3">Student Name</th>
                            <th scope="col" className="px-6 py-3">Total Assessment</th>
                            <th scope="col" className="px-6 py-3">Grade</th>
                            <th scope="col" className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {studentsData.map((student) => (
                            <tr key={student.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{student.id}</td>
                                <td className="px-6 py-4">{student.name}</td>
                                <td className="px-6 py-4">{student.totalAssessment}</td>
                                <td className="px-6 py-4">{getGrade(student.totalAssessment)}</td>
                                <td className="px-6 py-4">
                                    <button 
                                        onClick={() => handleEditClick(student)} 
                                        className="text-blue-600 hover:underline"
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <EditGrade 
                open={modalOpen} 
                onClose={handleCloseModal} 
                student={selectedStudent} // Pass the selected student data to the modal
            />
        </div>
    );
}