import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { apiFetch, apiGetJson, getApiBaseUrl } from "../api";
import "../styles/delivery-board.css";

export default function DeliveryBoard() {
  const [hubConnection, setHubConnection] = useState(null);
  const [pendingItems, setPendingItems] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  const isConnected = Boolean(hubConnection?.connected);

  async function loadPendingItemsAsync() {
    try {
      const response = await apiGetJson("/items");
      setPendingItems(response?.ordersItems ?? []);
    } catch {
      // mesmo comportamento do projeto original
    }
  }

  async function refreshQueueAsync() {
    setIsRefreshing(true);
    await Promise.all([
      new Promise((resolve) => setTimeout(resolve, 2000)),
      loadPendingItemsAsync(),
    ]);
    setIsRefreshing(false);
    setIsFlashing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsFlashing(false);
  }

  async function markAsDelivered(itemId) {
    setPendingItems((current) =>
      current.map((item) => (item.itemId === itemId ? { ...item, isDelivered: true } : item))
    );
    try {
      const response = await apiFetch(`/items/${itemId}/deliver`, { method: "PATCH" });
      if (!response.ok) {
        setPendingItems((current) =>
          current.map((item) => (item.itemId === itemId ? { ...item, isDelivered: false } : item))
        );
      }
    } catch {
      setPendingItems((current) =>
        current.map((item) => (item.itemId === itemId ? { ...item, isDelivered: false } : item))
      );
    }
  }

  async function revertDelivery(itemId) {
    setPendingItems((current) =>
      current.map((item) => (item.itemId === itemId ? { ...item, isDelivered: false } : item))
    );
    try {
      const response = await apiFetch(`/items/${itemId}/deliver/revert`, { method: "PATCH" });
      if (!response.ok) {
        setPendingItems((current) =>
          current.map((item) => (item.itemId === itemId ? { ...item, isDelivered: true } : item))
        );
      }
    } catch {
      setPendingItems((current) =>
        current.map((item) => (item.itemId === itemId ? { ...item, isDelivered: true } : item))
      );
    }
  }

  const groupedItems = useMemo(() => {
    const map = new Map();
    for (const item of pendingItems) {
      const name = item.customerName?.trim() ? item.customerName : "Unknown Name";
      if (!map.has(name)) {
        map.set(name, []);
      }
      map.get(name).push(item);
    }
    return Array.from(map.entries());
  }, [pendingItems]);

  useEffect(() => {
    loadPendingItemsAsync();

    const connection = io(getApiBaseUrl(), {
      path: "/orderhub",
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    connection.on("ReceiveNewItems", (newItems) => {
      setPendingItems((current) => [...current, ...newItems]);
    });

    connection.on("ItemCancelled", (cancelledItemId) => {
      setPendingItems((current) => current.filter((item) => item.itemId !== cancelledItemId));
    });

    setHubConnection(connection);

    return () => {
      connection.disconnect();
    };
  }, []);

  return (
    <div className="container-fluid p-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Fila de Entrega</h2>
        <button className="btn btn-outline-secondary shadow-sm" onClick={refreshQueueAsync} disabled={isRefreshing}>
          {isRefreshing ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              <span className="ms-1">Atualizando...</span>
            </>
          ) : (
            <>
              <i className="bi bi-arrow-clockwise me-1" /> <span>Atualizar Fila</span>
            </>
          )}
        </button>
      </div>

      {!isConnected ? <div className="alert alert-warning shadow-sm">Conectando ao servidor em tempo real...</div> : null}

      {pendingItems.length === 0 ? (
        <div className="alert alert-success text-center shadow-sm fs-5">
          Nenhum item pendente no momento. Bom trabalho!
        </div>
      ) : (
        <div className={`row ${isFlashing ? "flash-update" : ""}`}>
          <div className="col-12 col-md-8 col-lg-6">
            {groupedItems.map(([customerName, items]) => (
              <div key={customerName} className="card mb-4 shadow-sm border-0">
                <div className="card-header bg-primary text-white py-2">
                  <h5 className="mb-0">
                    <i className="bi bi-person-fill me-2" />
                    {customerName}
                  </h5>
                </div>
                <ul className="list-group list-group-flush">
                  {items
                    .slice()
                    .sort((a, b) => Number(a.isDelivered) - Number(b.isDelivered))
                    .map((item) => (
                      <li
                        key={item.itemId}
                        className={`list-group-item d-flex justify-content-between align-items-center p-3 item-row ${
                          item.isDelivered ? "item-delivered" : "hover-bg-light"
                        }`}
                      >
                        <div>
                          <strong className={`fs-5 d-block ${item.isDelivered ? "text-strikethrough" : ""}`}>
                            {item.productName}
                          </strong>
                          <span className="text-muted small">Ficha: {item.itemId.slice(0, 8)}</span>
                        </div>
                        <div className="d-flex gap-2 align-items-center">
                          {item.isDelivered ? (
                            <button
                              className="btn btn-sm btn-outline-warning rounded-circle px-2"
                              title="Desfazer entrega"
                              onClick={() => revertDelivery(item.itemId)}
                            >
                              <i className="bi bi-arrow-counterclockwise" />
                            </button>
                          ) : null}
                          <button
                            className={`btn btn-sm px-3 rounded-pill fw-bold ${
                              item.isDelivered ? "btn-secondary" : "btn-outline-success"
                            }`}
                            onClick={() => markAsDelivered(item.itemId)}
                            disabled={item.isDelivered}
                          >
                            {item.isDelivered ? "Entregue" : "Entregar"}
                          </button>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
