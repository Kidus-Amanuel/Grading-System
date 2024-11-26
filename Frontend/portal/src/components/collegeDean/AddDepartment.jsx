import ReactDom from 'react-dom';
import { useState } from 'react';
import axios from 'axios'; // Import Axios

const MODAL_STYLES = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    padding: '1rem',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
    width: '90%',
    maxWidth: '400px',
    height: 'auto',
};

const OVERLAY_STYLES = {
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
};

export default function AddDepartment({ open, onClose }) {
    const [departmentName, setDepartmentName] = useState('');
    const [yearsToFinish, setYearsToFinish] = useState('');
    const [semestersPerYear, setSemestersPerYear] = useState([]);

    // Handle changes for semesters per year
    const handleSemestersChange = (index, value) => {
        const updatedSemesters = [...semestersPerYear];
        updatedSemesters[index] = parseInt(value, 10); // Ensure numeric values
        setSemestersPerYear(updatedSemesters);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Retrieve the JWT token from localStorage or Context
        const token = localStorage.getItem('token'); // assuming token is stored in localStorage
        
        if (!token) {
            alert('Authentication required. Please log in.');
            return;
        }

        try {
            const data = {
                name: departmentName,
                years: yearsToFinish, // Ensure 'years' is a string
                semestersPerYear,
            };

            // Log the data to check the payload
            console.log('Sending data to API:', data);

            // POST request to add department
            const response = await axios.post('http://localhost:5000/api/departments', data, {
                headers: {
                    Authorization: `Bearer ${token}`, // Attach the token in the Authorization header
                },
            });

            console.log('Department added:', response.data);
            alert('Department added successfully!');
            onClose(); // Close the modal after successful submission
        } catch (error) {
            console.error('Error adding department:', error.response?.data || error.message);
            alert('Failed to add department. Please try again.');
        }
    };

    // Return null if modal is closed
    if (!open) return null;

    return ReactDom.createPortal(
        <>
            <div style={OVERLAY_STYLES}></div>
            <div style={MODAL_STYLES}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Department</h3>
                    <button 
                        onClick={onClose}
                        type="button"
                        className="text-gray-400 bg-transparent hover:text-gray-900 rounded-lg text-sm w-8 h-8"
                    >
                        <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
                <form className="p-4 md:p-5" onSubmit={handleSubmit}>
                    <div className="grid gap-4 mb-4 grid-cols-1">
                        <div>
                            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Department Name</label>
                            <input 
                                type="text" 
                                name="name" 
                                id="name" 
                                value={departmentName}
                                onChange={(e) => setDepartmentName(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" 
                                placeholder="Type department name" 
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="years" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Years to Finish</label>
                            <input 
                                type="number" 
                                name="years" 
                                id="years" 
                                value={yearsToFinish}
                                onChange={(e) => setYearsToFinish(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" 
                                placeholder="e.g., 4" 
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Semesters per Year</label>
                            {Array.from({ length: yearsToFinish }, (_, index) => (
                                <div key={index} className="flex items-center justify-between mb-2">
                                    <label htmlFor={`semesters-${index}`} className="text-sm font-medium text-gray-900 dark:text-white">
                                        Year {index + 1}:
                                    </label>
                                    <select 
                                        id={`semesters-${index}`} 
                                        value={semestersPerYear[index] || ''} 
                                        onChange={(e) => handleSemestersChange(index, e.target.value)} 
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-1/2 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" 
                                        required
                                    >
                                        <option value="" disabled>Select semesters</option>
                                        {[1, 2, 3, 4].map((sem) => (
                                            <option key={sem} value={sem}>{sem} Semester{sem > 1 ? 's' : ''}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                        Add New Department
                    </button>
                </form>
            </div>
        </>,

        document.getElementById('portal')
    );
}
