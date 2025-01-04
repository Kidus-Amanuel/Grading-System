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
        // Fetch years when the component mounts
        const fetchYears = async () => {
            try {
                const response = await axios.get('http://localhost:5000/department/years', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}` // Assuming token is stored in localStorage
                    }
                });
                // Assuming the response contains an array of years
                const years = response.data.map(year => year.Years);
                setMaxYear(Math.max(...years)); // Set the maximum year
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
            // Fetch semesters for the selected year
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

    const handleSemesterChange = (e) => {
        setSelectedSemester(e.target.value);
        if (selectedYear) {
            // Assuming you have a way to map semesters to courses, update courses here
            const selectedCourseData = semesters.find(semester => semester.Semestername === e.target.value);
            setCourses(selectedCourseData ? selectedCourseData.courses : []);
        }
    };

    const checkGradesSubmitted = () => {
        const allSubmitted = courses.every(course => course.gradesSubmitted);
        setAllGradesSubmitted(allSubmitted);
    };

    const handleCalculateGPA = () => {
        alert('GPA calculation initiated!');
    };

    // Generate year options from 1 to maxYear
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
                                        <tr key={course.id} className="hover:bg-gray-100">
                                            <td className="py-2 px-4 border-b">{course.name}</td>
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
                                    onClick={() => {
                                        checkGradesSubmitted();
                                        if (allGradesSubmitted) handleCalculateGPA();
                                    }}
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