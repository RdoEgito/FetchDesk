import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import CheckoutBoard from "./pages/CheckoutBoard";
import DeliveryBoard from "./pages/DeliveryBoard";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import OrderCreation from "./pages/OrderCreation";
import ProductManagement from "./pages/ProductManagement";
import Reports from "./pages/Reports";

export default function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/caixa" element={<OrderCreation />} />
        <Route path="/orders" element={<OrderCreation />} />
        <Route path="/balcao" element={<DeliveryBoard />} />
        <Route path="/balcao/:date" element={<DeliveryBoard />} />
        <Route path="/delivery" element={<DeliveryBoard />} />
        <Route path="/delivery/:date" element={<DeliveryBoard />} />
        <Route path="/items" element={<DeliveryBoard />} />
        <Route path="/items/:date" element={<DeliveryBoard />} />
        <Route path="/fechamento" element={<CheckoutBoard />} />
        <Route path="/checkout" element={<CheckoutBoard />} />
        <Route path="/customers" element={<CheckoutBoard />} />
        <Route path="/produtos" element={<ProductManagement />} />
        <Route path="/products" element={<ProductManagement />} />
        <Route path="/relatorios" element={<Reports />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/not-found" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </MainLayout>
  );
}
