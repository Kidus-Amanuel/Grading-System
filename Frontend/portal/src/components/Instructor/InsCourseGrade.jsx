import React from 'react';
import { useNavigate } from 'react-router-dom';

const courses = [
    { name: 'Introduction to Psychology', code: 'PSY101', credits: 3 },
    { name: 'Calculus I', code: 'MATH101', credits: 4 },
    { name: 'Modern Literature', code: 'ENG201', credits: 3 },
    { name: 'Organic Chemistry', code: 'CHEM301', credits: 4 },
    { name: 'Data Structures', code: 'CS202', credits: 3 },
];

export default function InsCourseGrade() {
    const navigate = useNavigate();

    const handleRowClick = (course) => {
        // Navigate to StudentGrade with course information (if needed)
        navigate('/StudentGrade', { state: { course } });
    };

    const handleAddClick = () => {
        alert("Your grades have been submitted. You can see your student's grade.");
    };

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
                        {courses.map((course, index) => (
                            <tr 
                                key={index} 
                                className="bg-white border-b hover:bg-gray-50 cursor-pointer" // Add cursor pointer
                                onClick={() => handleRowClick(course)} // Handle row click
                            >
                                <td className="px-6 py-4 font-medium text-gray-900">{course.name}</td>
                                <td className="px-6 py-4">{course.code}</td>
                                <td className="px-6 py-4">{course.credits}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}