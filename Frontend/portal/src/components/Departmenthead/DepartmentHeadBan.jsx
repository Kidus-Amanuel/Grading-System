import React from 'react'
import ReactDom from 'react-dom'
import { useState, useEffect } from 'react';
import Side from './DepartmentSide';

export default function HeadBan({title}) {
    const [isOpen, setIsOpen] = useState(false);
    const [screenSize, setScreenSize] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
          setScreenSize(window.innerWidth);
        };
    
        window.addEventListener('resize', handleResize);
    
        return () => {
          window.removeEventListener('resize',   
     handleResize);
        };
      }, []);
    
    return (
    <header className="bg-[#f1f1f1] border-b-[0.1rem] border-solid border-[rgb(167,115,222)] p-4 flex flex-row items-center justify-center">
        {screenSize <= 768    && (
            <div>
                {
                    <button onClick={()=> setIsOpen(true)}>
                        <svg class="w-9 h-9 text-gray-800 hover:text-[rgb(167,115,222)]  dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M5 7h14M5 12h14M5 17h14"/>
                        </svg>
                    </button>
                }
                <SideBarPopUP open={isOpen} onClose={()=> setIsOpen(false)}/>
            </div>
        )}
        <h1 className="text-3xl font-semibold text-[#5E469C] flex-1 text-center justify-center items-center">{title}</h1>
    </header>
  )
}

const Canncel_STYLES = {
    position: 'fixed',
    top: '0%',
    transform: 'translate(0%, 0%)',
    padding: '1rem'
}

const MODAL_STYLES = {
    position: 'fixed',
    top: '50%',
    left: '0%',
    transform: 'translate(0%, -50%)',
    zIndex: 1000
}

const OVERLAY_STYLES = {
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor:'rgba(0, 0, 0, 0.7)',
    zIndex: 1000
}

function SideBarPopUP({open, onClose}){
    if(!open) return null;
    return ReactDom.createPortal(
        <>
            <div style={OVERLAY_STYLES}></div>
            <div style={MODAL_STYLES} className='flex'>
                <div>
                    <Side/>
                </div>
                <div style={Canncel_STYLES}>
                    <button onClick={onClose}> 
                        <svg class="w-6 h-6 text-gray-800 hover:text-[rgb(167,115,222)] dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6"/>
                        </svg>
                    </button>
                </div>
            </div>
        </>,
        document.getElementById('portal')
    )
}
