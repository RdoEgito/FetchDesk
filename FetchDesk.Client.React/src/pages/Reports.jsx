import { useEffect, useState } from "react";
import { apiGetJson, formatCurrency } from "../api";

export default function Reports() {
  const today = new Date().toISOString().slice(0, 10);
  const [reportDate, setReportDate] = useState(today);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedBuyer, setExpandedBuyer] = useState(null);

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGetJson(`/reports/daily?date=${reportDate}`);
        setReport(data);
      } catch (err) {
        setError("Não foi possível carregar o relatório. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [reportDate]);

  const getConsolidatedItemsForBuyer = (buyer) => {
    if (!buyer.orders) return [];
    const map = new Map();
    for (const order of buyer.orders) {
      for (const item of order.items || []) {
        const key = `${item.productId}__${item.unitPrice}__${item.productName}`;
        if (!map.has(key)) {
          map.set(key, {
            productId: item.productId,
            productName: item.productName,
            quantity: 0,
            unitPrice: item.unitPrice,
            subTotal: 0,
          });
        }
        const entry = map.get(key);
        entry.quantity += 1;
        entry.subTotal += item.unitPrice;
      }
    }
    return Array.from(map.values());
  };

  const copyPurchaseDetails = async (buyer, consolidatedItems, totalAmount) => {
    const lines = consolidatedItems.map(item => 
      `${item.quantity} ${item.productName} - R$${item.subTotal.toFixed(2)}`
    );
    lines.push(`*Total - R$${totalAmount.toFixed(2)}*`);
    
    const text = lines.join('\n');
    
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here if desired
      alert('Detalhes da compra copiados para a área de transferência!');
    } catch (err) {
      console.error('Falha ao copiar: ', err);
      alert('Erro ao copiar para a área de transferência');
    }
  };

  const getIsPaidForBuyer = (buyer) => {
    if (!buyer.orders || buyer.orders.length === 0) return false;
    return buyer.orders.some(order => order.isPaid);
  };

  return (
    <div className="container py-3">
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4">
        <div>
          <h1 className="mb-1">Relatórios</h1>
          <p className="text-muted mb-0">Visão diária de vendas por comprador e por item.</p>
        </div>

        <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
          <label htmlFor="reportDate" className="mb-0 text-muted">
            Dia
          </label>
          <input
            id="reportDate"
            type="date"
            className="form-control"
            value={reportDate}
            onChange={(event) => setReportDate(event.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="alert alert-info">Carregando relatório...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : report ? (
        <>
          <div className="row gy-3 mb-4">
            <div className="col-12 col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Total de pedidos</h5>
                  <p className="display-6 mb-0">{report.totalOrders}</p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Total de itens</h5>
                  <p className="display-6 mb-0">{report.totalItems}</p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Receita</h5>
                  <p className="display-6 mb-0">{formatCurrency(report.totalRevenue)}</p>
                </div>
              </div>
            </div>
          </div>

          {report.totalOrders === 0 ? (
            <div className="alert alert-secondary">Nenhum pedido encontrado para esta data.</div>
          ) : (
            <>
              <section className="mb-5">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 className="h5 mb-0">Vendas por comprador</h2>
                  <span className="text-muted">{report.date}</span>
                </div>
                <div className="table-responsive">
                  <table className="table table-striped table-sm">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Comprador</th>
                        <th className="text-end">Receita</th>
                        <th className="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.buyers.map((buyer) => {
                        const isPaid = getIsPaidForBuyer(buyer);
                        const isExpanded = expandedBuyer === buyer.buyerName;
                        const consolidatedItems = getConsolidatedItemsForBuyer(buyer);
                        const totalAmount = consolidatedItems.reduce((sum, item) => sum + item.subTotal, 0);
                        
                        return (
                          <tbody key={buyer.buyerName}>
                            <tr 
                              onClick={() => setExpandedBuyer(isExpanded ? null : buyer.buyerName)}
                              style={{ cursor: 'pointer' }}
                              className={isPaid ? 'table-success' : 'table-danger'}
                            >
                              <td style={{ width: '30px' }} className="text-center">
                                <i className={`bi bi-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                              </td>
                              <td>
                                <strong>{buyer.buyerName}</strong>
                              </td>
                              <td className="text-end">{formatCurrency(buyer.revenue)}</td>
                              <td className="text-center">
                                <span className={`badge ${isPaid ? 'bg-success' : 'bg-danger'}`}>
                                  {isPaid ? 'Pago' : 'Não Pago'}
                                </span>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr>
                                <td colSpan={4} className="p-3">
                                  <div className="card border-0 shadow-sm">
                                    <div className="card-body p-0">
                                      <table className="table table-sm mb-0">
                                        <thead className="table-light">
                                          <tr>
                                            <th className="ps-3">Produto</th>
                                            <th className="text-center">Qtd</th>
                                            <th className="text-end">V. Unitário</th>
                                            <th className="text-end pe-3">Subtotal</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {consolidatedItems.map((item) => (
                                            <tr key={`${item.productId}-${item.unitPrice}`}>
                                              <td className="ps-3">{item.productName}</td>
                                              <td className="text-center">{item.quantity}</td>
                                              <td className="text-end">{formatCurrency(item.unitPrice)}</td>
                                              <td className="text-end pe-3">{formatCurrency(item.subTotal)}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                    <div className="card-footer bg-light p-3 d-flex justify-content-between align-items-center">
                                      <span className="text-muted fw-bold">Total:</span>
                                      <div className="d-flex align-items-center gap-2">
                                        <button 
                                          className="btn btn-outline-secondary btn-sm"
                                          onClick={() => copyPurchaseDetails(buyer, consolidatedItems, totalAmount)}
                                          title="Copiar detalhes da compra"
                                        >
                                          <i className="bi bi-clipboard"></i>
                                        </button>
                                        <h5 className="mb-0 fw-bold text-primary">{formatCurrency(totalAmount)}</h5>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 className="h5 mb-0">Itens vendidos</h2>
                  <span className="text-muted">{report.date}</span>
                </div>
                <div className="table-responsive">
                  <table className="table table-striped table-sm">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th className="text-end">Quantidade</th>
                        <th className="text-end">Receita</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.products.map((product) => (
                        <tr key={product.productId}>
                          <td>{product.productName}</td>
                          <td className="text-end">{product.quantity}</td>
                          <td className="text-end">{formatCurrency(product.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </>
      ) : null}
    </div>
  );
}
