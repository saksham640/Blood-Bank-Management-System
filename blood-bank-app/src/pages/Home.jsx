import React from 'react';
import { Droplet, Hospital, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-red-50 py-20 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Connecting <span className="text-red-600">Blood Donors</span> with Life-Savers
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          A centralized platform for real-time blood inventory management, 
          bridging the gap between donors, blood banks, and hospitals.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/register" className="bg-red-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-red-700 transition flex items-center justify-center">
            Donate Now <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link to="/login" className="border-2 border-red-600 text-red-600 px-8 py-3 rounded-md font-semibold hover:bg-red-50 transition">
            Hospital Portal
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16">Three Integrated Interfaces</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Donor Feature */}
          <div className="text-center p-6 border rounded-xl shadow-sm hover:shadow-md transition">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="text-red-600 h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-4">For Donors</h3>
            <p className="text-gray-600">Register as a donor, track your history, and find nearby blood donation camps effortlessly.</p>
          </div>

          {/* Inventory Feature */}
          <div className="text-center p-6 border rounded-xl shadow-sm hover:shadow-md transition">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Droplet className="text-red-600 h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-4">Inventory Control</h3>
            <p className="text-gray-600">Real-time tracking of blood groups, components, and expiry dates for blood bank staff.</p>
          </div>

          {/* Hospital Feature */}
          <div className="text-center p-6 border rounded-xl shadow-sm hover:shadow-md transition">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Hospital className="text-red-600 h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-4">For Hospitals</h3>
            <p className="text-gray-600">Place urgent blood requests and track delivery status in real-time during emergencies.</p>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Home;