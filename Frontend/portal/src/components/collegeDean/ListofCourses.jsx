import React, { useState } from 'react';
import EditCourse from './EditCourses'; // Ensure this path is correct
import DeleteModal from './Deletepage'; // Ensure this path is correct

const coursesData = [
    { name: "Mathematics", code: "Math101", credits: 5, semester: "1 Year 1 Sem" },
    { name: "Physics", code: "Phy101", credits: 4, semester: "1 Year 1 Sem" },
    { name: "Chemistry", code: "Chem101", credits: 4, semester: "1 Year 1 Sem" },
    { name: "Biology", code: "Bio101", credits: 3, semester: "1 Year 1 Sem" },
    { name: "Computer Science", code: "CS101", credits: 5, semester: "1 Year 1 Sem" },
    { name: "English Literature", code: "Eng101", credits: 3, semester: "1 Year 1 Sem" },
    { name: "History", code: "Hist101", credits: 3, semester: "1 Year 1 Sem" },
    { name: "Economics", code: "Econ101", credits: 4, semester: "1 Year 2 Sem" },
    { name: "Statistics", code: "Stats101", credits: 4, semester: "1 Year 2 Sem" },
    { name: "Art", code: "Art101", credits: 2, semester: "1 Year 2 Sem" }
    
];


export default function ListCourses() {
    const [courses, setCourses] = useState(coursesData);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);

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

    const handleDelete = () => {
        setCourses((prevCourses) => prevCourses.filter((course) => course !== courseToDelete));
        closeDeleteModal();
    };

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
                                <td className="px-6 py-4">{course.credits}</td>
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
