"use client";
import { leapfrog } from "ldrs";

const DotsLoader = () => {
    // let circleCommonClasses = 'h-2.5 w-2.5 bg-current rounded-full';
    leapfrog.register();

    return (
        <l-leapfrog size="40" speed="2.5" color="black"></l-leapfrog>
        // <div className='flex'>
        //     {/* <div className={`${circleCommonClasses} mr-1 animate-bounce`}></div>
        //     <div
        //         className={`${circleCommonClasses} mr-1 animate-bounce200`}
        //     ></div>
        //     <div className={`${circleCommonClasses} animate-bounce400`}></div> */}
        // </div>
    );
};

export default DotsLoader;