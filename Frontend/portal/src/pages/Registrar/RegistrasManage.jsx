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

    // Fetch colleges when the component mounts
    useEffect(() => {
        axios.get('http://localhost:5000/api/colleges')
            .then(response => {
                console.log('Colleges response:', response.data);
                setColleges(response.data);
            })
            .catch(error => console.error('Error fetching colleges:', error));
    }, []);

    // Fetch departments when a college is selected
    useEffect(() => {
        if (selectedCollege) {
            axios.get(`http://localhost:5000/api/colleges/${selectedCollege}/departments`)
                .then(response => {
                    console.log('Departments response:', response.data);
                    const departmentData = response.data.reduce((acc, department) => {
                        acc[department.College_id] = [...(acc[department.College_id] || []), department];
                        return acc;
                    }, {});
                    setDepartments(departmentData);
                })
                .catch(error => console.error('Error fetching departments:', error));
        }
    }, [selectedCollege]);

    // Fetch students for a selected department
    useEffect(() => {
        if (selectedDepartment) {
            axios.get(`http://localhost:5000/api/students?department=${selectedDepartment}`)
                .then(response => {
                    console.log('Students response:', response.data);
                    setStudents(response.data);
                })
                .catch(error => console.error('Error fetching students:', error));
        }
    }, [selectedDepartment]);

    // Dynamically set years for the selected department
    useEffect(() => {
        if (selectedDepartment) {
            const selectedDept = departments[selectedCollege]?.find(department => department.Department_id === parseInt(selectedDepartment)); // Convert to integer
            console.log('Selected Department:', selectedDept);  // Debugging line
            if (selectedDept) {
                const years = Array.from({ length: selectedDept.Years }, (_, index) => `${index + 1} Year`);
                console.log('Years available for selected department:', years);  // Debugging line
                setDepartmentYears(years);
            } else {
                setDepartmentYears([]);
            }
        } else {
            setDepartmentYears([]); // Clear years if no department is selected
        }
    }, [selectedDepartment, selectedCollege, departments]);

    const filterStudents = () => {
        const filtered = students.filter(student =>
            student.department === selectedDepartment &&
            student.year === selectedYear
        );
        setFilteredStudents(filtered);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        const filtered = students.filter(student =>
            student.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
            student.id.toLowerCase().includes(e.target.value.toLowerCase())
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
        setStudents(students.map(student =>
            selectedStudents.includes(student.id)
                ? { ...student, currentSemester: getNextSemester(student.currentSemester) }
                : student
        ));
        setSelectedStudents([]);
    };

    const getNextSemester = (currentSemester) => {
        const [year, semester] = currentSemester.split(' ');
        const nextSemester = semester === '1st' ? '2nd' : '1st';
        const nextYear = nextSemester === '1st' ? `${parseInt(year) + 1}` : year;
        return `${nextYear} ${nextSemester}`;
    };

    return (
        <div>
            <HeadBan title="Management" />
            <div className="min-h-screen bg-gray-50 p-8">
                <header className="bg-white shadow rounded-lg mb-6">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex justify-between">
                        <h1 className="text-2xl font-semibold text-gray-800">
                            Management Dashboard
                        </h1>
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
                            setDepartmentYears([]); // Clear years when college changes
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
                        onChange={(e) => {
                            console.log('Department selected:', e.target.value); // Debugging line
                            setSelectedDepartment(e.target.value);
                        }}
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
                            <option key={index} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                <button
                    className="mb-6 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition duration-300 shadow-md"
                    onClick={filterStudents}
                    disabled={!selectedYear}
                >
                    Show Students
                </button>

                <div className="mb-6">
                    <input
                        type="text"
                        className="w-full p-3 border rounded-lg bg-white shadow-md"
                        placeholder="Search by student name or ID"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead className="bg-blue-100">
                                <tr>
                                    <th className="px-6 py-3">
                                        <input
                                            type="checkbox"
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedStudents(filteredStudents.map(s => s.id));
                                                } else {
                                                    setSelectedStudents([]);
                                                }
                                            }}
                                            checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Student ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Current Semester</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-50 divide-y divide-gray-200">
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-blue-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedStudents.includes(student.id)}
                                                onChange={() => handleCheckboxChange(student.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-blue-900 font-medium">{student.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-blue-900">{student.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-blue-900">{student.currentSemester}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-blue-900">{student.status}</td>
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
            </div>
        </div>
    );
}