import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeadBan from "../../components/Instructor/InstructorHeadban";
import EnrolledStudents from "./EnrolledStudents";

export default function InsCourseStudent() {
    const navigate = useNavigate(); // Initialize useNavigate

    const handleAssessmentClick = () => {
        navigate('/Assessment'); // Navigate to the Assessment page
    };

    return (
        <div>
            <div className='text-center z-0 bg-white'>
                <div className='text-center z-0'>
                    <HeadBan title={"Students"} />
                </div>
                <div className="pt-11 pb-5">
                    <form className="max-w-md mx-auto">   
                        <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only">Search</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                                </svg>
                            </div>
                            <input type="search" id="default-search" className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500" placeholder="Search Mockups, Logos..." required />
                            <button type="submit" className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2">Search</button>
                        </div>
                    </form>
                </div>
                <div className="w-[95%] mx-auto py-5">
                    <hr />
                </div>
                <div>
                    <EnrolledStudents />
                </div>
                <div className="p-6 flex justify-end pr-5">
                    <button 
                        type="button" 
                        onClick={handleAssessmentClick} // Handle click
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                    >
                        Assessment
                    </button>
                </div>
            </div>
        </div>
    );
}