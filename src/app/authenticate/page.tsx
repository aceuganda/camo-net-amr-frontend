"use client"
import React from 'react';
import dynamic from 'next/dynamic';

const AuthenticateComponent = dynamic(() => import('@/components/auth'), { ssr: false });

export default function RegistrationFormPage() {
  return (
    <>
    <AuthenticateComponent/>
    </>
  );
}

