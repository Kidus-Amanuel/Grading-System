import React, { useState } from "react";
import EditDepartment from "./EditDepartment";
import DeleteModal from "./Deletepage";

const departments = [
    { name: "Computer Science", year: "4 Year", semesters: "8 Semesters" },
    { name: "Electrical Engineering", year: "5 Year", semesters: "11 Semesters" },
    { name: "Mechanical Engineering", year: "3rd Year", semesters: "10 Semesters" },
    { name: "Civil Engineering", year: "5 Year", semesters: "10 Semesters" },
    { name: "Business Administration", year: "5 Year", semesters: "10 Semesters" },
    { name: "Graphic Design", year: "1 Year", semesters: "3 Semesters" },
];

export default function ListOfDep() {
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);

    const handleEditClick = (department) => {
        setSelectedDepartment(department);
        setOpenEditModal(true);
    };

    const handleEditSubmit = (updatedDepartment) => {
        const index = departments.findIndex((dep) => dep.name === selectedDepartment.name);
        if (index !== -1) {
            departments[index] = { ...departments[index], ...updatedDepartment }; // Update department properties
        }
        setOpenEditModal(false);
    };

    const handleDeleteClick = (department) => {
        setSelectedDepartment(department);
        setOpenDeleteModal(true);
    };

    const handleDeleteConfirm = () => {
        const index = departments.findIndex((dep) => dep.name === selectedDepartment.name);
        if (index !== -1) {
            departments.splice(index, 1); // Remove the selected department
        }
        setOpenDeleteModal(false);
    };

    return (
        <div>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Department Name</th>
                            <th scope="col" className="px-6 py-3">Year</th>
                            <th scope="col" className="px-6 py-3">Semesters</th>
                            <th scope="col" className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.map((department, index) => (
                            <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {department.name}
                                </th>
                                <td className="px-6 py-4">{department.year}</td>
                                <td className="px-6 py-4">{department.semesters}</td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleEditClick(department)}
                                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(department)}
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
            {openEditModal && (
                <EditDepartment
                    open={openEditModal}
                    onClose={() => setOpenEditModal(false)}
                    department={selectedDepartment}
                    onSubmit={handleEditSubmit}
                />
            )}
            {openDeleteModal && (
                <DeleteModal
                    open={openDeleteModal}
                    onClose={() => setOpenDeleteModal(false)}
                    onConfirm={handleDeleteConfirm}
                />
            )}
        </div>
    );
}
