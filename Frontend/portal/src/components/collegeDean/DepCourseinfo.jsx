import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function DepCourseInfo() {
    const [departmentCourses, setDepartmentCourses] = useState([]);

    // Fetch department courses data on component mount
    useEffect(() => {
        // Replace with your API URL
        axios.get('http://localhost:5000/api/courses', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            .then((response) => {
                setDepartmentCourses(response.data);
            })
            .catch((error) => {
                console.error("There was an error fetching the department courses!", error);
            });
    }, []); // Empty dependency array ensures this runs once when the component mounts

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
                                        state={{ departmentId: department.id }} // Pass departmentId here
                                        className="contents" // Ensures the link styles don't affect the table row
                                    >
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                            {department.name}
                                        </th>
                                        <td className="px-6 py-4">{department.totalCourses}</td>
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
