import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function InsCourseGrade() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]); // State to store courses
    const [loading, setLoading] = useState(true); // State to manage loading status
    const [error, setError] = useState(null); // State to manage error messages

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/instructorCourses', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`, // Include token in headers
                    },
                });
                setCourses(response.data);
                console.log("Fetched courses:", response.data); // Log the fetched courses directly
            } catch (err) {
                console.error('Error fetching courses:', err);
                setError('Failed to fetch courses. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []); // Empty dependency array means this runs once on mount

    const handleRowClick = (course) => {
        // Navigate to StudentGrade with course information (if needed)
        navigate('/StudentGrade', { state: { Course_id: course.Course_id } });
    };

    const handleAddClick = () => {
        alert("Your grades have been submitted. You can see your student's grade.");
    };

    if (loading) {
        return <div>Loading courses...</div>; // Loading state
    }

    if (error) {
        return <div className="text-red-500">{error}</div>; // Error state
    }

    return (
        <div className="container mx-auto p-4">
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-3">Course Name</th>
                            <th scope="col" className="px-6 py-3">Course Code</th>
                            <th scope="col" className="px-6 py-3">Credits</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((course) => (
                            <tr 
                                key={course.Course_id} 
                                className="bg-white border-b hover:bg-gray-50 cursor-pointer"
                                onClick={() => handleRowClick(course)} // Handle row click
                            >
                                <td className="px-6 py-4 font-medium text-gray-900">{course.Coursename}</td>
                                <td className="px-6 py-4">{course.Coursecode}</td>
                                <td className="px-6 py-4">{course.Credit}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}