import logo from './assets/logo4.png'
import ClientStats from "./components/ClientStats";
import { FooterComponent } from "./components/FooterComponent";
import { useState } from 'react';
import Login from "./components/login";

const Home = () => {
  const [isOpen, setIsOpen] = useState(false);

  //<a href="https://storyset.com/education">Education illustrations by Storyset</a>
  return (
    <div className="bg-[#F1F1F1] h-screen overflow-y-auto overflow-x-hidden">
    <div className="h-screen">
      <header className="relative z-10 flex flex-row items-center justify-between px-5 m-0">
        <div className="flex flex-row items-center justify-center gap-1">
          <img className="md:w-[60px] w-[50px] h-auto" src={logo} />
          <h1 className="text-[#5e469c] text-[20px] md:text-[30px] xl:text-[45px] font-bold font-['Inter']">
            Spectrum Engineering wifi system
          </h1>
        </div>
        <button onClick={()=> setIsOpen(true)} className="p-2 px-4 bg-[#5e469c] hover:bg-black rounded-lg text-neutral-100 md:text-xl font-normal font-['Inter']">
            SIGN IN
        </button>
        <Login open={isOpen} onClose={()=> setIsOpen(false)}/>
      </header>
        
        <ClientStats/>
      </div>
      <FooterComponent/>
    </div>
  );
};

export default Home;
