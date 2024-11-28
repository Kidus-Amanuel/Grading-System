import React, { useState } from "react";

export default function StudentGPAInfo() {
  // Dynamic student data
  const studentData = {
    fullName: "John Doe", // Replace with dynamic data
    cumulativeGPA: 3.85, // Replace with dynamic data
    semesters: [
      {
        semester: "Fall 2023",
        semesterGPA: 3.90,
        courses: [
          { name: "Mathematics", grade: "A", creditHours: 3 },
          { name: "Physics", grade: "B+", creditHours: 4 },
        ],
      },
      {
        semester: "Spring 2023",
        semesterGPA: 3.75,
        courses: [
          { name: "Chemistry", grade: "A-", creditHours: 3 },
          { name: "Computer Science", grade: "A", creditHours: 3 },
        ],
      },
    ],
  };

  const [selectedSemester, setSelectedSemester] = useState(
    studentData.semesters[0]
  );

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="bg-white shadow-md rounded-lg p-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800">GPA Overview</h1>
        <p className="text-gray-600 mt-2">{`Welcome, ${studentData.fullName}`}</p>
      </div>

      {/* GPA Summary */}
      <div className="mt-6 flex flex-col md:flex-row gap-6">
        {/* Semester GPA */}
        <div className="bg-white shadow-md rounded-lg p-6 flex-1 text-center">
          <h2 className="text-xl font-semibold text-gray-800">Semester GPA</h2>
          <p className="text-5xl font-bold text-green-600 mt-4">
            {selectedSemester.semesterGPA.toFixed(2)}
          </p>
        </div>
        {/* Cumulative GPA */}
        <div className="bg-white shadow-md rounded-lg p-6 flex-1 text-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Cumulative GPA
          </h2>
          <p className="text-5xl font-bold text-blue-600 mt-4">
            {studentData.cumulativeGPA.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Semester Selector */}
      <div className="mt-6 bg-white shadow-md rounded-lg p-6">
        <label htmlFor="semester" className="text-gray-800 font-semibold">
          Select Semester:
        </label>
        <select
          id="semester"
          value={selectedSemester.semester}
          onChange={(e) =>
            setSelectedSemester(
              studentData.semesters.find(
                (sem) => sem.semester === e.target.value
              )
            )
          }
          className="ml-4 p-2 border border-gray-300 rounded-md text-gray-800"
        >
          {studentData.semesters.map((semester, index) => (
            <option key={index} value={semester.semester}>
              {semester.semester}
            </option>
          ))}
        </select>
      </div>

      {/* Course Grades Section */}
      <div className="mt-6 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Course Grades - {selectedSemester.semester}
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
              {selectedSemester.courses.map((course, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{course.name}</td>
                  <td className="px-4 py-2 border-b">{course.grade}</td>
                  <td className="px-4 py-2 border-b">{course.creditHours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
