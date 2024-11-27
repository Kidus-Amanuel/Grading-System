import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EditCourse from './EditCourses';
import DeleteModal from './Deletepage';

export default function ListCourses({ departmentId }) {
    const [courses, setCourses] = useState([]);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/departments/${departmentId}/courses`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setCourses(response.data);
            } catch (error) {
                setError("There was an error fetching the courses.");
                console.error("Error fetching courses:", error);
            } finally {
                setLoading(false);
            }
        };

        if (departmentId) {
            fetchCourses();
        }
    }, [departmentId]);

    const openEditModal = (course) => {
        setSelectedCourse(course);
        setIsEditOpen(true);
    };

    const closeEditModal = () => {
        setIsEditOpen(false);
        setSelectedCourse(null);
    };

    const openDeleteModal = (course) => {
        setCourseToDelete(course);
        setIsDeleteOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteOpen(false);
        setCourseToDelete(null);
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/course/${courseToDelete.id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setCourses((prevCourses) => prevCourses.filter((course) => course.id !== courseToDelete.id));
            closeDeleteModal();
        } catch (error) {
            console.error("Error deleting course:", error);
            // Optionally show an error message to the user
        }
    };

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Course Name</th>
                            <th scope="col" className="px-6 py-3">Course Code</th>
                            <th scope="col" className="px-6 py-3">Credit</th>
                            <th scope="col" className="px-6 py-3">Semester</th>
                            <th scope="col" className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((course, index) => (
                            <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {course.name}
                                </th>
                                <td className="px-6 py-4">{course.code}</td>
                                <td className="px-6 py-4">{course.credit}</td>
                                <td className="px-6 py-4">{course.semester}</td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => openEditModal(course)}
                                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => openDeleteModal(course)}
                                        className="font-medium text-red-600 dark:text-red-500 hover:underline ml-4"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isEditOpen && selectedCourse && (
                <EditCourse
                    open={isEditOpen}
                    onClose={closeEditModal}
                    course={selectedCourse}
                    departmentId={departmentId}
                />
            )}
            {isDeleteOpen && courseToDelete && (
                <DeleteModal
                    open={isDeleteOpen}
                    onClose={closeDeleteModal}
                    onConfirm={handleDelete}
                />
            )}
        </div>
    ); 
}