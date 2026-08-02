import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-200">
        <Link to="/login" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium mb-8">
          <ArrowRight className="w-4 h-4 mr-2" />
          Back to Login
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Terms of Service</h1>
        <div className="prose prose-slate max-w-none text-slate-600">
          <p className="mb-4">Last updated: August 2026</p>
          <p className="mb-4">
            Welcome to NmoLabs Flow. By accessing or using our enterprise resource planning system, you agree to be bound by these Terms of Service.
          </p>
          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. License to Use</h2>
          <p className="mb-4">
            We grant you a limited, non-exclusive, non-transferable, and revocable license to use our services strictly in accordance with these Terms and applicable laws.
          </p>
          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. User Responsibilities</h2>
          <p className="mb-4">
            You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. You agree not to disclose your password to any third party.
          </p>
          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Modifications</h2>
          <p className="mb-4">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect.
          </p>
        </div>
      </div>
    </div>
  );
}
