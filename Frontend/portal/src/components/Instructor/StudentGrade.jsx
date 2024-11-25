import GradeTable from './GradeTable';
import HeadBan from './InstructorHeadban'

export default function StudentGrade() {

  return (
    <div>
    <div className='text-center z-0 bg-white'>

      <div>
          <HeadBan title={"Grade"}/>
                </div>    
                <div>
                <GradeTable/>
                </div>
                </div>
                </div>
  );
}

