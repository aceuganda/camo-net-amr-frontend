"use client";
import { leapfrog } from "ldrs";

const DotsLoader = () => {
    leapfrog.register();
    return (
        <l-leapfrog size="40" speed="2.5" color="#24408E"></l-leapfrog>
    );
};

export default DotsLoader;