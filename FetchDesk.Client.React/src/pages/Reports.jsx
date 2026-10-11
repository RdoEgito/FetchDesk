import { Fragment, useEffect, useMemo, useState } from "react";
import { apiGetJson, formatCurrency } from "../api";
import "./Reports.css";

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTodayDate = () => toDateKey(new Date());

const formatDateLabel = (date) =>
  date
    ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(
        new Date(`${date}T00:00:00`)
      )
    : null;

function ReportCalendar({ startDate, endDate, onSelectDate }) {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [datesWithOrders, setDatesWithOrders] = useState([]);
  const [calendarError, setCalendarError] = useState(null);
  const monthKey = toDateKey(visibleMonth).slice(0, 7);

  useEffect(() => {
    let active = true;
    setCalendarError(null);
    setDatesWithOrders([]);

    apiGetJson(`/reports/dates?month=${monthKey}`)
      .then((data) => {
        if (active) {
          setDatesWithOrders(data.dates);
        }
      })
      .catch(() => {
        if (active) {
          setCalendarError("Não foi possível carregar os dias com registros.");
        }
      });

    return () => {
      active = false;
    };
  }, [monthKey]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      1
    );
    const daysInMonth = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + 1,
      0
    ).getDate();
    const mondayFirstOffset = (firstDay.getDay() + 6) % 7;

    return [
      ...Array(mondayFirstOffset).fill(null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];
  }, [visibleMonth]);

  const monthLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(visibleMonth);
  const hasCompleteRange = Boolean(startDate && endDate);

  const changeMonth = (amount) => {
    setVisibleMonth((currentMonth) =>
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + amount,
        1
      )
    );
  };

  const isInRange = (date) =>
    hasCompleteRange && date >= startDate && date <= endDate;

  return (
    <div className="report-calendar card">
      <div className="card-body p-3">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            aria-label="Mês anterior"
            onClick={() => changeMonth(-1)}
          >
            <i className="bi bi-chevron-left" />
          </button>
          <strong className="text-capitalize">{monthLabel}</strong>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            aria-label="Próximo mês"
            onClick={() => changeMonth(1)}
          >
            <i className="bi bi-chevron-right" />
          </button>
        </div>

        <div className="report-calendar-grid" role="grid" aria-label={monthLabel}>
          {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => (
            <span className="report-calendar-weekday" role="columnheader" key={day}>
              {day}
            </span>
          ))}
          {calendarDays.map((day, index) => {
            if (!day) {
              return <span className="report-calendar-empty" key={`empty-${index}`} />;
            }

            const date = toDateKey(
              new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day)
            );
            const hasOrders = datesWithOrders.includes(date);
            const isSelected = date === startDate || date === endDate;
            const isToday = date === getTodayDate();
            const accessibleDate = new Intl.DateTimeFormat("pt-BR", {
              dateStyle: "full",
            }).format(new Date(`${date}T00:00:00`));

            return (
              <button
                type="button"
                role="gridcell"
                key={date}
                className={[
                  "report-calendar-day",
                  isInRange(date) && "is-in-range",
                  isSelected && "is-selected",
                  hasOrders && "has-orders",
                  isToday && "is-today",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-label={`${accessibleDate}${hasOrders ? ", com registros" : ""}`}
                aria-pressed={isSelected}
                onClick={() => onSelectDate(date)}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="small text-muted mt-3" aria-live="polite">
          {startDate && (
            <div>
              Início selecionado: <strong>{formatDateLabel(startDate)}</strong>
            </div>
          )}
          {endDate && endDate !== startDate && (
            <div>
              Fim selecionado: <strong>{formatDateLabel(endDate)}</strong>
            </div>
          )}
          {startDate && !endDate && (
            <div>Escolha a data final; a data inicial será mantida.</div>
          )}
        </div>

        <div className="small text-muted mt-3">
          <span className="report-calendar-legend-dot" />
          Dias com registros
        </div>
        {calendarError && (
          <div className="small text-danger mt-2" role="alert">
            {calendarError}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Reports() {
  const today = getTodayDate();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedBuyer, setExpandedBuyer] = useState(null);

  useEffect(() => {
    if (!startDate || !endDate) {
      setReport(null);
      setLoading(false);
      setError(null);
      return undefined;
    }

    let active = true;
    const loadReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ startDate, endDate });
        const data = await apiGetJson(`/reports/daily?${params}`);
        if (active) {
          setReport(data);
        }
      } catch (err) {
        if (active) {
          setError("Não foi possível carregar o relatório. Tente novamente.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadReport();
    return () => {
      active = false;
    };
  }, [startDate, endDate]);

  const handleSelectDate = (date) => {
    setExpandedBuyer(null);
    if (!startDate || endDate) {
      setStartDate(date);
      setEndDate("");
    } else if (date < startDate) {
      setEndDate(startDate);
      setStartDate(date);
    } else {
      setEndDate(date);
    }
  };

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
    } catch (err) {
      console.error('Falha ao copiar: ', err);
      alert('Erro ao copiar para a área de transferência');
    }
  };

  const getIsPaidForBuyer = (buyer) => {
    if (!buyer.orders || buyer.orders.length === 0) return false;
    return buyer.orders.some(order => order.isPaid);
  };

  const periodLabel = startDate === endDate
    ? startDate
    : `${startDate} a ${endDate}`;

  return (
    <div className="container py-3">
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4">
        <div>
          <h1 className="mb-1">Relatórios</h1>
          <p className="text-muted mb-0">Vendas por comprador e por item no período selecionado.</p>
        </div>

        <div className="report-period mt-3 mt-md-0">
          <div className="small text-muted mb-2">
            {endDate
              ? `Período: ${startDate} a ${endDate}`
              : `Selecione a data final (início: ${startDate})`}
          </div>
          <ReportCalendar
            startDate={startDate}
            endDate={endDate}
            onSelectDate={handleSelectDate}
          />
        </div>
      </div>

      {!endDate ? (
        <div className="alert alert-info">
          Selecione uma data no calendário para concluir o período.
        </div>
      ) : loading ? (
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
            <div className="alert alert-secondary">Nenhum pedido encontrado neste período.</div>
          ) : (
            <>
              <section className="mb-5">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 className="h5 mb-0">Vendas por comprador</h2>
                  <span className="text-muted">{periodLabel}</span>
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
                          <Fragment key={buyer.buyerName}>
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
                                            <th className="text-end">V. Unit.</th>
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
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 className="h5 mb-0">Itens vendidos</h2>
                  <span className="text-muted">{periodLabel}</span>
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
