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
    zIndex: 1000,
};

export default function AssigningInstructor({ open, onClose, course }) {
    const [componentName, setComponentName] = useState('');
    const [weight, setWeight] = useState('');
    const [assessments, setAssessments] = useState([]); // Store multiple assessments
    const [selectedInstructor, setSelectedInstructor] = useState('');

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

        setAssessments([...assessments, newAssessment]); // Add new assessment to the list
        setComponentName(''); // Reset input field
        setWeight(''); // Reset input field
    };

    const handleSubmit = () => {
        if (!selectedInstructor) {
            alert('Please select an instructor.');
            return;
        }

        // Prepare data for submission
        const submissionData = {
            course: {
                name: course.courseName,
                code: course.courseCode,
            },
            instructor: selectedInstructor,
            assessments: assessments,
        };

        console.log("Submitting data:", submissionData);
        
        // Here you would typically send `submissionData` to your server
        // e.g., using fetch or axios to post data

        onClose(); // Close the modal after submission
    };

    return ReactDOM.createPortal(
        <>
            <div style={OVERLAY_STYLES}></div>
            <div style={MODAL_STYLES}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Assign Instructor</h3>
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
                        <p className="mb-2"><strong>Course Name:</strong> {course.courseName}</p>
                        <p className="mb-4"><strong>Course Code:</strong> {course.courseCode}</p>
                        
                        <label htmlFor="instructor-select" className="block mb-2 text-sm font-medium text-gray-700">Select Instructor</label>
                        <select 
                            id="instructor-select" 
                            className="block w-full p-2 border border-gray-300 rounded"
                            value={selectedInstructor}
                            onChange={(e) => setSelectedInstructor(e.target.value)}
                        >
                            <option value="">Select an instructor</option>
                            <option value="instructor1">Instructor 1</option>
                            <option value="instructor2">Instructor 2</option>
                            <option value="instructor3">Instructor 3</option>
                        </select>

                        
                        {/* Submit All Button */}
                        <div className="mt-4">
                            <button 
                                type="button" 
                                className="w-full px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
                                onClick={handleSubmit}
                            >
                                Assign
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>,
        document.getElementById('portal')
    );
}