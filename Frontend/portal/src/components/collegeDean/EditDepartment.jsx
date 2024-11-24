import ReactDom from 'react-dom';
import { useState } from 'react';

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
    width: '90%', // Responsive width
    maxWidth: '400px', // Max width for larger screens
    height: 'auto', // Adjust height to fit content
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

export default function EditDepartment({ open, onClose, department, onSubmit }) {
    const [departmentName, setDepartmentName] = useState(department?.name || '');
    const [yearsToFinish, setYearsToFinish] = useState(department?.year || '');
    const [semestersPerYear, setSemestersPerYear] = useState([]);

    const handleSemestersChange = (index, value) => {
        const updatedSemesters = [...semestersPerYear];
        updatedSemesters[index] = value;
        setSemestersPerYear(updatedSemesters);
    };

    const handleYearsChange = (e) => {
        const newYears = e.target.value;
        setYearsToFinish(newYears);
        // Ensure semestersPerYear is updated to match the new number of years
        const updatedSemesters = Array.from({ length: newYears }, (_, index) => semestersPerYear[index] || '');
        setSemestersPerYear(updatedSemesters);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            name: departmentName,
            year: yearsToFinish,
            semesters: semestersPerYear,
        });
        onClose(); // Close the modal after submission
    };

    if (!open) return null;

    return ReactDom.createPortal(
        <>
            <div style={OVERLAY_STYLES}></div>
            <div style={MODAL_STYLES}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Edit Department
                    </h3>
                    <button 
                        onClick={onClose}
                        type="button"
                        className="text-gray-400 bg-transparent hover:text-gray-900 rounded-lg text-sm w-8 h-8"
                    >
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
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
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
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
                                onChange={handleYearsChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                                placeholder="e.g., 4" 
                                min="1"
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
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-1/2 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
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
                        className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                        Save Changes
                    </button>
                </form>
            </div>
        </>,
        document.getElementById('portal')
    );
}