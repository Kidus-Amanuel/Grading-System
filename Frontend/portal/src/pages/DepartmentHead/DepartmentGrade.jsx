import HeadBan from '../../components/Departmenthead/DepartmentHeadBan';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function DepartmentGrade() {
    const [maxYear, setMaxYear] = useState(0);
    const [semesters, setSemesters] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [courses, setCourses] = useState([]);
    const [allGradesSubmitted, setAllGradesSubmitted] = useState(false);

    useEffect(() => {
        const fetchYears = async () => {
            try {
                const response = await axios.get('http://localhost:5000/department/years', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const years = response.data.map(year => year.Years);
                setMaxYear(Math.max(...years));
            } catch (error) {
                console.error('Error fetching years:', error);
            }
        };

        fetchYears();
    }, []);

    const handleYearChange = async (e) => {
        const year = e.target.value;
        setSelectedYear(year);
        setSelectedSemester('');
        setCourses([]);

        if (year) {
            try {
                const response = await axios.get(`http://localhost:5000/department/years/${year}/semesters`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setSemesters(response.data);
            } catch (error) {
                console.error('Error fetching semesters:', error);
            }
        }
    };

    const handleSemesterChange = async (e) => {
        const semesterName = e.target.value;
        setSelectedSemester(semesterName);

        if (selectedYear) {
            const selectedSemesterData = semesters.find(semester => semester.Semestername === semesterName);
            if (selectedSemesterData) {
                await fetchCourses(selectedSemesterData.Semester_id);
            }
        }
    };

    const fetchCourses = async (semesterId) => {
        try {
            const response = await axios.get(`http://localhost:5000/department/${semesterId}/courses`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            const courses = response.data.courses || response.data;
            setCourses(courses);

            // Check grades submission for each course
            const gradesSubmissionResults = await Promise.all(
                courses.map(course => checkGradesSubmission(course.Course_id))
            );

            // Update courses with grades submission status
            const updatedCourses = courses.map((course, index) => ({
                ...course,
                gradesSubmitted: gradesSubmissionResults[index]
            }));

            setCourses(updatedCourses);

            // Check if all grades are submitted
            const allSubmitted = updatedCourses.every(course => course.gradesSubmitted);
            setAllGradesSubmitted(allSubmitted);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const checkGradesSubmission = async (courseId) => {
        try {
            const response = await axios.get(`http://localhost:5000/check-grade-submission/course/${courseId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            return response.data.hasGradesSubmitted;
        } catch (error) {
            console.error('Error checking grade submission status:', error);
            return false;
        }
    };

    const handleCalculateGPA = async () => {
        if (!selectedSemester || !selectedYear) {
            alert('Please select a year and semester before calculating GPA.');
            return;
        }

        try {
            const selectedSemesterData = semesters.find(semester => semester.Semestername === selectedSemester);
            
            if (selectedSemesterData) {
                const semesterId = selectedSemesterData.Semester_id;

                const response = await axios.post('http://localhost:5000/calculate-department-gpa', {
                    semesterId: semesterId
                }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                console.log('GPA Calculation Response:', response.data);
                alert('GPA calculations completed successfully!');
            }
        } catch (error) {
            console.error('Error calculating GPA:', error);
            alert('Failed to calculate GPA. Please try again.');
        }
    };

    const yearOptions = Array.from({ length: maxYear }, (_, index) => index + 1);

    return (
        <div>
            <HeadBan title="Grade" />
            <div className="bg-gray-50 min-h-screen p-6">
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-3xl font-bold mb-6 text-center">GPA</h1>

                    <div className="flex gap-4 mb-6">
                        <div className="flex-1">
                            <label className="block mb-2 font-medium">Select Year</label>
                            <select
                                className="border border-gray-300 rounded-lg p-2 w-full"
                                value={selectedYear}
                                onChange={handleYearChange}
                            >
                                <option value="">--Select Year--</option>
                                {yearOptions.map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block mb-2 font-medium">Select Semester</label>
                            <select
                                className="border border-gray-300 rounded-lg p-2 w-full"
                                value={selectedSemester}
                                onChange={handleSemesterChange}
                                disabled={!selectedYear || semesters.length === 0}
                            >
                                <option value="">--Select Semester--</option>
                                {semesters.map((semester, index) => (
                                    <option key={index} value={semester.Semestername}>{semester.Semestername}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {courses.length > 0 && (
                        <>
                            <table className="min-w-full bg-white border border-gray-300 mb-6">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="py-3 px-4 border-b text-left font-medium">Course Name</th>
                                        <th className="py-3 px-4 border-b text-left font-medium">Grades Submitted</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.map(course => (
                                        <tr key={course.Course_id} className="hover:bg-gray-100">
                                            <td className="py-2 px-4 border-b">{course.Coursename}</td>
                                            <td className="py-2 px-4 border-b">
                                                {course.gradesSubmitted ? (
                                                    <span className="text-green-600 font-semibold">Yes</span>
                                                ) : (
                                                    <span className="text-red-600 font-semibold">No</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex justify-center">
                                <button
                                    onClick={handleCalculateGPA}
                                    className={`px-6 py-2 text-white font-semibold rounded-lg transition duration-300 ${
                                        allGradesSubmitted
                                            ? 'bg-blue-500 hover:bg-blue-600'
                                            : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                                    disabled={!allGradesSubmitted}
                                >
                                    Calculate GPA
                                </button>
                            </div>

                            {allGradesSubmitted && (
                                <div className="mt-4 text-green-600 text-center font-medium">
                                    <strong>All grades are submitted!</strong>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
