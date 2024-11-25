import React from 'react';
import ListDepCourses from "../../components/Departmenthead/ListDepCourses";
import HeadBan from "../../components/Departmenthead/DepartmentHeadBan";

export default function DepartmentCourses() {
    return (
        <div>
            <div className='text-center z-0 bg-white'>
                <div className='text-center z-0'>
                    <HeadBan title={"Courses"} />
                </div>
                <div className="pt-11 pb-5">
                    <form className="max-w-lg mx-auto">
                        <div className="flex">
                            <label htmlFor="search-dropdown" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Your Email</label>
                            <button 
                                id="dropdown-button" 
                                className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900 bg-gray-100 border border-gray-300 rounded-s-lg hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700 dark:text-white dark:border-gray-600" 
                                type="button"
                            >
                                All categories 
                                <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                                </svg>
                            </button>
                            {/* Dropdown menu */}
                            <div id="dropdown" className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
                                <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdown-button">
                                    <li>
                                        <button type="button" className="inline-flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Year 1 Semester I</button>
                                    </li>
                                    <li>
                                        <button type="button" className="inline-flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Year 1 Semester II</button>
                                    </li>
                                    <li>
                                        <button type="button" className="inline-flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Year 2 Semester I</button>
                                    </li>
                                    <li>
                                        <button type="button" className="inline-flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Year 2 Semester II</button>
                                    </li>
                                </ul>
                            </div>
                            <div className="relative w-full">
                                <input 
                                    type="search" 
                                    id="search-dropdown" 
                                    className="block p-2.5 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-e-lg border-s-gray-50 border-s-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-s-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500" 
                                    placeholder="Search Courses..." 
                                    required 
                                />
                                <button type="submit" className="absolute top-0 end-0 p-2.5 text-sm font-medium h-full text-white bg-blue-700 rounded-e-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                    <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                                    </svg>
                                    <span className="sr-only">Search</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="w-[95%] mx-auto py-5">
                    <hr />
                </div>
                <div>
                    <h2 className="text-lg font-semibold mb-2">Year 1 Semester I</h2>
                    <ListDepCourses semester="Year 1 Semester I" />
                    <h2 className="text-lg font-semibold mt-8 mb-2">Year 1 Semester II</h2>
                    <ListDepCourses semester="Year 1 Semester II" />
                    <h2 className="text-lg font-semibold mt-8 mb-2">Year 2 Semester I</h2>
                    <ListDepCourses semester="Year 2 Semester I" />
                    <h2 className="text-lg font-semibold mt-8 mb-2">Year 2 Semester II</h2>
                    <ListDepCourses semester="Year 2 Semester II" />
                </div>
            </div>
        </div>
    );
}