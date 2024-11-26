import React, { useState, useEffect } from "react";
import axios from "axios";
import EditDepartment from "./EditDepartment"; // Assuming you have this component
import DeleteModal from "./Deletepage"; // Assuming you have this component

export default function ListOfDep() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);

    // Fetch departments on component mount
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const token = localStorage.getItem("token"); // Assuming the token is stored in localStorage
                const response = await axios.get("http://localhost:5000/api/departments", {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the request header
                    },
                });
                
                setDepartments(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching departments:", err);
                setError("Failed to load departments.");
                setLoading(false);
            }
        };

        fetchDepartments();
    }, []);

    const handleEditClick = (department) => {
        setSelectedDepartment(department);
        setOpenEditModal(true);
    };

    const handleEditSubmit = (updatedDepartment) => {
        const index = departments.findIndex((dep) => dep.id === selectedDepartment.id);
        if (index !== -1) {
            const updatedDepartments = [...departments];
            updatedDepartments[index] = { ...updatedDepartments[index], ...updatedDepartment }; // Update department properties
            setDepartments(updatedDepartments);
        }
        setOpenEditModal(false);
    };

    const handleDeleteClick = (department) => {
        setSelectedDepartment(department);
        setOpenDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        const token = localStorage.getItem("token"); // Assuming the token is stored in localStorage
        try {
            // Send delete request to backend
            const response = await axios.delete(`http://localhost:5000/api/departments/${selectedDepartment.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Include the token in the request header
                },
            });

            console.log(response.data.message); // Log success message
            // Remove department from local state
            setDepartments(departments.filter((dep) => dep.id !== selectedDepartment.id));

            setOpenDeleteModal(false); // Close modal
        } catch (error) {
            console.error("Error deleting department:", error);
            setError("Failed to delete department.");
            setOpenDeleteModal(false); // Close modal in case of error
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Department Name</th>
                            <th scope="col" className="px-6 py-3">Years</th> {/* Corrected from "Year" to "Years" */}
                            <th scope="col" className="px-6 py-3">Semesters</th>
                            <th scope="col" className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.map((department) => (
                            <tr key={department.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {department.name}
                                </th>
                                <td className="px-6 py-4">{department.years}</td> {/* Corrected reference */}
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
