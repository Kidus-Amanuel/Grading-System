import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ListInstructors() {
    const [instructors, setInstructors] = useState([]);
    const [error, setError] = useState(null);

    // Fetch instructors from the backend API
    const fetchInstructors = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/instructors', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}` // Add token from localStorage
                },
            });
            console.log('Instructors fetched:', response.data); // Debugging log
            setInstructors(response.data);
        } catch (err) {
            console.error('Error fetching instructors:', err);
            setError(err.response?.data?.message || 'Failed to load instructors.');
        }
    };

    useEffect(() => {
        fetchInstructors();
    }, []);

    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg mb-6">
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                    <tr>
                        <th scope="col" className="px-6 py-3">Instructor ID</th>
                        <th scope="col" className="px-6 py-3">Instructor Name</th>
                        <th scope="col" className="px-6 py-3">Email</th>
                    </tr>
                </thead>
                <tbody>
                    {instructors.length > 0 ? (
                        instructors.map((instructor) => (
                            <tr key={instructor.University_id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4">{instructor.University_id}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{instructor.FullName}</td>
                                <td className="px-6 py-4">{instructor.Email}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                                No instructors found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
