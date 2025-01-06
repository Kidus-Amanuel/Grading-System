import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ListStudents() {
    const [groupedStudents, setGroupedStudents] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/students', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const students = response.data;
                const grouped = groupStudentsByBatch(students);
                setGroupedStudents(grouped);
            } catch (error) {
                console.error('Error fetching students:', error);
                setError('Could not load students.');
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    const groupStudentsByBatch = (students) => {
        return students.reduce((acc, student) => {
            const batch = `${student.batchYear} Batch`;
            if (!acc[batch]) {
                acc[batch] = [];
            }
            acc[batch].push(student);
            return acc;
        }, {});
    };

    const handleStudentClick = (studentId) => {
        console.log("Sending studentId:", studentId); // Log the studentId being sent
        navigate('/DepartmentStudentInfo', { state: { studentId } }); // Pass Student_id in location state
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

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
                                {students.map((student) => (
                                    <tr
                                        key={student.Student_id}
                                        className="bg-white border-b hover:bg-gray-50 cursor-pointer"
                                        onClick={() => handleStudentClick(student.Student_id)} // Call the click handler
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900">{student.Student_id}</td>
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
