"use client"
import React from 'react';
// import RegistrationForm from '@/components/requestForm';
import dynamic from 'next/dynamic';

const AuthComponent = dynamic(() => import('@/components/auth'), {
  ssr: false
});

export default function RegistrationFormPage() {
  return (
    <>
    <AuthComponent/>
    </>
  );
}

