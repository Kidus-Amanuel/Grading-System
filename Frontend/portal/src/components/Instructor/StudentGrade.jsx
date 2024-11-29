import React from 'react';
import { useLocation } from 'react-router-dom';
import GradeTable from './GradeTable';
import HeadBan from './InstructorHeadban';

export default function StudentGrade() {
    const location = useLocation(); // Access the location object
    const { Course_id } = location.state || {}; // Destructure Course_id from state

    return (
        <div>
            <div className='text-center z-0 bg-white'>
                <div>
                    <HeadBan title={"Grade"} />
                </div>
                <div>
                    <GradeTable courseId={Course_id} /> {/* Pass Course_id to GradeTable */}
                </div>
            </div>
        </div>
    );
}