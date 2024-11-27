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

export default function EditCourse({ open, onClose, course, departmentId }) {
    const [courseName, setCourseName] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [semester, setSemester] = useState('');
    const [credits, setCredits] = useState('');
    const [hasPrerequisite, setHasPrerequisite] = useState(false);
    const [selectedPrerequisites, setSelectedPrerequisites] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [prerequisites, setPrerequisites] = useState([]);

    useEffect(() => {
        if (course) {
            setCourseName(course.name);
            setCourseCode(course.code);
            setSemester(course.semesterId);
            setCredits(course.credits);
            setSelectedPrerequisites(course.prerequisites || []);
            setHasPrerequisite(course.prerequisites && course.prerequisites.length > 0);
            fetchSemesters(departmentId);
            fetchCourses(departmentId);
        }
    }, [course, departmentId]);

    const fetchSemesters = async (departmentId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/departments/${departmentId}/semesters`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setSemesters(response.data);
        } catch (error) {
            console.error('Error fetching semesters:', error);
        }
    };

    const fetchCourses = async (departmentId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/departments/${departmentId}/courses`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
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

    const removePrerequisite = (courseId) => {
        setSelectedPrerequisites(selectedPrerequisites.filter(item => item !== courseId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const courseData = {
            courseCode: courseCode,
            courseName: courseName,
            credits: parseInt(credits, 10),
            semesterId: semester,
            departmentId: departmentId,
            prerequisites: hasPrerequisite ? selectedPrerequisites.map(id => parseInt(id, 10)) : [],
        };
        console.log("Data being sent to the API:", courseData);

        try {
            const response = await axios.put(`http://localhost:5000/api/course/${course.id}`, courseData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.status === 200) {
                alert('Course updated successfully!');
                onClose(); // Close the modal after submission
            } else {
                alert('Failed to update course.');
            }
        } catch (error) {
            console.error('Error updating course:', error);
            alert('Error updating course. Please try again.');
        }
    };

    if (!open) return null;

    return ReactDOM.createPortal(
        <>
            <div style={OVERLAY_STYLES}></div>
            <div style={MODAL_STYLES}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Course</h3>
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
                                        <option key={sem.id} value={sem.id}>{sem.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div className="flex items-center mb-4">
                            <input 
                                type="checkbox" 
                                id="hasPrerequisite" 
                                checked={hasPrerequisite} 
                                onChange={(e) => {
                                    setHasPrerequisite(e.target.checked);
                                    if (!e.target.checked) {
                                        setSelectedPrerequisites([]); // Clear selected if unchecked
                                    }
                                }} 
                                className="mr-2"
                            />
                            <label htmlFor="hasPrerequisite" className="text-sm font-medium text-gray-900 dark:text-white">This course has prerequisites</label>
                        </div>
                        
                        {hasPrerequisite && (
                            <div className="flex flex-col">
                                <label htmlFor="prerequisites" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Prerequisite Courses</label>
                                <div className="flex">
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
                                    <div className="flex flex-col justify-start ml-2">
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Selected:</h4>
                                        <div className="flex flex-wrap">
                                            {selectedPrerequisites.map((courseId) => {
                                                const selectedCourse = prerequisites.find(course => course.id === courseId);
                                                return (
                                                    <div key={courseId} className="flex items-center bg-gray-200 rounded px-2 py-1 mr-2 mb-2">
                                                        {selectedCourse ? selectedCourse.name : courseId} {/* Show course name */}
                                                        <button 
                                                            type="button" 
                                                            onClick={() => removePrerequisite(courseId)} 
                                                            className="ml-2 text-red-500 hover:text-red-700"
                                                        >
                                                            &times;
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <button 
                        type="submit" 
                        className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                        <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path>
                        </svg>
                        Edit Course
                    </button>
                </form>
            </div>
        </>,
        document.getElementById('portal')
    );
}