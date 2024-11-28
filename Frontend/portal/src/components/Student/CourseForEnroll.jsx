import React, { useState, useEffect } from 'react';
import AddCourseModal from './AddCourseModal';
import DropCourseModal from './DropCourseModal';
import axios from 'axios';

export default function CourseForEnroll() {
  const [courses, setCourses] = useState([]);
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [isDropCourseModalOpen, setIsDropCourseModalOpen] = useState(false);
  const [courseToDrop, setCourseToDrop] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/Semestercourses', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  const handleAddCourse = (newCourses) => {
    // Map the properties from the newCourses to the expected format
    const mappedCourses = newCourses.map(course => ({
      Course_id: course.id,         // Map id to Course_id
      Coursecode: course.code,      // Map code to Coursecode
      Coursename: course.name,      // Map name to Coursename
      Credit: course.credit,        // Map credit to Credit
    }));

    setCourses((prevCourses) => [...prevCourses, ...mappedCourses]); // Add mapped courses
  };

  const handleDropCourse = (course) => {
    setCourses((prevCourses) => prevCourses.filter((c) => c.Course_id !== course.Course_id));
    setIsDropCourseModalOpen(false);
  };

  const handleDropClick = (course) => {
    setCourseToDrop(course);
    setIsDropCourseModalOpen(true);
  };

  const handleEnroll = async () => {
    try {
      await axios.post('http://localhost:5000/api/enroll', { courses }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Enrolled successfully!');
    } catch (error) {
      console.error('Error enrolling in courses:', error);
      alert('Failed to enroll in courses.');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="bg-white shadow-md rounded-lg p-6 flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Courses for This Semester</h2>
        <button
          type="button"
          onClick={() => setIsAddCourseModalOpen(true)}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
        >
          Add Course
        </button>
      </div>

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
            {courses.map((course) => (
              <tr key={course.Course_id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{course.Coursename}</td>
                <td className="px-6 py-4">{course.Coursecode}</td>
                <td className="px-6 py-4">{course.Credit}</td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleDropClick(course)}
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

      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={handleEnroll}
          className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-6 py-2.5"
        >
          Enroll
        </button>
      </div>

      <AddCourseModal
        open={isAddCourseModalOpen}
        onClose={() => setIsAddCourseModalOpen(false)}
        onAddCourse={handleAddCourse}
      />

      <DropCourseModal
        open={isDropCourseModalOpen}
        onClose={() => setIsDropCourseModalOpen(false)}
        onConfirm={() => handleDropCourse(courseToDrop)}
        courseName={courseToDrop?.Coursename} // Adjusted to match the property name
      />
    </div>
  );
}