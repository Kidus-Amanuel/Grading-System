import React from 'react';
import { useNavigate } from 'react-router-dom';

const courses = [
    { name: 'Introduction to Psychology', code: 'PSY101', credits: 3 },
    { name: 'Calculus I', code: 'MATH101', credits: 4 },
    { name: 'Modern Literature', code: 'ENG201', credits: 3 },
    { name: 'Organic Chemistry', code: 'CHEM301', credits: 4 },
    { name: 'Data Structures', code: 'CS202', credits: 3 },
];

export default function ListInsCourse() {
    const navigate = useNavigate();

    const handleRowClick = (course) => {
        // Navigate to InsCourseStudent with course info (if needed)
        navigate('/InsCourseStudent', { state: { course } });
    };

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-semibold mb-4">Courses Taught by Instructor</h2>
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
                            <tr key={index} className="bg-white border-b hover:bg-gray-50" onClick={() => handleRowClick(course)}>
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