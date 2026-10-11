import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, apiGetJson, formatCurrency } from "../api";

const parseAmountCents = (value) => {
  const amount = Number(String(value).trim().replace(",", "."));
  return Number.isFinite(amount) ? Math.round(amount * 100) : Number.NaN;
};

export default function CheckoutBoard() {
  const navigate = useNavigate();
  const [openCustomers, setOpenCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [currentTab, setCurrentTab] = useState(null);
  const [isLoadingTab, setIsLoadingTab] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isSavingObservation, setIsSavingObservation] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [returnItemError, setReturnItemError] = useState("");
  const [returningItemId, setReturningItemId] = useState(null);
  const [isPaidCustomersExpanded, setIsPaidCustomersExpanded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [splitCashAmount, setSplitCashAmount] = useState("");
  const splitCashInputRef = useRef(null);

  const activeCustomers = openCustomers.filter((customer) => customer.isTabOpen);
  const paidCustomers = openCustomers.filter((customer) => !customer.isTabOpen);

  useEffect(() => {
    if (paymentMethod === "split" && splitCashInputRef.current) {
      splitCashInputRef.current.focus();
      splitCashInputRef.current.select();
    }
  }, [paymentMethod]);

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
    setPaymentMethod("card");
    setSplitCashAmount("");
    setIsLoadingTab(true);
    setFeedbackMessage("");
    setReturnItemError("");
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

  async function returnItemAsync(itemId) {
    if (!selectedCustomerId) return;
    setReturningItemId(itemId);
    setReturnItemError("");
    try {
      const response = await apiFetch(
        `/customers/${selectedCustomerId}/items/${itemId}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        await selectCustomer(selectedCustomerId);
      } else {
        let detail = "";
        try {
          const body = await response.json();
          detail = Array.isArray(body.message)
            ? body.message.join(" ")
            : body.message || body.error || "";
        } catch {
          detail = "";
        }

        const errorMessage = [
          `Não foi possível remover o item (HTTP ${response.status}).`,
          detail,
        ]
          .filter(Boolean)
          .join(" ");
        setReturnItemError(errorMessage);

        try {
          const tab = await apiGetJson(`/customers/${selectedCustomerId}/tab`);
          setCurrentTab(tab);
        } catch (refreshError) {
          setReturnItemError(
            `${errorMessage} Também não foi possível atualizar a conta: ${refreshError.message}`
          );
        }
      }
    } catch (error) {
      setReturnItemError(`Erro ao remover o item: ${error.message}`);
    } finally {
      setReturningItemId(null);
    }
  }

  async function closeTab() {
    if (!selectedCustomerId) return;
    const totalCents = Math.round(Number(currentTab?.totalAmount ?? 0) * 100);
    const splitCashCents = parseAmountCents(splitCashAmount);
    const cashCents = paymentMethod === "cash"
      ? totalCents
      : paymentMethod === "split"
        ? splitCashCents
        : 0;
    const cardCents = paymentMethod === "card" ? totalCents : totalCents - cashCents;

    setIsProcessingPayment(true);
    setFeedbackMessage("");
    try {
      const response = await apiFetch(`/customers/${selectedCustomerId}/close-tab`, {
        method: "PATCH",
        body: JSON.stringify({
          cashAmount: cashCents / 100,
          cardAmount: cardCents / 100,
          observation: currentTab?.observation ?? "",
        }),
      });
      if (response.ok) {
        const today = new Date().toISOString().slice(0, 10);
        setCurrentTab((tab) => {
          if (!tab) return tab;
          const ordersPaidToday = (tab.orders || []).filter(
            (order) => new Date(order.createdAt).toISOString().slice(0, 10) === today
          );
          const paidTodayOrders = [...(tab.paidTodayOrders || [])];
          const existingOrderIds = new Set(paidTodayOrders.map((order) => order.id));

          return {
            ...tab,
            isTabOpen: false,
            totalAmount: 0,
            orders: [],
            observation: tab.observation?.trim() || null,
            paidTodayOrders: [
              ...paidTodayOrders,
              ...ordersPaidToday.filter((order) => !existingOrderIds.has(order.id)),
            ],
          };
        });
        setOpenCustomers((customers) =>
          customers.map((customer) =>
            customer.id === selectedCustomerId ? { ...customer, isTabOpen: false } : customer
          )
        );
        setIsPaidCustomersExpanded(true);
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

  async function saveObservation() {
    if (!selectedCustomerId || !currentTab) return;
    setIsSavingObservation(true);
    setFeedbackMessage("");
    try {
      const response = await apiFetch(
        `/customers/${selectedCustomerId}/observation`,
        {
          method: "PATCH",
          body: JSON.stringify({ observation: currentTab.observation ?? "" }),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const result = await response.json();
      setCurrentTab((tab) =>
        tab ? { ...tab, observation: result.observation } : tab
      );
      setFeedbackMessage("Observação salva com sucesso.");
    } catch (error) {
      setFeedbackMessage(`Erro ao salvar a observação: ${error.message}`);
    } finally {
      setIsSavingObservation(false);
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
            cancellableItemIds: [],
            unitPrice: unitPrice,
            subTotal: 0,
          });
        }
        const entry = map.get(key);
        entry.quantity += 1;
        if (item.status === "Pending") {
          entry.cancellableQuantity += 1;
          entry.cancellableItemIds.push(item.id);
        }
        entry.subTotal += unitPrice;
      }
    }
    return Array.from(map.values());
  }, [currentTab]);

  const paidTodayItems = useMemo(() => {
    if (!currentTab) return [];
    const map = new Map();
    for (const order of currentTab.paidTodayOrders || []) {
      for (const item of order.items || []) {
        const productName = item.product?.name?.trim()
          ? item.product.name
          : "Produto nao identificado";
        const unitPrice = Number(item.priceAtPurchase ?? 0);
        const key = `${item.productId}__${unitPrice}__${productName}`;
        if (!map.has(key)) {
          map.set(key, {
            productId: item.productId,
            productName,
            quantity: 0,
            unitPrice,
            subTotal: 0,
          });
        }
        const entry = map.get(key);
        entry.quantity += 1;
        entry.subTotal += unitPrice;
      }
    }
    return Array.from(map.values());
  }, [currentTab]);

  const paidTodayTotal = paidTodayItems.reduce((sum, item) => sum + item.subTotal, 0);
  const totalDueCents = Math.round(Number(currentTab?.totalAmount ?? 0) * 100);
  const splitCashCents = parseAmountCents(splitCashAmount);
  const isSplitPaymentValid =
    paymentMethod !== "split" ||
    (Number.isFinite(splitCashCents) && splitCashCents > 0 && splitCashCents < totalDueCents);

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
            <div className="border-bottom">
              <div className="px-3 py-2 bg-light">
                <strong>Contas em aberto</strong>
                <span className="badge bg-primary rounded-pill ms-2">{activeCustomers.length}</span>
              </div>
              <div className="list-group list-group-flush">
                {activeCustomers.length === 0 ? (
                  <div className="px-3 py-3 text-center text-muted">Nenhuma conta em aberto.</div>
                ) : (
                  activeCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                        customer.id === selectedCustomerId ? "active" : ""
                      }`}
                      onClick={() => selectCustomer(customer.id)}
                    >
                      <strong>{customer.name}</strong>
                    </button>
                  ))
                )}
              </div>
            </div>
            <div>
              <button
                type="button"
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center w-100 border-0 rounded-0"
                aria-expanded={isPaidCustomersExpanded}
                onClick={() => setIsPaidCustomersExpanded((expanded) => !expanded)}
              >
                <strong>Contas pagas</strong>
                <span className="d-flex align-items-center gap-2">
                  <span className="badge bg-success rounded-pill">{paidCustomers.length}</span>
                  <i
                    className={`bi ${
                      isPaidCustomersExpanded ? "bi-caret-down-fill" : "bi-caret-right-fill"
                    }`}
                    aria-hidden="true"
                  />
                </span>
              </button>
              {isPaidCustomersExpanded && (
                <div className="list-group list-group-flush">
                  {paidCustomers.length === 0 ? (
                    <div className="px-3 py-3 text-center text-muted">Nenhuma conta paga.</div>
                  ) : (
                    paidCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                          customer.id === selectedCustomerId ? "active" : ""
                        } ${customer.id !== selectedCustomerId ? "opacity-50 bg-light" : ""}`}
                        onClick={() => selectCustomer(customer.id)}
                      >
                        <strong>{customer.name}</strong>
                        <span className={`badge rounded-pill ${
                          customer.id === selectedCustomerId ? "bg-light text-success" : "bg-success"
                        }`}>Pago</span>
                      </button>
                    ))
                  )}
                </div>
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
                                    onClick={() => returnItemAsync(item.cancellableItemIds[0])}
                                    disabled={returningItemId !== null}
                                  >
                                    {returningItemId === item.cancellableItemIds[0] ? (
                                      <span
                                        className="spinner-border spinner-border-sm"
                                        role="status"
                                        aria-label="Removendo item"
                                      />
                                    ) : (
                                      <i className="bi bi-dash" />
                                    )}
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
                <div className="card-body border-top">
                  <label htmlFor="customer-observation" className="form-label fw-bold">
                    Observação
                  </label>
                  <textarea
                    id="customer-observation"
                    className="form-control"
                    rows={3}
                    value={currentTab.observation ?? ""}
                    onChange={(event) =>
                      setCurrentTab((tab) =>
                        tab ? { ...tab, observation: event.target.value } : tab
                      )
                    }
                    placeholder="Adicione uma observação para esta conta"
                  />
                  {!currentTab.isTabOpen && (
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm mt-2"
                      onClick={saveObservation}
                      disabled={isSavingObservation}
                    >
                      {isSavingObservation ? "Salvando..." : "Salvar observação"}
                    </button>
                  )}
                </div>
                {currentTab.isTabOpen && (
                  <div className="card-body border-top">
                    <fieldset>
                      <legend className="fs-6 fw-bold">Forma de pagamento</legend>
                      <div className="d-flex flex-wrap gap-3">
                        {[
                          ["card", "Maquineta", "bi-credit-card"],
                          ["cash", "Dinheiro", "bi-cash-stack"],
                          ["split", "Dividido", "bi-arrow-left-right"],
                        ].map(([value, label, icon]) => (
                          <div className="form-check" key={value}>
                            <input
                              id={`payment-${value}`}
                              className="form-check-input"
                              type="radio"
                              name="payment-method"
                              value={value}
                              checked={paymentMethod === value}
                              onChange={() => {
                                setPaymentMethod(value);
                                if (value === "split") {
                                  setSplitCashAmount(
                                    (Number(currentTab.totalAmount ?? 0) / 2).toFixed(2)
                                  );
                                }
                              }}
                            />
                            <label className="form-check-label" htmlFor={`payment-${value}`}>
                              <i className={`bi ${icon} me-1`} aria-hidden="true" />
                              {label}
                            </label>
                          </div>
                        ))}
                      </div>
                      {paymentMethod === "split" && (
                        <div className="row align-items-end mt-3">
                          <div className="col-12 col-sm-6">
                            <label htmlFor="split-cash-amount" className="form-label">
                              Valor em dinheiro
                            </label>
                            <input
                              ref={splitCashInputRef}
                              id="split-cash-amount"
                              type="text"
                              inputMode="decimal"
                              className="form-control"
                              value={splitCashAmount}
                              onChange={(event) => setSplitCashAmount(event.target.value)}
                              aria-invalid={!isSplitPaymentValid}
                            />
                          </div>
                          <div className="col-12 col-sm-6 mt-3 mt-sm-0">
                            <span className="form-label d-block">Valor na maquineta</span>
                            <strong>
                              {formatCurrency((totalDueCents - splitCashCents) / 100)}
                            </strong>
                          </div>
                          {!isSplitPaymentValid && (
                            <div className="col-12">
                              <div className="form-text text-danger">
                                Informe um valor em dinheiro maior que zero e menor que o total.
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </fieldset>
                  </div>
                )}
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
                    <button
                      className="btn btn-success btn-lg px-5 shadow-sm"
                      onClick={closeTab}
                      disabled={isProcessingPayment || !isSplitPaymentValid}
                    >
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
              {returnItemError && (
                <div className="alert alert-danger alert-dismissible mt-3" role="alert">
                  <strong>Erro ao remover item:</strong> {returnItemError}
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Fechar mensagem de erro"
                    onClick={() => setReturnItemError("")}
                  />
                </div>
              )}
              {paidTodayItems.length > 0 && (
                <section className="card shadow-sm border-0 mt-4">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">Itens comprados hoje e já pagos</h5>
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
                        {paidTodayItems.map((item) => (
                          <tr key={`${item.productId}-${item.unitPrice}-${item.productName}`}>
                            <td className="ps-4 fw-bold">{item.productName}</td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-end">{formatCurrency(item.unitPrice)}</td>
                            <td className="text-end pe-4">{formatCurrency(item.subTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="card-footer d-flex justify-content-between align-items-center">
                    <strong>Total já pago hoje</strong>
                    <strong className="text-success">{formatCurrency(paidTodayTotal)}</strong>
                  </div>
                </section>
              )}
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
