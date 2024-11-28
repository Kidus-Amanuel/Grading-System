import HeadBan from "../../components/Student/StudentHeadban";
import { useNavigate } from "react-router-dom";

export default function StudentCourses() {
  const navigate = useNavigate();

  const userInfo = {
    fullName: "John Doe", // Replace with dynamic data
    Semester: "1st year 2nd semester", // Replace with dynamic data
    Batch: "2019", // Replace with dynamic data
    Gpa: "3.5", // Replace with dynamic data
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      {/* Header */}
      <div className="bg-white shadow-md">
        <HeadBan title="Welcome" />
      </div>

      {/* Personal Information Section */}
      <div className="mt-6 px-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Personal Information</h1>
        <div className="bg-white shadow-md p-4 rounded-lg">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Full Name */}
            <div>
              <label className="text-sm font-medium text-gray-600">Full Name</label>
              <p className="w-full text-md py-2 px-4 bg-gray-100 border border-gray-300 rounded-md">
                {userInfo.fullName}
              </p>
            </div>
            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-600">Batch</label>
              <p className="w-full text-md py-2 px-4 bg-gray-100 border border-gray-300 rounded-md">
                {userInfo.Batch}
              </p>
            </div>
            {/* Phone Number */}
            <div>
              <label className="text-sm font-medium text-gray-600">semester</label>
              <p className="w-full text-md py-2 px-4 bg-gray-100 border border-gray-300 rounded-md">
                {userInfo.Semester}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Gpa</label>
              <p className="w-full text-md py-2 px-4 bg-gray-100 border border-gray-300 rounded-md">
                {userInfo.Gpa}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="my-6 w-full border-t border-gray-300"></div>

      {/* Action Button */}
      <div className="px-6">
        <button
          onClick={() => navigate("/CourseEnrollment")}
          className="w-full sm:w-auto text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-6 py-3"
        >
          Enroll in Courses
        </button>
      </div>
    </div>
  );
}
