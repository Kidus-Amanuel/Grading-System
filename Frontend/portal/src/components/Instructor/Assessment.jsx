import HeadBan from "../../components/Instructor/InstructorHeadban";
import ListAssessment from "./ListAssessment";

export default function Assessment() {
    const handleAddClick = () => {
        alert("Your assessment has been submitted. You can see your student's grade.");
    };

    return (
        <div>
            <div className='text-center z-0 bg-white'>
                <div className='text-center z-0'>
                    <HeadBan title={"Students"} />
                </div>
                <div>
                    <ListAssessment />
                </div>
                <div className="p-6 flex justify-end pr-5">
                    <button 
                        type="button" 
                        onClick={handleAddClick} // Handle click
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                    >
                        ADD
                    </button>
                </div>
            </div>
        </div>
    );
}