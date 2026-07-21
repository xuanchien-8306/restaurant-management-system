import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerHome from './pages/CustomerHome';
import Menu from './pages/Menu';
import FoodDetail from './pages/FoodDetail';
import Booking from './pages/Booking';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import ProtectedRoute from './routes/ProtectedRoute';

import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Staffs from './pages/admin/Staffs'; // Import Component Staffs
import ProtectedAdminRoute from './routes/ProtectedAdminRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* CUSTOMER ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
          <Route path="/" element={<CustomerHome />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/menu/:id" element={<FoodDetail />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
        </Route>
        
        {/* ADMIN ROUTES */}
        <Route element={<ProtectedAdminRoute allowedRoles={['ADMIN', 'MANAGER', 'CASHIER', 'WAITER', 'KITCHEN']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            {/* Đăng ký Route /admin/staff tại đây */}
            <Route path="staff" element={<Staffs />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;