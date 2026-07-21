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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Customer Route */}
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
        
        {/* Admin Route Example */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'STAFF']} />}>
          <Route path="/admin/dashboard" element={<div>Admin Dashboard - Đang phát triển</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;