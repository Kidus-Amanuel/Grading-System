import HeadBan from "../../components/Student/StudentHeadban";
import CourseForEnroll from "./CourseForEnroll";

export default function CourseEnrollment() {
    
    return (
        <div>
            <div className='text-center z-0 bg-white'>  
                <div className='z-20 text-center'>
                    <HeadBan title={"Course"}/>
                </div>
                <CourseForEnroll/>
                </div>   
        </div>
    );
}