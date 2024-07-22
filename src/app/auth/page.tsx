"use client"
import React from 'react';
// import RegistrationForm from '@/components/requestForm';
import dynamic from 'next/dynamic';

const RegistrationForm = dynamic(() => import('@/components/requestForm'), {
  ssr: false
});

export default function RegistrationFormPage() {
  return (
    <>
    <RegistrationForm/>
    </>
  );
}

