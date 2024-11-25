import React, { useState } from 'react';
import AssigningInstructor from './AssigningInstructor'; // Ensure this path is correct

const courses = [
    { courseName: 'Introduction to Programming', courseCode: 'CS101', credit: 3, semester: 'Year 1 Semester I' },
    { courseName: 'Data Structures', courseCode: 'CS102', credit: 4, semester: 'Year 1 Semester I' },
    { courseName: 'Web Development', courseCode: 'CS201', credit: 3, semester: 'Year 1 Semester II' },
    { courseName: 'Database Management', courseCode: 'CS202', credit: 3, semester: 'Year 1 Semester II' },
    { courseName: 'Software Engineering', courseCode: 'CS301', credit: 4, semester: 'Year 2 Semester I' },
    { courseName: 'Operating Systems', courseCode: 'CS302', credit: 3, semester: 'Year 2 Semester I' },
    { courseName: 'Computer Networks', courseCode: 'CS401', credit: 4, semester: 'Year 2 Semester II' },
    { courseName: 'Machine Learning', courseCode: 'CS402', credit: 3, semester: 'Year 2 Semester II' },
    { courseName: 'Artificial Intelligence', courseCode: 'CS501', credit: 4, semester: 'Year 2 Semester II' },
    { courseName: 'Mobile Application Development', courseCode: 'CS502', credit: 3, semester: 'Year 2 Semester II' },
];

export default function ListDepCourses({ semester }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    const filteredCourses = courses.filter(course => course.semester === semester);

    const handleAssignClick = (course) => {
        setSelectedCourse(course);
        setModalOpen(true);
    };

    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg mb-6">
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
                    {filteredCourses.map((course, index) => (
                        <tr key={index} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{course.courseName}</td>
                            <td className="px-6 py-4">{course.courseCode}</td>
                            <td className="px-6 py-4">{course.credit}</td>
                            <td className="px-6 py-4">
                                <button 
                                    className="text-blue-600 hover:text-blue-900"
                                    onClick={() => handleAssignClick(course)}
                                >
                                    Assign
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <AssigningInstructor 
                open={modalOpen} 
                onClose={() => setModalOpen(false)} 
                course={selectedCourse} 
            />
        </div>
    );
}