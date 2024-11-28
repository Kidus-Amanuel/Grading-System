import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import AddCourseModal from './AddCourseModal';  // Assuming this is the modal to add courses
import DropCourseModal from './DropCourseModal'; // The new modal you want to use for dropping courses

export default function CourseForEnroll() {
  const [courses, setCourses] = useState([
    { name: 'Introduction to Psychology', code: 'PSY101', credits: 3 },
    { name: 'Calculus I', code: 'MATH101', credits: 4 },
    { name: 'Modern Literature', code: 'ENG201', credits: 3 },
    { name: 'Organic Chemistry', code: 'CHEM301', credits: 4 },
    { name: 'Data Structures', code: 'CS202', credits: 3 },
  ]);

  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [isDropCourseModalOpen, setIsDropCourseModalOpen] = useState(false);
  const [courseToDrop, setCourseToDrop] = useState(null);

  const handleAddCourse = (newCourse) => {
    setCourses((prevCourses) => [...prevCourses, newCourse]);
  };

  const handleDropCourse = (course) => {
    setCourses((prevCourses) => prevCourses.filter((c) => c.name !== course.name));
    setIsDropCourseModalOpen(false);  // Close the drop modal after confirmation
  };

  const handleDropClick = (course) => {
    setCourseToDrop(course);
    setIsDropCourseModalOpen(true);  // Open the drop modal when a course is clicked
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Header Section */}
      <div className="bg-white shadow-md rounded-lg p-6 flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Courses for This Semester</h2>
        <button
          type="button"
          onClick={() => setIsAddCourseModalOpen(true)}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
        >
          Add New Course
        </button>
      </div>

      {/* Table Section */}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-white">
        <table className="w-full text-sm text-left text-gray-500 border-collapse">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th scope="col" className="px-6 py-3">Course Name</th>
              <th scope="col" className="px-6 py-3">Course Code</th>
              <th scope="col" className="px-6 py-3">Credits</th>
              <th scope="col" className="px-6 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course, index) => (
              <tr key={index} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{course.name}</td>
                <td className="px-6 py-4">{course.code}</td>
                <td className="px-6 py-4">{course.credits}</td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleDropClick(course)} // Open drop modal when clicked
                    className="text-red-600 hover:underline hover:text-red-800"
                  >
                    Drop
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Enroll Button */}
      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-6 py-2.5"
        >
          Enroll
        </button>
      </div>

      {/* Add Course Modal */}
      <AddCourseModal
        open={isAddCourseModalOpen}
        onClose={() => setIsAddCourseModalOpen(false)}
        onAddCourse={handleAddCourse}
      />

      {/* Drop Course Modal */}
      <DropCourseModal
        open={isDropCourseModalOpen}
        onClose={() => setIsDropCourseModalOpen(false)}
        onConfirm={() => handleDropCourse(courseToDrop)}
        courseName={courseToDrop?.name}
      />
    </div>
  );
}
