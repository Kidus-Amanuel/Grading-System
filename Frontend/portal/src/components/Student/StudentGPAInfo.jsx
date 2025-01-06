import React, { useState, useEffect } from "react";
import axios from "axios";

export default function StudentGPAInfo() {
  const [studentData, setStudentData] = useState(null);
  const [maxYear, setMaxYear] = useState(0);
  const [semesters, setSemesters] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [gpaData, setGpaData] = useState(null);
  const [gradesData, setGradesData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await axios.get('http://localhost:5000/department/years', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
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
    setSemesters([]);
    setGpaData(null);
    setGradesData([]);

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

    if (semesterName) {
      setLoading(true);
      try {
        const [gpaResponse, gradesResponse] = await Promise.all([
          axios.get(`http://localhost:5000/student/gpa/${semesterName}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }),
          axios.get(`http://localhost:5000/student/grades/${semesterName}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        ]);

        setGpaData(gpaResponse.data);
        setGradesData(gradesResponse.data);
      } catch (error) {
        console.error('Error fetching GPA or grades:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="bg-white shadow-md rounded-lg p-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800">GPA Overview</h1>
        <p className="text-gray-600 mt-2">Welcome</p>
      </div>

      {/* GPA Summary */}
      <div className="mt-6 flex flex-col md:flex-row gap-6">
        <div className="bg-white shadow-md rounded-lg p-6 flex-1 text-center">
          <h2 className="text-xl font-semibold text-gray-800">Semester GPA</h2>
          <p className="text-5xl font-bold text-green-600 mt-4">
            {gpaData ? parseFloat(gpaData.Semestergpa).toFixed(2) : "N/A"}
          </p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6 flex-1 text-center">
          <h2 className="text-xl font-semibold text-gray-800">Cumulative GPA</h2>
          <p className="text-5xl font-bold text-blue-600 mt-4">
            {gpaData ? parseFloat(gpaData.Cumulativegpa).toFixed(2) : "N/A"}
          </p>
        </div>
      </div>

      {/* Year Selector */}
      <div className="flex gap-4 mb-6 mt-3">
        <div className="flex-1">
          <label className="block mb-2 font-medium">Select Year</label>
          <select
            className="border border-gray-300 rounded-lg p-2 w-full"
            value={selectedYear}
            onChange={handleYearChange}
          >
            <option value="">--Select Year--</option>
            {Array.from({ length: maxYear }, (_, index) => index + 1).map(year => (
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

      {/* Loading Indicator */}
      {loading && <p className="mt-4 text-center text-gray-600">Loading...</p>}

      {/* Course Grades Section */}
      <div className="mt-6 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Course Grades - {selectedSemester}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 border-collapse">
            <thead className="bg-gray-100 text-gray-800">
              <tr>
                <th className="px-4 py-3 border-b">Course</th>
                <th className="px-4 py-3 border-b">Grade</th>
                <th className="px-4 py-3 border-b">Credit Hours</th>
              </tr>
            </thead>
            <tbody>
              {gradesData.map((course, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{course.Coursename}</td>
                  <td className="px-4 py-2 border-b">{course.Grade}</td>
                  <td className="px-4 py-2 border-b">{course.Credit_earned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
