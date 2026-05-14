import { useEffect, useState } from "react";
import { apiGetJson, formatCurrency } from "../api";

export default function Reports() {
  const today = new Date().toISOString().slice(0, 10);
  const [reportDate, setReportDate] = useState(today);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
                        <th>Comprador</th>
                        <th className="text-end">Pedidos</th>
                        <th className="text-end">Receita</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.buyers.map((buyer) => (
                        <tr key={buyer.buyerName}>
                          <td>{buyer.buyerName}</td>
                          <td className="text-end">{buyer.orderCount}</td>
                          <td className="text-end">{formatCurrency(buyer.revenue)}</td>
                        </tr>
                      ))}
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
