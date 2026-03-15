import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Register from './pages/Register';
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
        element: <div className="p-20 text-center text-2xl">Login Page (Building Next...)</div>,
      },
      {
        path: "/register",
        element: <Register />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;