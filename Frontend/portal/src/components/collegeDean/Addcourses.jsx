import React, { useState, useEffect } from 'react';
import ReactDom from 'react-dom';
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
    maxWidth: '500px',
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

export default function AddCourse({ open, onClose, departmentId }) {
    const [courseName, setCourseName] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [semester, setSemester] = useState('');
    const [credits, setCredits] = useState('');
    const [hasPrerequisite, setHasPrerequisite] = useState(false);
    const [selectedPrerequisites, setSelectedPrerequisites] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [prerequisites, setPrerequisites] = useState([]);

    useEffect(() => {
        if (departmentId) {
            fetchSemesters();
            fetchCourses();
        }
    }, [departmentId]);

    const token = localStorage.getItem('token'); // assuming token is stored in localStorage


    const fetchSemesters = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/departments/${departmentId}/semesters`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Attach the token in the Authorization header

                },
            });
            setSemesters(response.data);
        } catch (error) {
            console.error('Error fetching semesters:', error);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/departments/${departmentId}/courses`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Attach the token in the Authorization header

                },
            });
            setPrerequisites(response.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const handlePrerequisiteChange = (e) => {
        const options = e.target.options;
        const values = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                values.push(options[i].value);
            }
        }
        setSelectedPrerequisites(values);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const courseData = {
            courseCode,
            courseName,
            credits,
            semesterId: semester,
            departmentId,
            prerequisites: hasPrerequisite ? selectedPrerequisites : [],
        };

        try {
            const response = await axios.post('http://localhost:5000/api/courses', courseData, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, // Attach the token in the Authorization header
                    
                },
            });
            console.log('Course added successfully:', response.data);
            onClose();
        } catch (error) {
            console.error('Error adding course:', error);
        }
    };

    if (!open) return null;

    return ReactDom.createPortal(
        <>
            <div style={OVERLAY_STYLES}></div>
            <div style={MODAL_STYLES}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Create New Course
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
                        {/* Course Name and Course Code */}
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label htmlFor="courseName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Course Name</label>
                                <input 
                                    type="text" 
                                    name="courseName" 
                                    id="courseName" 
                                    value={courseName}
                                    onChange={(e) => setCourseName(e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                                    placeholder="Type Course name" 
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="courseCode" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Course Code</label>
                                <input 
                                    type="text" 
                                    name="courseCode" 
                                    id="courseCode" 
                                    value={courseCode}
                                    onChange={(e) => setCourseCode(e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                                    placeholder="Type Course code" 
                                    required
                                />
                            </div>
                        </div>

                        {/* Semester and Credits */}
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label htmlFor="credits" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Credits</label>
                                <input 
                                    type="number" 
                                    name="credits" 
                                    id="credits" 
                                    value={credits}
                                    onChange={(e) => setCredits(e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                                    placeholder="Type Credits" 
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <label htmlFor="semester" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Semester</label>
                                <select 
                                    id="semester" 
                                    value={semester} 
                                    onChange={(e) => setSemester(e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                                    required
                                >
                                    <option value="" disabled>Select Semester</option>
                                    {semesters.map((sem) => (
                                        <option key={sem.id} value={sem.id}>{sem.year} year-{sem.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div className="flex items-center mb-4">
                            <input 
                                type="checkbox" 
                                id="hasPrerequisite" 
                                checked={hasPrerequisite} 
                                onChange={(e) => setHasPrerequisite(e.target.checked)} 
                                className="mr-2"
                            />
                            <label htmlFor="hasPrerequisite" className="text-sm font-medium text-gray-900 dark:text-white">This course has prerequisites</label>
                        </div>
                        {hasPrerequisite && (
                            <div className="flex flex-col">
                                <label htmlFor="prerequisites" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Prerequisite Courses</label>
                                <select 
                                    id="prerequisites" 
                                    multiple 
                                    value={selectedPrerequisites} 
                                    onChange={handlePrerequisiteChange}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 h-32 overflow-y-auto mr-2"
                                >
                                    {prerequisites.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                    <button 
                        type="submit" 
                        className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                        Add New Course
                    </button>
                </form>
            </div>
        </>,
        document.getElementById('portal')
    );
}