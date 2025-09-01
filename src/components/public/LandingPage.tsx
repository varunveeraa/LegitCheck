import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Eye, Scan, Upload, Hash, ArrowRight, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-cyan-600/20"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="relative">
                <Shield className="h-8 w-8 text-cyan-400" />
                <div className="absolute inset-0 h-8 w-8 text-cyan-400 animate-ping opacity-20">
                  <Shield className="h-8 w-8" />
                </div>
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                LegitCheck
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                to="/verify"
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
              >
                Verify Now
              </Link>
              <Link
                to="/login"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-full font-medium hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
              >
                Organizations
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Hero Images */}
          <div className="flex justify-center items-center space-x-8 mb-12 opacity-80">
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop" 
                alt="Medical professionals" 
                className="w-32 h-20 object-cover rounded-lg shadow-lg border border-cyan-500/20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-transparent rounded-lg"></div>
            </div>
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop" 
                alt="Graduation ceremony" 
                className="w-32 h-20 object-cover rounded-lg shadow-lg border border-blue-500/20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent rounded-lg"></div>
            </div>
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop" 
                alt="Medical documents" 
                className="w-32 h-20 object-cover rounded-lg shadow-lg border border-purple-500/20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent rounded-lg"></div>
            </div>
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-medium mb-8">
              <Zap className="h-4 w-4 mr-2" />
              Healthcare & Education Document Authentication
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Fraud Stops
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Here
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              Verify <span className="text-cyan-400 font-semibold">medical reports</span>, <span className="text-blue-400 font-semibold">invoices</span>, and <span className="text-purple-400 font-semibold">certificates</span> instantly. 
              Protect patients and students from document fraud.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/verify"
              className="group bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-4 rounded-full text-lg font-bold hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/30 flex items-center justify-center"
            >
              <Eye className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              Verify Document
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/register"
              className="group border-2 border-gray-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:border-cyan-400 hover:text-cyan-400 transition-all duration-300 flex items-center justify-center"
            >
              Join as Issuer
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">{"< 3s"}</div>
              <div className="text-gray-400">Average verification time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">99.9%</div>
              <div className="text-gray-400">Fraud detection accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">24/7</div>
              <div className="text-gray-400">Always available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Verification Methods */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Three Ways to Verify
              </span>
            </h2>
            <p className="text-xl text-gray-400">Choose your preferred method</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-8 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Scan className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 text-center">QR Scan</h3>
              <p className="text-gray-400 text-center leading-relaxed">
                Scan QR codes on medical reports and academic certificates. Instant verification for healthcare and education documents.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 text-center">File Upload</h3>
              <p className="text-gray-400 text-center leading-relaxed">
                Upload medical records, invoices, or transcripts. AI-powered detection of tampering in healthcare and education documents.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Hash className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 text-center">Document ID</h3>
              <p className="text-gray-400 text-center leading-relaxed">
                Enter verification codes from hospitals, clinics, universities, and schools. Quick status checks for critical documents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Healthcare & Education Security
              </span>
            </h2>
            <p className="text-xl text-gray-400">Protecting patients and students with enterprise-grade security</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Verified Institutions</h3>
              <p className="text-gray-400 leading-relaxed">
                Only verified hospitals, clinics, universities, and schools can issue documents. Rigorous institutional verification process.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Tamper Detection</h3>
              <p className="text-gray-400 leading-relaxed">
                Protect medical records, invoices, and academic credentials from fraud. Advanced cryptography detects any unauthorized changes.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Clock className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Real-Time Status</h3>
              <p className="text-gray-400 leading-relaxed">
                Instant verification for patient transfers and student applications. Real-time status updates from issuing institutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-3xl p-12">
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Stop Document Fraud
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join the fight against fraudulent medical reports, invoices, and academic documents
            </p>
            <Link
              to="/verify"
              className="inline-flex items-center bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-10 py-4 rounded-full text-lg font-bold hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/30"
            >
              <Eye className="h-6 w-6 mr-3" />
              Verify Documents Now
              <ArrowRight className="h-6 w-6 ml-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-cyan-400 mr-2" />
              <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                LegitCheck
              </span>
            </div>
            <div className="flex space-x-8">
              <Link to="/verify" className="text-gray-400 hover:text-cyan-400 transition-colors">
                Verify Document
              </Link>
              <Link to="/login" className="text-gray-400 hover:text-cyan-400 transition-colors">
                For Organizations
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-500">
              © 2025 LegitCheck. Securing documents with cutting-edge technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;