import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, apiGetJson, formatCurrency } from "../api";

export default function OrderCreation() {
  const navigate = useNavigate();
  const [orderRequest, setOrderRequest] = useState({ customerName: "", items: [] });
  const [availableCustomers, setAvailableCustomers] = useState([]);
  const [productSelections, setProductSelections] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [existingTabTotal, setExistingTabTotal] = useState(0);
  const [isMobileView, setIsMobileView] = useState(typeof window !== 'undefined' && window.innerWidth <= 640);

  const totalSelectedItems = useMemo(
    () => productSelections.reduce((sum, p) => sum + p.quantity, 0),
    [productSelections]
  );

  const currentOrderTotal = useMemo(
    () => productSelections.reduce((sum, p) => sum + p.quantity * p.product.currentPrice, 0),
    [productSelections]
  );

  const canSubmitOrder = !isSubmitting && totalSelectedItems > 0 && orderRequest.customerName.trim() !== "";

  async function loadProductsAsync() {
    try {
      const response = await apiGetJson("/products");
      const products = response?.products ?? [];
      setProductSelections(
        products.filter((p) => p.isActive).map((product) => ({ product, quantity: 0 }))
      );
    } catch (error) {
      setFeedbackMessage(`Erro ao carregar o menu: ${error.message}`);
    }
  }

  async function loadCustomersAsync() {
    try {
      const response = await apiGetJson("/customers");
      const customers = response?.customers ?? [];
      const openCustomers = customers.filter((c) => c.isTabOpen);
      const grouped = new Map();
      for (const customer of openCustomers) {
        if (!grouped.has(customer.name)) {
          grouped.set(customer.name, customer);
        }
      }
      setAvailableCustomers(Array.from(grouped.values()));
    } catch {
      // Mantem o comportamento original de falha silenciosa.
    }
  }

  async function checkCustomerTab(customerName) {
    setExistingTabTotal(0);
    if (!customerName.trim()) return;

    const existingCustomer = availableCustomers.find(
      (c) => c.name.toLowerCase() === customerName.toLowerCase()
    );
    if (!existingCustomer) return;

    try {
      const tab = await apiGetJson(`/customers/${existingCustomer.id}/tab`);
      if (tab) {
        setExistingTabTotal(tab.totalAmount);
      }
    } catch {
      // Falha silenciosa como no Blazor.
    }
  }

  function incrementQuantity(itemId) {
    setProductSelections((current) =>
      current.map((item) => (item.product.id === itemId ? { ...item, quantity: item.quantity + 1 } : item))
    );
  }

  function decrementQuantity(itemId) {
    setProductSelections((current) =>
      current.map((item) =>
        item.product.id === itemId ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item
      )
    );
  }

  async function submitOrder() {
    if (!orderRequest.customerName.trim()) {
      setFeedbackMessage("Por favor, informe o nome do cliente.");
      return;
    }

    setIsSubmitting(true);
    setFeedbackMessage("");

    const payload = {
      customerName: orderRequest.customerName,
      items: productSelections
        .filter((p) => p.quantity > 0)
        .map((p) => ({ productId: p.product.id, quantity: p.quantity })),
    };

    try {
      const response = await apiFetch("/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setFeedbackMessage("Pedido gerado com sucesso!");
        setProductSelections((current) => current.map((item) => ({ ...item, quantity: 0 })));
        await loadCustomersAsync();
        await checkCustomerTab(orderRequest.customerName);
      } else {
        setFeedbackMessage("Erro ao gerar o pedido. Verifique os dados.");
      }
    } catch (error) {
      setFeedbackMessage(`Erro de conexão: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    loadProductsAsync();
    loadCustomersAsync();
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobileView(window.innerWidth <= 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="container-fluid p-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Novo Pedido</h2>
        <button className="btn btn-outline-primary" onClick={() => navigate("/fechamento")}>
          Ir para Fechamento <i className="bi bi-arrow-right ms-1" />
        </button>
      </div>

      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Dados do Cliente</h5>
          <div className="form-group">
            <label htmlFor="customerName">Nome ({availableCustomers.length} clientes com conta aberta)</label>
            <input
              id="customerName"
              list="customersList"
              className="form-control form-control-lg"
              value={orderRequest.customerName}
              onChange={(event) => setOrderRequest((c) => ({ ...c, customerName: event.target.value }))}
              onBlur={(event) => checkCustomerTab(event.target.value)}
              placeholder="Digite ou selecione o nome..."
              autoComplete="off"
            />
            <datalist id="customersList">
              {availableCustomers.map((customer) => (
                <option key={customer.id} value={customer.name} />
              ))}
            </datalist>
          </div>

          {existingTabTotal > 0 ? (
            <div className="alert alert-warning mt-3 mb-0 py-2 d-flex justify-content-between align-items-center">
              <span>
                <i className="bi bi-exclamation-circle me-2" />
                Este cliente já possui uma conta em aberto.
              </span>
              <strong className="fs-5">Dívida atual: {formatCurrency(existingTabTotal)}</strong>
            </div>
          ) : null}
        </div>
      </div>

      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-white">
          <h5 className="mb-0 mt-1">Cardápio</h5>
        </div>
        <div className="card-body p-0">
          <table className="table table-hover align-middle mb-0 caixa-menu-table">
            <thead className="table-light">
              <tr>
                <th className="ps-3">Produto</th>
                <th className="text-center" style={{ width: "180px" }}>
                  Quantidade
                </th>
                <th className="text-end pe-4" style={{ width: "150px" }}>
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody>
              {productSelections.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center p-4 text-muted">
                    Carregando produtos...
                  </td>
                </tr>
              ) : null}
              {productSelections.map((item) => (
                <tr key={item.product.id}>
                  <td className="ps-3">
                    <strong className="fs-5">{item.product.name}</strong>
                    <br />
                    <span className="text-muted">{formatCurrency(item.product.currentPrice)}</span>
                  </td>
                  <td>
                    <div
                      className={`input-group justify-content-center${isMobileView ? " mobile-qty-grid" : ""}`}
                      style={
                        isMobileView
                          ? {
                              display: "grid",
                              gridTemplateColumns: "40px 40px",
                              gridTemplateRows: "1fr 1fr",
                              gap: 0,
                              alignItems: "stretch",
                              width: "fit-content",
                            }
                          : undefined
                      }
                    >
                      <button
                        className="btn btn-outline-secondary px-3"
                        type="button"
                        onClick={() => incrementQuantity(item.product.id)}
                        style={isMobileView ? { gridRow: 1, gridColumn: 1, width: "40px", minWidth: "40px" } : undefined}
                      >
                        <b>+</b>
                      </button>
                      <button
                        className="btn btn-outline-secondary px-3"
                        type="button"
                        onClick={() => decrementQuantity(item.product.id)}
                        disabled={item.quantity <= 0}
                        style={isMobileView ? { gridRow: 2, gridColumn: 1, width: "40px", minWidth: "40px" } : undefined}
                      >
                        <b>-</b>
                      </button>
                      <input
                        type="number"
                        className="form-control text-center fw-bold bg-white"
                        value={item.quantity}
                        min="0"
                        style={
                          isMobileView
                            ? {
                                gridRow: "1 / span 2",
                                gridColumn: 2,
                                width: "40px",
                                minWidth: "40px",
                                maxWidth: "40px",
                                borderRadius: 0,
                              }
                            : { maxWidth: "60px" }
                        }
                        readOnly
                      />
                    </div>
                  </td>
                  <td className="text-end pe-4 fw-bold text-secondary">
                    {formatCurrency(item.quantity * item.product.currentPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-footer bg-light p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-muted fs-5">Valor deste pedido:</span>
            <span className="fs-4 fw-bold text-primary">{formatCurrency(currentOrderTotal)}</span>
          </div>

          {existingTabTotal > 0 && currentOrderTotal > 0 ? (
            <div className="d-flex justify-content-between align-items-center mb-3 pt-2 border-top">
              <span className="text-muted fw-bold">Novo total da conta será:</span>
              <span className="fs-5 fw-bolder text-danger">{formatCurrency(currentOrderTotal + existingTabTotal)}</span>
            </div>
          ) : null}

          <button className="btn btn-success btn-lg w-100" onClick={submitOrder} disabled={!canSubmitOrder}>
            {isSubmitting ? <span>Processando...</span> : <span>Finalizar Pedido ({totalSelectedItems} itens)</span>}
          </button>
        </div>
      </div>

      {feedbackMessage ? <div className="alert alert-info mt-3 fs-5 text-center">{feedbackMessage}</div> : null}
    </div>
  );
}
