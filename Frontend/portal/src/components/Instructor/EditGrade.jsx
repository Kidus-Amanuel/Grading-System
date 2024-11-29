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
    maxWidth: '500px', // Reduced width for smaller modal
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

export default function EditGrade({ open, onClose, student, courseId }) {
    const [assessmentComponents, setAssessmentComponents] = useState([]);
    const [scores, setScores] = useState([]);

    useEffect(() => {
        if (courseId) {
            axios.get(`http://localhost:5000/api/assessmentComponents/${courseId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
            .then(response => {
                setAssessmentComponents(response.data);
                const initialScores = response.data.map(component => ({
                    Component_id: component.Component_id,
                    Score: '',
                }));
                setScores(initialScores);
            })
            .catch(error => {
                console.error('Error fetching assessment components:', error);
            });
        }
    }, [courseId]);

    const handleScoreChange = (componentId, value) => {
        setScores(prevScores =>
            prevScores.map(score =>
                score.Component_id === componentId
                    ? { ...score, Score: value }
                    : score
            )
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (scores.some(score => !score.Score)) {
            alert('Please enter scores for all components.');
            return;
        }

        const token = localStorage.getItem('token');

        // Construct the data in the required format
        const dataToSend = scores.map(score => ({
            Student_Uni_id: student?.University_id,  // Student ID from the prop
            Course_id: courseId,                      // Course ID from the prop
            Component_id: score.Component_id,         // Component ID from the state
            Score: parseFloat(score.Score),           // Score from the state
        }));

        axios.put('http://localhost:5000/api/studentAssessmentScores', dataToSend, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            console.log(response.data);
            alert('Assessment updated successfully!');
            onClose();
        })
        .catch(error => {
            console.error('Error updating scores:', error);
            alert('Failed to update scores.');
        });
    };

    if (!open) return null;

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
                    <div className="mb-4 flex justify-between space-x-4">
                        <div className="w-1/2">
                            <label className="block text-gray-700 text-sm">Student ID</label>
                            <input 
                                type="text" 
                                value={student?.University_id} 
                                readOnly 
                                className="border rounded-lg w-full px-2 py-1 mt-1 text-sm"
                            />
                        </div>
                        <div className="w-1/2">
                            <label className="block text-gray-700 text-sm">Student Name</label>
                            <input 
                                type="text" 
                                value={student?.FullName} 
                                readOnly 
                                className="border rounded-lg w-full px-2 py-1 mt-1 text-sm"
                            />
                        </div>
                    </div>

                    {assessmentComponents.length > 0 ? (
                        assessmentComponents.map(component => (
                            <div className="mb-4" key={component.Component_id}>
                                <label className="block text-gray-700 text-sm">{component.Component_name}</label>
                                <input 
                                    type="number"
                                    value={scores.find(score => score.Component_id === component.Component_id)?.Score || ''}
                                    onChange={(e) => handleScoreChange(component.Component_id, e.target.value)}
                                    className="border rounded-lg w-full px-2 py-1 mt-1 text-sm"
                                    required
                                />
                            </div>
                        ))
                    ) : (
                        <p>No assessment components available for this course.</p>
                    )}

                    <button 
                        type="submit" 
                        className="w-full bg-blue-600 text-white rounded-lg py-2 mt-2 hover:bg-blue-700 text-sm"
                    >
                        Save
                    </button>
                </form>
            </div>
        </>,

        document.getElementById('portal')
    );
}
