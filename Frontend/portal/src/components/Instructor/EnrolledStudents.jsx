import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function EnrolledStudents({ courseId, courseName }) {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Initialize useNavigate

    const handleAssessmentClick = () => {
        // Navigate to the Assessment page with courseId and courseName
        navigate('/Assessment', { state: { courseId} });
    };

    useEffect(() => {
        const fetchEnrolledStudents = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`http://localhost:5000/api/enrolledStudents/${courseId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setStudents(response.data); // Set students data from API
            } catch (error) {
                console.error('Error fetching enrolled students:', error);
                setError('Failed to load students. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchEnrolledStudents();
    }, [courseId]); // Fetch students when courseId changes

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-3xl font-bold text-center mb-6">Enrolled Students</h2>
            {loading && <div className="text-center text-blue-500">Loading students...</div>}
            {error && <div className="text-center text-red-500">{error}</div>}
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-200">
                        <tr>
                            <th scope="col" className="px-6 py-3">Student ID</th>
                            <th scope="col" className="px-6 py-3">Student Name</th>
                            <th scope="col" className="px-6 py-3">Enrollment Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length > 0 ? (
                            students.map((student) => (
                                <tr key={student.University_id} className="bg-white border-b hover:bg-blue-50 transition duration-200">
                                    <td className="px-6 py-4 font-medium text-gray-900">{student.University_id}</td>
                                    <td className="px-6 py-4">{student.FullName}</td>
                                    <td className="px-6 py-4">{new Date(student.Enrollment_date).toLocaleDateString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="px-6 py-4 text-center text-gray-500">No students enrolled.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="p-6 flex justify-end pr-5">
                <button 
                    type="button" 
                    onClick={handleAssessmentClick}
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                >
                    Assessment
                </button>
            </div>
        </div>
    );
}