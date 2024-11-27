import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Assessment from './Assessment'; // Ensure this path is correct
import AssigningInstructor from './AssigningInstructor'; // Ensure this path is correct

export default function ListDepCourses() {
    const [courses, setCourses] = useState([]);
    const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
    const [assigningModalOpen, setAssigningModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [error, setError] = useState(null);

    // Fetch courses from the API
    const fetchCourses = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/depcourses', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}` // Adjust according to your token storage
                }
            });
            setCourses(response.data);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError('Failed to load courses. Please try again.');
        }
    };

    useEffect(() => {
        fetchCourses(); // Fetch courses when the component mounts
    }, []);

    // Group courses by semester
    const groupedCourses = () => {
        return courses.reduce((acc, course) => {
            const semester = course.semester;  
            if (!acc[semester]) {
                acc[semester] = [];
            }
            acc[semester].push(course);
            return acc;
        }, {});
    };

    const handleAssignClick = (course) => {
        setSelectedCourse(course);
        setAssigningModalOpen(true);
    };

    const handleAssessmentClick = (course) => {
        setSelectedCourse(course);
        setAssessmentModalOpen(true);
    };

    const groupedCoursesData = groupedCourses(); // Call the grouping function

    return (
        <div className="mb-6">
            {error && <div className="text-red-600">{error}</div>}
            {Object.entries(groupedCoursesData).map(([semester, courseList]) => (
                <div key={semester} className="relative overflow-x-auto shadow-md sm:rounded-lg mb-6">
                    <h2 className="text-lg font-semibold mb-2">{semester}</h2>
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">Course Name</th>
                                <th scope="col" className="px-6 py-3">Course Code</th>
                                <th scope="col" className="px-6 py-3">Credit</th>
                                <th scope="col" className="px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courseList.map((course) => (
                                <tr key={course.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{course.name}</td>
                                    <td className="px-6 py-4">{course.code}</td>
                                    <td className="px-6 py-4">{course.credit}</td>
                                    <td className="px-6 py-4">
                                        <div className='flex justify-between px-5'>
                                            <button 
                                                className="text-blue-600 hover:text-blue-900"
                                                onClick={() => handleAssessmentClick(course)} // Open assessment modal
                                            >
                                                Assessment
                                            </button>    
                                            <button 
                                                className="text-blue-600 hover:text-blue-900"
                                                onClick={() => handleAssignClick(course)} // Open assigning instructor modal
                                            >
                                                Assign
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
            <Assessment 
                open={assessmentModalOpen} 
                onClose={() => setAssessmentModalOpen(false)} 
                course={selectedCourse} 
            />
            <AssigningInstructor 
                open={assigningModalOpen} 
                onClose={() => setAssigningModalOpen(false)} 
                course={selectedCourse} 
            />
        </div>
    );
}