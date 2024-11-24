import React from 'react';
import { Link } from 'react-router-dom';

const departmentCourses = [
    { name: "Computer Science", totalCourses: 10, totalCredits: 30 },
    { name: "Electrical Engineering", totalCourses: 8, totalCredits: 28 },
    { name: "Mechanical Engineering", totalCourses: 12, totalCredits: 36 },
    { name: "Civil Engineering", totalCourses: 9, totalCredits: 27 },
    { name: "Business Administration", totalCourses: 7, totalCredits: 21 },
    { name: "Graphic Design", totalCourses: 6, totalCredits: 18 },
];

export default function DepCourseInfo() {
    return (
        <div>
            <div className="text-center z-0">
                <h1 className="text-2xl font-semibold mb-6">Department Course Information</h1>
                <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Department Name</th>
                                <th scope="col" className="px-6 py-3">Total Courses</th>
                                <th scope="col" className="px-6 py-3">Total Credits</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departmentCourses.map((department, index) => (
                                <tr 
                                    key={index} 
                                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 cursor-pointer"
                                >
                                    <Link
                                        to={`/DepartCourses`}
                                        state={{ department }}
                                        className="contents" // Ensures the link styles don't affect the table row
                                    >
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            {department.name}
                                        </th>
                                        <td className="px-6 py-4">{department.totalCourses}</td>
                                        <td className="px-6 py-4">{department.totalCredits}</td>
                                    </Link>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
