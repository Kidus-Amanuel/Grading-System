import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

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
    const [selectedInstructor, setSelectedInstructor] = useState('');
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            console.log('Modal opened with course:', course); // Debugging log
            setLoading(true);
            const fetchInstructors = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await axios.get('http://localhost:5000/api/instructors', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    setInstructors(response.data);
                } catch (error) {
                    console.error('Error fetching instructors:', error);
                    alert('Failed to fetch instructors: ' + (error.response?.data?.message || 'Internal server error'));
                } finally {
                    setLoading(false);
                }
            };
            fetchInstructors();
        } else {
            setSelectedInstructor('');
            setInstructors([]);
        }
    }, [open, course]);

    if (!open) return null;

    const handleSubmit = async () => {
        if (!selectedInstructor) {
            alert('Please select an instructor.');
            return;
        }
    
        const submissionData = {
            courseId: course?.id || '', // Ensure course ID is included
            instructorUniId: selectedInstructor,
        };
    
        console.log('Submitting data:', submissionData); // Debugging log
    
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:5000/api/assign-course-instructor',
                submissionData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            alert(response.data.message);
            onClose();
        } catch (error) {
            console.error('Error submitting data:', error);
            alert('Failed to assign instructor: ' + (error.response?.data?.message || 'Internal server error'));
        }
    };
    
    if (loading) {
        return (
            <div style={OVERLAY_STYLES}>
                <div style={MODAL_STYLES}>
                    <p>Loading instructors...</p>
                </div>
            </div>
        );
    }

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
                {course ? (
                    <div>
                        <p className="mb-2"><strong>Course Name:</strong> {course.name || 'N/A'}</p>
                        <p className="mb-4"><strong>Course Code:</strong> {course.code || 'N/A'}</p>

                        <label htmlFor="instructor-select" className="block mb-2 text-sm font-medium text-gray-700">Select Instructor</label>
                        <select
                            id="instructor-select"
                            className="block w-full p-2 border border-gray-300 rounded"
                            value={selectedInstructor}
                            onChange={(e) => setSelectedInstructor(e.target.value)}
                        >
                            <option value="">Select an instructor</option>
                            {instructors.map(instructor => (
                                <option key={instructor.University_id} value={instructor.University_id}>
                                    {instructor.FullName}
                                </option>
                            ))}
                        </select>

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
                ) : (
                    <p className="mb-4 text-red-500">Course details not provided.</p>
                )}
            </div>
        </>,
        document.getElementById('portal')
    );
}
