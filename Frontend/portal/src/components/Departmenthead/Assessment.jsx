import React, { useState } from 'react';
import ReactDOM from 'react-dom';

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
};

const OVERLAY_STYLES = {
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 999,
};

export default function Assessment({ open, onClose, course }) {
    const [componentName, setComponentName] = useState('');
    const [weight, setWeight] = useState('');
    const [assessments, setAssessments] = useState([]);

    if (!open) return null;

    const handleAddAssessment = () => {
        if (!componentName || !weight) {
            alert('Please fill in all fields.');
            return;
        }

        const newAssessment = {
            componentName,
            weight: parseFloat(weight),
        };

        setAssessments([...assessments, newAssessment]);
        setComponentName('');
        setWeight('');
    };

    const handleSubmit = () => {
        // Handle submission logic here
        console.log('Submitting:', assessments);
        onClose(); // Close the modal after submission
    };

    return ReactDOM.createPortal(
        <>
            <div style={OVERLAY_STYLES}></div>
            <div style={MODAL_STYLES}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Add Assessment for {course?.courseName}</h3>
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
                {course && (
                    <div>
                        <h4 className="mt-4 mb-2 font-semibold">Add Assessment Component</h4>
                        <label htmlFor="component-name" className="block mb-1 text-sm font-medium text-gray-700">Component Name</label>
                        <input 
                            type="text" 
                            id="component-name" 
                            value={componentName}
                            onChange={(e) => setComponentName(e.target.value)}
                            className="block w-full p-2 border border-gray-300 rounded mb-2"
                            placeholder="e.g., Assignment, Midterm"
                        />

                        <label htmlFor="weight" className="block mb-1 text-sm font-medium text-gray-700">Weight (%)</label>
                        <input 
                            type="number" 
                            id="weight" 
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="block w-full p-2 border border-gray-300 rounded mb-2"
                            placeholder="e.g., 20, 30"
                            min="0"
                            max="100"
                        />

                        <div className="mt-4">
                            <button 
                                type="button" 
                                className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                                onClick={handleAddAssessment}
                            >
                                Add Assessment
                            </button>
                        </div>

                        <h4 className="mt-6 mb-2 font-semibold">Added Assessments</h4>
                        <ul className="list-disc pl-5">
                            {assessments.map((assessment, index) => (
                                <li key={index} className="text-gray-700">
                                    {assessment.componentName} - {assessment.weight}%
                                </li>
                            ))}
                        </ul>

                        <div className="mt-4">
                            <button 
                                type="button" 
                                className="w-full px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
                                onClick={handleSubmit}
                            >
                                Submit All
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>,
        document.getElementById('portal')
    );
}