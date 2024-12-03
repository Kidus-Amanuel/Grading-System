import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "axios";

const MODAL_STYLES = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "#fff",
  padding: "2rem",
  borderRadius: "10px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
  zIndex: 1000,
  width: "90%",
  maxWidth: "500px",
  maxHeight: "90%",
  overflowY: "auto",
};

const OVERLAY_STYLES = {
  position: "fixed",
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  zIndex: 1000,
};

export default function SignUpModal({ open, onClose }) {
  const [formData, setFormData] = useState({
    universityId: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    roleId: "",
    collegeId: "",
    departmentId: "",
    batch: "",
    semester: "",
  });

  const [roles, setRoles] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [error, setError] = useState(null);

  // Fetch roles, colleges, and batches on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [rolesRes, collegesRes, batchesRes] = await Promise.all([
          axios.get("http://localhost:5000/api/roles"),
          axios.get("http://localhost:5000/api/colleges"),
          axios.get("http://localhost:5000/api/batches"),
        ]);
        setRoles(rolesRes.data);
        setColleges(collegesRes.data);
        setBatches(batchesRes.data);
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError("Failed to load initial data.");
      }
    };
    fetchInitialData();
  }, []);

  // Fetch departments dynamically based on college selection
  const fetchDepartments = async (collegeId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/collegess/${collegeId}/departments`
      );
      setDepartments(response.data);
    } catch (err) {
      console.error("Error fetching departments:", err);
      setError("Failed to load departments.");
    }
  };

  // Fetch semesters dynamically based on department selection
  const fetchSemesters = async (departmentId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/departmentss/${departmentId}/semesters`
      );
      setSemesters(response.data);
    } catch (err) {
      console.error("Error fetching semesters:", err);
      setError("Failed to load semesters.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));

    if (name === "collegeId") fetchDepartments(value);
    if (name === "departmentId") fetchSemesters(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Create the payload based on the form data
    const payload = {
      universityId: formData.universityId,
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      roleId: formData.roleId,
      collegeId: formData.collegeId || null,
      departmentId: formData.departmentId || null,
      // Include batch and semester only if the role is a student
      ...(formData.roleId === "4" && {
        batch: formData.batch, // Now this will be the batch ID
        semester: formData.semester,
      }),
    };

    console.log("Data sent in POST request:", payload);

    try {
      await axios.post("http://localhost:5000/signup", payload);
      alert("User registered successfully!");
      onClose();
    } catch (err) {
      console.error("Error during sign-up:", err);
      alert("An error occurred while registering the user.");
    }
  };

  if (!open) return null;

  return ReactDOM.createPortal(
    <>
      <div style={OVERLAY_STYLES} onClick={onClose}></div>
      <div style={MODAL_STYLES}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Sign Up</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSubmit}>
          {/* Input fields */}
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium">University ID</label>
                <input
                  type="text"
                  name="universityId"
                  value={formData.universityId}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Role</label>
                <select
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role.Role_id} value={role.Role_id}>
                      {role.Role_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium">College</label>
                <select
                  name="collegeId"
                  value={formData.collegeId}
                  onChange={handleChange}
                  required={formData.roleId && ["1", "2", "3", "4"].includes(formData.roleId)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
                >
                  <option value="">Select College</option>
                  {colleges.map((college) => (
                    <option key={college.College_id} value={college.College_id}>
                      {college.Collegename}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">Department</label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  required={formData.roleId && ["2", "3", "4"].includes(formData.roleId)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
                >
                  <option value="">Select Department</option>
                  {departments.map((department) => (
                    <option key={department.Department_id} value={department.Department_id}>
                      {department.Departmentname}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Row 4 (Password and Batch/Semester based on role) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formData.roleId === "4" ? (
                <>
                  <div>
                    <label className="block mb-1 text-sm font-medium">Batch</label>
                    <select
                      name="batch"
                      value={formData.batch}
                      onChange={handleChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
                    >
                      <option value="">Select Batch</option>
                      {batches.map((batch) => (
                        <option key={batch.Batch_id} value={batch.Batch_id}>
                          {batch.Batchyear} {/* Display the year but use the ID as value */}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium">Semester</label>
                    <select
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
                    >
                      <option value="">Select Semester</option>
                      {semesters.map((semester) => (
                        <option key={semester.id} value={semester.id}>
                          {semester.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : null}
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 text-sm font-medium">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-400"
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg mt-4 w-full hover:bg-blue-600 transition duration-200"
          >
            Sign Up
          </button>
        </form>
      </div>
    </>,
    document.getElementById("portal")
  );
}