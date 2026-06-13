import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import CheckoutBoard from "./pages/CheckoutBoard";
import DeliveryBoard from "./pages/DeliveryBoard";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import OrderCreation from "./pages/OrderCreation";
import ProductManagement from "./pages/ProductManagement";
import Reports from "./pages/Reports";

export default function App() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let page = "Página";

    if (path === "/") page = "Início";
    else if (path.startsWith("/caixa") || path.startsWith("/orders")) page = "Caixa";
    else if (path.startsWith("/balcao") || path.startsWith("/delivery") || path.startsWith("/items")) page = "Balcão";
    else if (path.startsWith("/fechamento") || path.startsWith("/checkout") || path.startsWith("/customers")) page = "Fechamento";
    else if (path.startsWith("/produtos") || path.startsWith("/products")) page = "Produtos";
    else if (path.startsWith("/relatorios") || path.startsWith("/reports")) page = "Relatórios";
    else if (path === "/not-found") page = "Não encontrado";

    document.title = `Cantina - ${page}`;
  }, [location.pathname]);

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
