import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ListInsCourse() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]); // State to hold courses
    const [loading, setLoading] = useState(true); // State for loading status
    const [error, setError] = useState(null); // State for error handling

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            setError(null); // Reset error state before fetching
            try {
                const response = await axios.get('http://localhost:5000/api/instructorCourses', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setCourses(response.data); // Set the courses from API response
            } catch (error) {
                console.error('Error fetching instructor courses:', error);
                setError('Failed to load courses. Please try again later.'); // Set error message
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };

        fetchCourses(); // Fetch courses on component mount
    }, []);

    const handleRowClick = (course) => {
        // Navigate to InsCourseStudent with course info
        navigate('/InsCourseStudent', { state: { course } });
    };

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-3xl font-bold text-center mb-6">Courses Taught by Instructor</h2>
            {loading && <div className="text-center text-blue-500">Loading courses...</div>}
            {error && <div className="text-center text-red-500">{error}</div>}
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-200">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-gray-700">Course Name</th>
                            <th scope="col" className="px-6 py-3 text-gray-700">Course Code</th>
                            <th scope="col" className="px-6 py-3 text-gray-700">Credits</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.length > 0 ? (
                            courses.map((course) => (
                                <tr key={course.Course_id} className="bg-white border-b hover:bg-blue-50 cursor-pointer transition duration-200" onClick={() => handleRowClick(course)}>
                                    <td className="px-6 py-4 font-medium text-gray-900">{course.Coursename}</td>
                                    <td className="px-6 py-4">{course.Coursecode}</td>
                                    <td className="px-6 py-4">{course.Credit}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="px-6 py-4 text-center text-gray-500">No courses available.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}