import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EditGrade from './EditGrade'; // Import the EditGrade modal component

export default function GradeTable({ courseId }) {
    const [studentsData, setStudentsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        const fetchStudentGrades = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/studentGrades/${courseId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setStudentsData(response.data);
            } catch (err) {
                console.error('Error fetching student grades:', err);
                setError('Failed to fetch student grades. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchStudentGrades();
        }
    }, [courseId]);

    const handleEditClick = (student) => {
        setSelectedStudent(student);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedStudent(null);
    };

    const handleSubmitGrades = async () => {
        try {
            const response = await axios.post(
                `http://localhost:5000/grade-submission-status`,
                { courseId, students: studentsData },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            alert('Grades submitted successfully!');
        } catch (err) {
            console.error('Error submitting grades:', err);
            alert('Failed to submit grades. Please try again.');
        }
    };

    if (loading) {
        return <div>Loading student grades...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-semibold mb-4">Student Grades</h2>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-3">Student ID</th>
                            <th scope="col" className="px-6 py-3">Student Name</th>
                            <th scope="col" className="px-6 py-3">Grade</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {studentsData.map((student) => (
                            <tr key={student.University_id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{student.University_id}</td>
                                <td className="px-6 py-4">{student.FullName}</td>
                                <td className="px-6 py-4">{student.Grade}</td>
                                <td className="px-6 py-4">{student.Status}</td>
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

            <div className="flex justify-end mt-4">
                <button
                    onClick={handleSubmitGrades}
                    className="bg-green-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-600 transition"
                >
                    Submit Grades
                </button>
            </div>

            <EditGrade 
                open={modalOpen} 
                onClose={handleCloseModal} 
                student={selectedStudent} 
                courseId={courseId} // Pass the courseId to the modal
            />
        </div>
    );
}
