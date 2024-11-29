import React from 'react';
import { useLocation } from 'react-router-dom';
import HeadBan from "../../components/Instructor/InstructorHeadban";
import ListAssessment from "./ListAssessment";

export default function Assessment() {
    const location = useLocation();
    const { courseId } = location.state || {}; // Get courseId from the state

    return (
        <div>
            <div className='text-center z-0 bg-white'>
                <HeadBan title={"Assessment for Course"} />
                
                <div>
                    <ListAssessment courseId={courseId} /> {/* Pass courseId to ListAssessment */}
                </div>
            </div>
        </div>
    );
}

