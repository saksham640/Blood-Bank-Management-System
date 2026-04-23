import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import InventoryMatrix from './pages/admin/InventoryMatrix';
import UserPortal from './pages/user/UserPortal';
import HospitalPortal from './pages/hospital/HospitalPortal';
import DonorRegistry from './pages/admin/DonorRegistry';

// --- THE FIX: GLOBAL SPACING LAYOUT ---
const Layout = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      {/* pt-28 (112px) ensures content starts below the Navbar.
          We use a motion.div for a smooth page transition effect 
      */}
      <main className="pt-32 pb-12">
        <Outlet /> 
      </main>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/admin",
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/donor",
        element: (
          <ProtectedRoute allowedRoles={['donor']}>
             <UserPortal />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/matrix",
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <InventoryMatrix />
          </ProtectedRoute>
        ),
      },
      {
        path: "/hospital",
        element: (
          <ProtectedRoute allowedRoles={['hospital']}>
            <HospitalPortal />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/donor-database",
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <DonorRegistry />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;