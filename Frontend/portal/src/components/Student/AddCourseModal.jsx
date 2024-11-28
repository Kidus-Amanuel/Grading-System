import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

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
  maxWidth: '400px',
};

const OVERLAY_STYLES = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  zIndex: 999,
};

export default function AddCourseModal({ open, onClose, onAddCourse }) {
  // Static list of courses
  const [courses] = useState([
    { id: 1, name: 'Introduction to Psychology', code: 'PSY101', credits: 3 },
    { id: 2, name: 'Calculus I', code: 'MATH101', credits: 4 },
    { id: 3, name: 'Modern Literature', code: 'ENG201', credits: 3 },
    { id: 4, name: 'Organic Chemistry', code: 'CHEM301', credits: 4 },
    { id: 5, name: 'Data Structures', code: 'CS202', credits: 3 },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses, setFilteredCourses] = useState(courses);
  const [selectedCourses, setSelectedCourses] = useState([]);

  // Filter courses based on the search term
  useEffect(() => {
    if (searchTerm) {
      setFilteredCourses(
        courses.filter((course) =>
          course.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredCourses(courses);
    }
  }, [searchTerm, courses]);

  // Handle adding the selected courses
  const handleAddCourses = () => {
    if (selectedCourses.length === 0) {
      alert('Please select at least one course.');
      return;
    }

    onAddCourse(selectedCourses);

    // Reset form
    setSelectedCourses([]);
    onClose();
  };

  // Handle course selection from the dropdown
  const handleSelectCourse = (course) => {
    if (selectedCourses.find((c) => c.id === course.id)) {
      // If the course is already selected, deselect it
      setSelectedCourses(selectedCourses.filter((c) => c.id !== course.id));
    } else {
      // Otherwise, add the course to the selection
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  if (!open) return null;

  return ReactDOM.createPortal(
    <>
      <div style={OVERLAY_STYLES} onClick={onClose}></div>
      <div style={MODAL_STYLES}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add Course</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Course Name</label>
          <input
            type="text"
            placeholder="Search course"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <ul className="border rounded max-h-40 overflow-y-auto">
            {filteredCourses.map((course) => (
              <li
                key={course.id}
                className={`p-2 hover:bg-gray-100 cursor-pointer ${
                  selectedCourses.find((c) => c.id === course.id)
                    ? 'bg-gray-200'
                    : ''
                }`}
                onClick={() => handleSelectCourse(course)}
              >
                {course.name}
              </li>
            ))}
          </ul>
        </div>

        {selectedCourses.length > 0 && (
          <div className="mb-4">
            <span className="text-sm text-gray-700">Selected Courses:</span>
            <ul>
              {selectedCourses.map((course) => (
                <li key={course.id} className="text-sm text-gray-700">
                  {course.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleAddCourses}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Courses
          </button>
        </div>
      </div>
    </>,
    document.getElementById('portal')
  );
}
