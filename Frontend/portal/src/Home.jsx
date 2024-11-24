import logo from './assets/student-grading-system-high-resolution-logo-transparent.png'
import ClientStats from "./components/ClientStats";
import { FooterComponent } from "./components/FooterComponent";
import { useState } from 'react';
import Login from "./components/login";

const Home = () => {
  const [isOpen, setIsOpen] = useState(false);

  //<a href="https://storyset.com/education">Education illustrations by Storyset</a>
  return (
    <div className="bg-[#2c3e50] h-screen overflow-y-auto overflow-x-hidden">
    <div className="h-screen">
      <header className="relative z-10 flex flex-row items-center justify-between px-5 m-0">
        <div className="flex flex-row items-center justify-center gap-1">
          <img className="md:w-[260px] w-[250px] h-auto" src={logo} />
          
        </div>
        <button onClick={()=> setIsOpen(true)} className="p-2 px-4 text-black bg-white hover:bg-black rounded-lg hover:text-neutral-100 md:text-xl font-normal font-['Inter']">
            SIGN IN
        </button>
        <Login open={isOpen} onClose={()=> setIsOpen(false)}/>
      </header>
        <div className=' flex justify-center'>
        <ClientStats/>
        
        </div>
      </div>
      <FooterComponent/>
    </div>
  );
};

export default Home;
