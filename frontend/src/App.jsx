import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateService from "./pages/CreateService";
import CustomerDashboard from "./pages/CustomerDashboard";
import Home from "./pages/Home";
import InfoPage from "./pages/InfoPage";
import Login, { ForgotPassword, ResetPassword } from "./pages/Login";
import ProviderDashboard from "./pages/ProviderDashboard";
import ProviderSignup from "./pages/ProviderSignup";
import Signup from "./pages/Signup";
import RequestDetails from "./pages/RequestDetails";
import Requests from "./pages/Requests";
import NotFound from "./pages/NotFound";
import ServiceDetails from "./pages/ServiceDetails";
import Services from "./pages/Services";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminProviders from "./pages/admin/AdminProviders";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminUsers from "./pages/admin/AdminUsers";
import { staffPath } from "./config/staffPath";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signup/provider" element={<ProviderSignup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset" element={<ResetPassword />} />
      <Route
        path={staffPath}
        element={
          <ProtectedRoute role="ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="providers" element={<AdminProviders />} />
        <Route path="reviews" element={<AdminReviews />} />
      </Route>
      <Route
        path="*"
        element={
          <Layout>
            <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Navigate to="/signup" replace />} />
        <Route path="/info/:slug" element={<InfoPage />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetails />} />
        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <Requests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests/:id"
          element={
            <ProtectedRoute>
              <RequestDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={<Navigate to="/customer/dashboard" replace />}
        />
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute role="CUSTOMER">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider"
          element={<Navigate to="/provider/dashboard" replace />}
        />
        <Route
          path="/provider/dashboard"
          element={
            <ProtectedRoute role="PROVIDER">
              <ProviderDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/services/new"
          element={
            <ProtectedRoute role="PROVIDER">
              <CreateService />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}
