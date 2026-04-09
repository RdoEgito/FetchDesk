import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, apiGetJson, formatCurrency } from "../api";

export default function CheckoutBoard() {
  const navigate = useNavigate();
  const [openCustomers, setOpenCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [currentTab, setCurrentTab] = useState(null);
  const [isLoadingTab, setIsLoadingTab] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  async function loadOpenCustomersAsync() {
    try {
      const response = await apiGetJson("/customers");
      const customers = response?.customers ?? [];
      setOpenCustomers(customers);
    } catch {
      // comportamento original
    }
  }

  async function selectCustomer(customerId) {
    setSelectedCustomerId(customerId);
    setIsLoadingTab(true);
    setFeedbackMessage("");
    setCurrentTab(null);
    try {
      const tab = await apiGetJson(`/customers/${customerId}/tab`);
      setCurrentTab(tab);
    } catch (error) {
      setFeedbackMessage(`Erro ao carregar a conta: ${error.message}`);
    } finally {
      setIsLoadingTab(false);
    }
  }

  async function returnItemAsync(productId) {
    if (!selectedCustomerId) return;
    try {
      const response = await apiFetch(`/customers/${selectedCustomerId}/items/${productId}`, { method: "DELETE" });
      if (response.ok) {
        await selectCustomer(selectedCustomerId);
      } else {
        setFeedbackMessage("Não foi possível devolver o item. Ele pode já ter sido entregue no balcão.");
      }
    } catch (error) {
      setFeedbackMessage(`Erro de conexão: ${error.message}`);
    }
  }

  async function closeTab() {
    if (!selectedCustomerId) return;
    setIsProcessingPayment(true);
    setFeedbackMessage("");
    try {
      const response = await apiFetch(`/customers/${selectedCustomerId}/close-tab`, { method: "PATCH" });
      if (response.ok) {
        setCurrentTab((tab) => (tab ? { ...tab, isTabOpen: false } : tab));
        setOpenCustomers((customers) =>
          customers.map((customer) =>
            customer.id === selectedCustomerId ? { ...customer, isTabOpen: false } : customer
          )
        );
        setFeedbackMessage("Pagamento recebido com sucesso!");
      } else {
        setFeedbackMessage("Erro ao processar o fechamento da conta.");
      }
    } catch (error) {
      setFeedbackMessage(`Erro de conexão: ${error.message}`);
    } finally {
      setIsProcessingPayment(false);
    }
  }

  const consolidatedItems = useMemo(() => {
    if (!currentTab) return [];
    const map = new Map();
    for (const order of currentTab.orders || []) {
      for (const item of order.items || []) {
        const productName = item.product?.name?.trim() ? item.product.name : "Produto nao identificado";
        const unitPrice = item.priceAtPurchase ?? 0;
        const key = `${item.productId}__${unitPrice}__${productName}`;
        if (!map.has(key)) {
          map.set(key, {
            productId: item.productId,
            productName,
            quantity: 0,
            cancellableQuantity: 0,
            unitPrice: unitPrice,
            subTotal: 0,
          });
        }
        const entry = map.get(key);
        entry.quantity += 1;
        if (!item.isDelivered) {
          entry.cancellableQuantity += 1;
        }
        entry.subTotal += unitPrice;
      }
    }
    return Array.from(map.values());
  }, [currentTab]);

  useEffect(() => {
    loadOpenCustomersAsync();
  }, []);

  return (
    <div className="container-fluid p-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Fechamento de Conta</h2>
        <button className="btn btn-outline-primary" onClick={() => navigate("/caixa")}>
          <i className="bi bi-arrow-left me-1" /> Voltar para Pedidos
        </button>
      </div>

      <div className="row">
        <div className="col-12 col-md-4 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">Contas de Clientes</h5>
            </div>
            <div className="list-group list-group-flush">
              {openCustomers.length === 0 ? (
                <div className="p-4 text-center text-muted">Nenhuma conta registrada.</div>
              ) : (
                openCustomers.map((customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                      customer.id === selectedCustomerId ? "active" : ""
                    } ${!customer.isTabOpen ? "opacity-50 bg-light" : ""}`}
                    onClick={() => selectCustomer(customer.id)}
                  >
                    <strong>{customer.name}</strong>
                    {!customer.isTabOpen ? <span className="badge bg-success rounded-pill">Pago</span> : null}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-md-8">
          {isLoadingTab ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-2 text-muted">Carregando conta...</p>
            </div>
          ) : currentTab ? (
            <>
              <div className="card shadow border-0">
                <div className="card-header bg-white border-bottom border-2 py-3 d-flex justify-content-between align-items-center">
                  <h4 className="mb-0 text-primary">Conta: {currentTab.name}</h4>
                </div>
                <div className="card-body p-0">
                  <table className="table table-striped table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4">Produto</th>
                        <th className="text-center">Qtd</th>
                        <th className="text-end">V. Unitário</th>
                        <th className="text-end pe-4">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consolidatedItems.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center p-4 text-muted">
                            Nenhum consumo pendente.
                          </td>
                        </tr>
                      ) : (
                        consolidatedItems.map((item) => (
                          <tr key={`${item.productId}-${item.unitPrice}`}>
                            <td className="ps-4 fw-bold">{item.productName}</td>
                            <td className="text-center">
                              <div className="d-flex align-items-center justify-content-center gap-2">
                                {item.cancellableQuantity > 0 && currentTab.isTabOpen ? (
                                  <button
                                    className="btn btn-sm btn-outline-danger py-0 px-2"
                                    title="Devolver item"
                                    onClick={() => returnItemAsync(item.productId)}
                                  >
                                    <i className="bi bi-dash" />
                                  </button>
                                ) : null}
                                <span className="fs-5">{item.quantity}</span>
                              </div>
                            </td>
                            <td className="text-end">{formatCurrency(item.unitPrice)}</td>
                            <td className="text-end pe-4">{formatCurrency(item.subTotal)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="card-footer bg-light p-4 d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted text-uppercase fw-bold" style={{ letterSpacing: "1px" }}>
                      Total a Pagar
                    </span>
                    <h2 className="mb-0 text-success fw-bolder">{formatCurrency(currentTab.totalAmount)}</h2>
                  </div>
                  {!currentTab.isTabOpen ? (
                    <button className="btn btn-secondary btn-lg px-5 shadow-sm" disabled>
                      <i className="bi bi-check-all me-2" /> <span>Pago</span>
                    </button>
                  ) : (
                    <button className="btn btn-success btn-lg px-5 shadow-sm" onClick={closeTab} disabled={isProcessingPayment}>
                      {isProcessingPayment ? (
                        <span>Processando...</span>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2" /> <span>Receber Pagamento</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
              {feedbackMessage ? <div className="alert alert-info mt-3">{feedbackMessage}</div> : null}
            </>
          ) : (
            <div
              className="card shadow-sm border-0 h-100 bg-light d-flex align-items-center justify-content-center"
              style={{ minHeight: "300px" }}
            >
              <h5 className="text-muted">Selecione um cliente ao lado para ver a conta.</h5>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
