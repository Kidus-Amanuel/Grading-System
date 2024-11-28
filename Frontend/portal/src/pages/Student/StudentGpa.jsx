import StudentGPAInfo from "../../components/Student/StudentGPAInfo";
import HeadBan from "../../components/Student/StudentHeadban";

export default function StudentGpa() {
    
    return (
        <div>
            <div className='text-center z-0'>
                <HeadBan title={"welcome"} />
            </div>
            <div>
            <StudentGPAInfo/>
            </div>
                    </div>
    );
}

