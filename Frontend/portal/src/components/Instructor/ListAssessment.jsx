import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ListAssessment({ courseId }) {
    const [students, setStudents] = useState([]);
    const [components, setComponents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [assessments, setAssessments] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                // Fetch enrolled students
                const studentsResponse = await axios.get(`http://localhost:5000/api/enrolledStudents/${courseId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setStudents(studentsResponse.data);

                // Fetch assessment components
                const componentsResponse = await axios.get(`http://localhost:5000/api/assessmentComponents/${courseId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setComponents(componentsResponse.data);

                // Initialize assessments state
                const initialAssessments = studentsResponse.data.reduce((acc, student) => {
                    acc[student.University_id] = componentsResponse.data.reduce((compAcc, component) => {
                        compAcc[component.Component_name] = ''; // Initialize each component score
                        return compAcc;
                    }, {});
                    return acc;
                }, {});
                setAssessments(initialAssessments);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [courseId]);

    const handleInputChange = (studentId, componentName, value) => {
        setAssessments({
            ...assessments,
            [studentId]: {
                ...assessments[studentId],
                [componentName]: value,
            },
        });
    };

    const handleSubmit = async () => {
        const scores = [];

        // Prepare the scores array from assessments state
        for (const studentId in assessments) {
            const studentScores = components.map((component) => ({
                Student_Uni_id: studentId,
                Course_id: courseId,
                Component_id: component.Component_id,
                Score: parseFloat(assessments[studentId][component.Component_name]) || 0, // Default to 0 if empty
            }));
            scores.push(...studentScores);
        }

        try {
            const response = await axios.post('http://localhost:5000/api/studentAssessmentScores', scores, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            console.log(response.data);
            alert(response.data.message); // Notify user of success
        } catch (error) {
            console.error('Error submitting scores:', error);
            alert('Failed to submit scores. Please try again later.');
        }
    };

    if (loading) return <div className="text-center text-blue-500">Loading data...</div>;
    if (error) return <div className="text-center text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-3xl font-semibold mb-6 text-center">Assessment List</h2>
            <div className="bg-white shadow-lg rounded-lg p-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-700">
                        <thead className="bg-gray-200 text-xs text-gray-600 uppercase">
                            <tr>
                                <th className="px-4 py-2">Student ID</th>
                                <th className="px-4 py-2">Student Name</th>
                                {components.map(component => (
                                    <th key={component.Component_id} className="px-4 py-2">{component.Component_name} (Max: {component.Weights}%)</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student.University_id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{student.University_id}</td>
                                    <td className="px-4 py-3">{student.FullName}</td>
                                    {components.map(component => (
                                        <td key={component.Component_id} className="px-4 py-3">
                                            <input
                                                type="number"
                                                value={assessments[student.University_id]?.[component.Component_name] || ''}
                                                onChange={(e) => handleInputChange(student.University_id, component.Component_name, e.target.value)}
                                                className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Score"
                                                max={component.Weights} // Limit the score input to the component weight
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-end mt-4">
                    <button 
                        type="button" 
                        onClick={handleSubmit} // Attach the submit function
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
                    >
                        ADD
                    </button>
                </div>
            </div>
        </div>
    );
}