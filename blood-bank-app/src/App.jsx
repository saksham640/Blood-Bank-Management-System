import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import InventoryMatrix from './pages/admin/InventoryMatrix';
// This Layout component ensures the Navbar stays at the top on every page
const Layout = () => {
  return (
    <>
      <Navbar />
      <Outlet /> {/* This is where the specific pages (Home, Login, etc.) will render */}
    </>
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
            <AdminDashboard />
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
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;