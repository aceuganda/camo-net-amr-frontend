"use client"
import React, { useState, useEffect } from 'react';
import LogoHeader from '../logosHeader';
import { login,Register } from '@/lib/hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import DotsLoader from '../ui/dotsLoader';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';


const RegistrationForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [confirmPassword, setConfirmPassword] = useState('');
  const { data, isSuccess, error, isPending, mutate } = useMutation({
    mutationFn: login,
  });
  const { data:regData, isSuccess:regSuccess, error:regError, isPending:regIsPending, mutate:regMutate } = useMutation({
    mutationFn: Register,
  });

  const handleRegistrationSubmit = async (e: any) => {
    e.preventDefault();
    if(password !== confirmPassword){
      toast.error("Please make sure the passwords you have entered match");
    }
    regMutate({ email, name:fullName, password });
    if(regSuccess){
      toast.success("Registered successfully, please login.");
      setActiveTab("login")
    }
    if (regError){
      toast.error(`Failed to Register this account: An account with this email probably exists on the platform already`);
    }
   
  };

  const handleLoginSubmit = async (e: any) => {
    // e.preventDefault();
    mutate({ email, password });
    if(isSuccess){
      router.push('/');
      toast.success("Signed in successfully");
    }
    if (error){
      toast.error(`Failed to login: make sure you have the right login credentials`);
    }
  };

  return (
    <div
      style={{ backgroundImage: 'url(/backgroundImageNet.webp)' }}
      className="flex justify-center items-center min-h-screen bg-gray-100 bg-no-repeat bg-cover relative bg-fixed bg-center"
    >
      <div className='bg-[#161047] absolute h-[100%] w-[30%] top-0 left-0'></div>

      <div className="w-[70%] h-[40rem] bg-white rounded-[10px] shadow-box  z-10">
        <div className="flex justify-between items-center p-4 rounded-t-lg border-b-gray-300 border-b-[2px]">
          <LogoHeader />
        </div>
        <div className="py-6 bg-[#f2f2f2] min-h-[33rem] px-4 sm:px-[6rem] rounded-[10px] transition-all relative">
          <div className="flex border-b mb-6">
            <button
              onClick={() => setActiveTab('login')}
              className={`w-1/2 text-center py-2 ${activeTab === 'login' ? 'text-[#00b9f1] border-b-2 border-[#00b9f1]' : 'text-gray-500 border-b-2 border-gray-500'}`}
            >
              LOGIN
            </button>
            <button
              onClick={() => setActiveTab('registration')}
              className={`w-1/2 text-center py-2 ${activeTab === 'registration' ? 'text-[#00b9f1] border-b-2 border-[#00b9f1]' : 'text-gray-500 border-b-2 border-gray-500'}`}
            >
              REGISTRATION
            </button>
          </div>
          {activeTab === 'registration' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-gray-700">Email Address <span className="text-red-600 text-[11px]">(Required)</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 p-2 bg-[#e6e6e6] rounded"
                  placeholder="Email Address"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Full Name <span className="text-red-600 text-[11px]">(Required)</span></label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full mt-1 p-2 bg-[#e6e6e6] rounded"
                  placeholder="Full Name"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Password <span className="text-red-600 text-[11px]">(Required)</span></label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mt-1 p-2 bg-[#e6e6e6] rounded"
                  placeholder="Password"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Confirm Password <span className="text-red-600 text-[11px]">(Required)</span></label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full mt-1 p-2 bg-[#e6e6e6] rounded"
                  placeholder="Confirm Password"
                  required
                />
              </div>
              <div className='w-full flex justify-end absolute bottom-5 left-0 items-end  px-5'>
              <button disabled={regIsPending}  onClick={handleRegistrationSubmit} className="p-2  bg-[#00b9f1] sm:min-w-[13rem]flex items-center justify-center min-h-[2.4rem]  mt-3 text-white rounded hover:bg-[#7ad4ef]"> {regIsPending && !regSuccess  && !regError? <DotsLoader/> : "REGISTER"}</button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700">Email Address <span className="text-red-600 text-[11px] ">(Required)</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 p-2 bg-[#e6e6e6] rounded"
                  placeholder="Email Address"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Password <span className="text-red-600 text-[11px]">(Required)</span></label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mt-1 p-2 bg-[#e6e6e6] rounded"
                  placeholder="Password"
                  required
                />
              </div>
            
              <div className='w-full flex absolute justify-end bottom-5 left-0 items-end px-5'>
               
                <button disabled={isPending}  onClick={handleLoginSubmit} className="p-2 sm:min-w-[13rem] flex items-center justify-center min-h-[2.4rem]  bg-[#00b9f1] mt-3 text-white rounded hover:bg-[#7ad4ef]">
                {isPending ? <DotsLoader/> : "LOGIN"}
                  </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
