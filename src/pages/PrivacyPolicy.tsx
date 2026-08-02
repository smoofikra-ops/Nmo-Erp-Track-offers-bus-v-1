import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-200">
        <Link to="/login" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium mb-8">
          <ArrowRight className="w-4 h-4 mr-2" />
          Back to Login
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Privacy Policy</h1>
        <div className="prose prose-slate max-w-none text-slate-600">
          <p className="mb-4">Last updated: August 2026</p>
          <p className="mb-4">
            At NmoLabs, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our enterprise resource planning system.
          </p>
          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Information We Collect</h2>
          <p className="mb-4">
            We collect information that you provide directly to us when you use the NmoLabs Flow system, including business details, employee data, transaction records, and account credentials.
          </p>
          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">
            We use the information we collect primarily to provide, maintain, and improve our services, to process transactions, and to send you related information such as confirmations, invoices, and technical notices.
          </p>
          <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Data Security</h2>
          <p className="mb-4">
            We implement appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.
          </p>
        </div>
      </div>
    </div>
  );
}
