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

export default function EditGrade({ open, onClose, student }) {
    const [assignmentScore, setAssignmentScore] = useState(student ? student.assignmentScore || '' : '');
    const [midtermScore, setMidtermScore] = useState(student ? student.midtermScore || '' : '');
    const [finalScore, setFinalScore] = useState(student ? student.finalScore || '' : '');

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        // Implement logic to save the updated scores
        console.log(`Updated scores for ${student.id}: Assignment: ${assignmentScore}, Midterm: ${midtermScore}, Final: ${finalScore}`);
        
        // Alert the user that the assessment has been updated
        alert(`Assessment updated for ${student.name} (ID: ${student.id})`);

        onClose(); // Close the modal after submission
    };

    return ReactDOM.createPortal(
        <>
            <div style={OVERLAY_STYLES}></div>
            <div style={MODAL_STYLES}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Editing Assessment</h3>
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
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Student ID</label>
                        <input 
                            type="text" 
                            value={student?.id} 
                            readOnly 
                            className="border rounded-lg w-full px-3 py-2 mt-1"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Student Name</label>
                        <input 
                            type="text" 
                            value={student?.name} 
                            readOnly 
                            className="border rounded-lg w-full px-3 py-2 mt-1"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Assignment Score</label>
                        <input 
                            type="number" 
                            value={assignmentScore} 
                            onChange={(e) => setAssignmentScore(e.target.value)} 
                            className="border rounded-lg w-full px-3 py-2 mt-1"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Midterm Score</label>
                        <input 
                            type="number" 
                            value={midtermScore} 
                            onChange={(e) => setMidtermScore(e.target.value)} 
                            className="border rounded-lg w-full px-3 py-2 mt-1"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Final Score</label>
                        <input 
                            type="number" 
                            value={finalScore} 
                            onChange={(e) => setFinalScore(e.target.value)} 
                            className="border rounded-lg w-full px-3 py-2 mt-1"
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 text-white rounded-lg py-2 mt-2 hover:bg-blue-700"
                    >
                        Save
                    </button>
                </form>
            </div>
        </>,
        document.getElementById('portal')
    );
}