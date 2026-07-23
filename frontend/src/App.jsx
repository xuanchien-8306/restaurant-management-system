import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import Staffs from './pages/admin/Staffs';
import Customers from './pages/admin/Customers';
import MenuManagement from './pages/admin/MenuManagement';
import Categories from './pages/admin/Categories';
import InventoryManagement from './pages/admin/InventoryManagement';
import RecipeManagement from './pages/admin/RecipeManagement';
import TableManagement from './pages/admin/TableManagement';
import OrderManagement from './pages/admin/OrderManagement';
import POS from './pages/admin/POS';
import KDS from './pages/admin/KDS';
import ReservationManagement from './pages/admin/ReservationManagement';
import PromotionManagement from './pages/admin/PromotionManagement';
import Reports from './pages/admin/Reports';
import Profile from './pages/admin/Profile'; // Import Profile
import ProtectedAdminRoute from './routes/ProtectedAdminRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<ProtectedRoute allowedRoles={['CUSTOMER', 'USER', 'ROLE_CUSTOMER', 'ROLE_USER']} />}>
          <Route path="/" element={<CustomerHome />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/menu/:id" element={<FoodDetail />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
        </Route>
        
        <Route element={<ProtectedAdminRoute allowedRoles={['ADMIN', 'MANAGER', 'CASHIER', 'WAITER', 'KITCHEN']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="staff" element={<Staffs />} />
            <Route path="customers" element={<Customers />} />
            <Route path="menu" element={<MenuManagement />} />
            <Route path="categories" element={<Categories />} />
            <Route path="inventory" element={<InventoryManagement />} />
            <Route path="recipes" element={<RecipeManagement />} />
            <Route path="tables" element={<TableManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="pos" element={<POS />} />
            <Route path="kds" element={<KDS />} />
            <Route path="bookings" element={<ReservationManagement />} />
            <Route path="promotions" element={<PromotionManagement />} />
            <Route path="reports" element={<Reports />} />
            
            {/* Đăng ký Route Profile */}
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;