import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HeadBan from '../../components/Registrar/RegistrarHeadBan';

export default function RegistrasManage() {
    const [colleges, setColleges] = useState([]);
    const [departments, setDepartments] = useState({});
    const [students, setStudents] = useState([]);
    const [selectedCollege, setSelectedCollege] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentYears, setDepartmentYears] = useState([]);
    const [nonEligibleStudents, setNonEligibleStudents] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/colleges')
            .then(response => {
                setColleges(response.data);
            })
            .catch(error => console.error('Error fetching colleges:', error));
    }, []);

    useEffect(() => {
        if (selectedCollege) {
            axios.get(`http://localhost:5000/api/collegess/${selectedCollege}/departments`)
                .then(response => {
                    const departmentData = response.data.reduce((acc, department) => {
                        acc[department.College_id] = [...(acc[department.College_id] || []), department];
                        return acc;
                    }, {});
                    setDepartments(departmentData);
                })
                .catch(error => console.error('Error fetching departments:', error));
        }
    }, [selectedCollege]);

    useEffect(() => {
        if (selectedDepartment && selectedYear) {
            axios.get(`http://localhost:5000/eligible/students`, {
                params: {
                    department_id: selectedDepartment,
                    year: selectedYear
                },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(response => {
                setStudents(response.data.students || []);
                setFilteredStudents(response.data.students || []);
            })
            .catch(error => console.error('Error fetching eligible students:', error));

            // Fetch non-eligible students
            axios.get(`http://localhost:5000/noteligible/students`, {
                params: {
                    department_id: selectedDepartment,
                    year: selectedYear
                },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(response => {
                setNonEligibleStudents(response.data.students || []);
            })
            .catch(error => console.error('Error fetching non-eligible students:', error));
        }
    }, [selectedDepartment, selectedYear]);

    useEffect(() => {
        if (selectedDepartment) {
            const selectedDept = departments[selectedCollege]?.find(department => department.Department_id === parseInt(selectedDepartment));
            if (selectedDept) {
                const years = Array.from({ length: selectedDept.Years }, (_, index) => index + 1);
                setDepartmentYears(years);
            } else {
                setDepartmentYears([]);
            }
        } else {
            setDepartmentYears([]);
        }
    }, [selectedDepartment, selectedCollege, departments]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        const filtered = students.filter(student =>
            student.FullName.toLowerCase().includes(e.target.value.toLowerCase()) ||
            student.Student_Uni_id.toLowerCase().includes(e.target.value.toLowerCase())
        );
        setFilteredStudents(filtered);
    };

    const handleCheckboxChange = (studentId) => {
        setSelectedStudents(prevSelected =>
            prevSelected.includes(studentId)
                ? prevSelected.filter(id => id !== studentId)
                : [...prevSelected, studentId]
        );
    };

    const handlePromotion = () => {
        const token = localStorage.getItem('token'); // Retrieve the token

        axios.post('http://localhost:5000/promote/students', {
            studentIds: selectedStudents
        }, {
            headers: {
                'Authorization': `Bearer ${token}` // Include the token in the headers
            }
        })
        .then(response => {
            console.log(response.data.message);
            alert(response.data.message); // Optionally show a success message
            setSelectedStudents([]); // Clear selected students
        })
        .catch(error => {
            console.error('Error promoting students:', error);
            alert('Error promoting students. Please try again.'); // Optionally show an error message
        });
    };

    return (
        <div>
            <HeadBan title="Management" />
            <div className="min-h-screen bg-gray-50 p-8">
                <header className="bg-white shadow rounded-lg mb-6">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex justify-between">
                        <h1 className="text-2xl font-semibold text-gray-800">Management Dashboard</h1>
                    </div>
                </header>

                <div className="grid grid-cols-3 gap-6 mb-6 bg-white shadow rounded-lg p-6">
                    <select
                        className="p-3 border rounded-lg bg-white shadow-md"
                        value={selectedCollege}
                        onChange={(e) => {
                            setSelectedCollege(e.target.value);
                            setSelectedDepartment('');
                            setFilteredStudents([]);
                            setDepartmentYears([]);
                        }}
                    >
                        <option value="">Select College</option>
                        {colleges.map(college => (
                            <option key={college.College_id} value={college.College_id}>{college.Collegename}</option>
                        ))}
                    </select>

                    <select
                        className="p-3 border rounded-lg bg-white shadow-md"
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        disabled={!selectedCollege}
                    >
                        <option value="">Select Department</option>
                        {selectedCollege && departments[selectedCollege]?.map(department => (
                            <option key={department.Department_id} value={department.Department_id}>{department.Departmentname}</option>
                        ))}
                    </select>

                    <select
                        className="p-3 border rounded-lg bg-white shadow-md"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        disabled={!departmentYears.length}
                    >
                        <option value="">Select Year</option>
                        {departmentYears.map((year, index) => (
                            <option key={index} value={year}>{year} Year</option>
                        ))}
                    </select>
                </div>

                <div className="mb-6">
                    <input
                        type="text"
                        className="w-full p-3 border rounded-lg bg-white shadow-md"
                        placeholder="Search by student name or ID"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>

                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Eligible Students</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead className="bg-blue-100">
                                <tr>
                                    <th className="px-6 py-3">Select</th>
                                    <th className="px-6 py-3 text-left">Student ID</th>
                                    <th className="px-6 py-3 text-left">Name</th>
                                    <th className="px-6 py-3 text-left">GPA</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-50 divide-y divide-gray-200">
                                {filteredStudents.map((student) => (
                                    <tr key={student.Student_Uni_id} className="hover:bg-blue-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedStudents.includes(student.Student_Uni_id)}
                                                onChange={() => handleCheckboxChange(student.Student_Uni_id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-blue-900 font-medium">{student.Student_Uni_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-blue-900">{student.FullName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-blue-900">{student.Semestergpa}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        className="bg-green-600 text-white px-6 py-2 rounded-md shadow-md hover:bg-green-700 transition duration-300"
                        onClick={handlePromotion}
                        disabled={selectedStudents.length === 0}
                    >
                        Register Selected Students
                    </button>
                </div>

                {nonEligibleStudents.length > 0 && (
                    <div className="mt-6 bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Non-Eligible Students</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto">
                                <thead className="bg-red-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Student ID</th>
                                        <th className="px-6 py-3 text-left">Name</th>
                                        <th className="px-6 py-3 text-left">Reason</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-50 divide-y divide-gray-200">
                                    {nonEligibleStudents.map((student) => (
                                        <tr key={student.Student_Uni_id} className="hover:bg-red-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-red-900 font-medium">{student.Student_Uni_id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-red-900">{student.FullName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-red-900">{student.Reason}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}