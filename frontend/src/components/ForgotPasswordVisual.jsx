import React from 'react';
import { motion } from 'framer-motion';
import forgotPasswordImg from '../assets/img/forgot_password.jpg';

export default function ForgotPasswordVisual() {
  return (
    <div className="relative w-full h-full p-6 lg:p-2">
      <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
        <img src={forgotPasswordImg} alt="Landscape" className="w-full h-full object-cover" />
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>
    </div>
  );
}
