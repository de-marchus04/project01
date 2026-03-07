"use client";
import { useState, useEffect } from "react";
import { useLanguage } from "@/shared/i18n/LanguageContext";
import { getOrders, updateOrderStatus, deleteOrder, Order } from "@/shared/api/userApi";
import { modalService } from "@/shared/ui/Modal/modalService";
import { formatPrice } from "@/shared/lib/formatPrice";

type Props = {
  showToast: (msg: string, type?: 'success' | 'error') => void;
  onOrdersLoaded: (orders: Order[]) => void;
};

export default function OrdersTab({ showToast, onOrdersLoaded }: Props) {
  const { lang, t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
      onOrdersLoaded(data);
    } catch (e) { console.error(e); }
  };

  const translateStatus = (s: string) => {
    if (s === 'В обработке') return t.admin.statusProcessing;
    if (s === 'Принята') return t.admin.statusAccepted;
    if (s === 'Отклонена') return t.admin.statusRejected;
    return s;
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try { await updateOrderStatus(id, newStatus); await loadOrders(); }
    catch (e) { console.error(e); await modalService.alert("", t.admin.errUpdateStatus); }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!(await modalService.confirm("", t.admin.confirmDelOrder))) return;
    try { await deleteOrder(id); await loadOrders(); }
    catch (e) { console.error(e); await modalService.alert("", t.admin.errDelOrder); }
  };

  return (
    <section className="card border-0 p-4" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <h3 className="h5 fw-bold mb-4" style={{ color: 'var(--color-text)' }}>{t.admin.inRequests}</h3>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>{t.admin.colDate}</th>
              <th>{t.admin.colClient}</th>
              <th>{t.admin.colProduct}</th>
              <th>{t.admin.colAmount}</th>
              <th>{t.admin.colStatus}</th>
              <th className="text-end">{t.admin.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.date}</td>
                <td>
                  {order.customerName || t.admin.unknownClient}
                  {order.userId && <span className="badge bg-light ms-2 border" style={{ color: 'var(--color-text)' }}>{t.admin.colRegistered}</span>}
                  {!order.userId && <span className="badge bg-light ms-2 border" style={{ color: 'var(--color-text-muted)' }}>{t.admin.colGuest}</span>}
                </td>
                <td>{order.productName}</td>
                <td>{formatPrice(order.price, lang)}</td>
                <td>
                  <span className={`badge ${order.status === 'Принята' ? 'bg-success' : order.status === 'Отклонена' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                    {translateStatus(order.status)}
                  </span>
                </td>
                <td className="text-end">
                  <select
                    className="form-select form-select-sm d-inline-block w-auto me-2"
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  >
                    <option value="В обработке">{t.admin.statusProcessing}</option>
                    <option value="Принята">{t.admin.statusAcceptLabel}</option>
                    <option value="Отклонена">{t.admin.statusRejectLabel}</option>
                  </select>
                  {(order.status === 'Принята' || order.status === 'Отклонена') && (
                    <button
                      className="btn btn-sm btn-outline-danger border-0"
                      onClick={() => handleDeleteOrder(order.id)}
                      title={t.admin.deleteOrderTitle}
                      style={{ transition: 'all 0.3s ease' }}
                      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#dc3545'; e.currentTarget.style.color = 'white'; }}
                      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#dc3545'; }}
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="text-center py-4" style={{ color: 'var(--color-text-muted)' }}>{t.admin.noOrders}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
