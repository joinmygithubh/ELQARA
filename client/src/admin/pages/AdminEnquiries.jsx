import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Eye,
  Trash2,
  Mail,
  Phone,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  X,
  Filter,
  Save,
  Send,
  Sparkles
} from 'lucide-react';
import { enquiryAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [stats, setStats] = useState({ totalAll: 0, new: 0, contacted: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updatingNotes, setUpdatingNotes] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const { showToast } = useToast();

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;

      const res = await enquiryAPI.getAllAdmin(params);
      if (res.data?.success) {
        setEnquiries(res.data.enquiries || []);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load enquiries', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEnquiries();
  };

  const handleStatusChange = async (enquiryId, newStatus) => {
    try {
      const res = await enquiryAPI.updateStatus(enquiryId, { status: newStatus });
      if (res.data?.success) {
        showToast(`Enquiry status changed to ${newStatus}`, 'success');
        setEnquiries((prev) =>
          prev.map((item) => (item._id === enquiryId ? { ...item, status: newStatus } : item))
        );
        if (selectedEnquiry && selectedEnquiry._id === enquiryId) {
          setSelectedEnquiry((prev) => ({ ...prev, status: newStatus }));
        }
        // Update stats
        fetchEnquiries();
      }
    } catch (err) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedEnquiry) return;
    setUpdatingNotes(true);
    try {
      const res = await enquiryAPI.updateStatus(selectedEnquiry._id, { adminNotes });
      if (res.data?.success) {
        showToast('Admin notes saved successfully', 'success');
        setSelectedEnquiry((prev) => ({ ...prev, adminNotes }));
        setEnquiries((prev) =>
          prev.map((item) => (item._id === selectedEnquiry._id ? { ...item, adminNotes } : item))
        );
      }
    } catch (err) {
      showToast(err.message || 'Failed to save notes', 'error');
    } finally {
      setUpdatingNotes(false);
    }
  };

  const handleDelete = async (enquiryId) => {
    try {
      const res = await enquiryAPI.delete(enquiryId);
      if (res.data?.success) {
        showToast('Enquiry record deleted', 'success');
        setEnquiries((prev) => prev.filter((item) => item._id !== enquiryId));
        if (selectedEnquiry && selectedEnquiry._id === enquiryId) {
          setSelectedEnquiry(null);
        }
        setDeleteConfirmId(null);
        fetchEnquiries();
      }
    } catch (err) {
      showToast(err.message || 'Deletion failed', 'error');
    }
  };

  const openDetails = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setAdminNotes(enquiry.adminNotes || '');
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    try {
      return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(iso));
    } catch {
      return new Date(iso).toLocaleDateString();
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'New':
        return { backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' };
      case 'Contacted':
        return { backgroundColor: '#E0E7FF', color: '#3730A3', border: '1px solid #C7D2FE' };
      case 'Resolved':
        return { backgroundColor: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0' };
      default:
        return { backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' };
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <span className="pre-heading">ATELIER CORRESPONDENCE</span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
          Customer Enquiries & Bespoke Commissions
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.4rem' }}>
          Real-time customer inquiries routed to <strong>elqara.home@gmail.com</strong> and archived in MongoDB.
        </p>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}
      >
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-hairline)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Total Inquiries
          </span>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--text-main)', marginTop: '0.4rem' }}>
            {stats.totalAll || enquiries.length}
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-hairline)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              New / Pending
            </span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#D97706' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: '#92400E', marginTop: '0.4rem' }}>
            {stats.new || enquiries.filter((e) => e.status === 'New').length}
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-hairline)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3730A3', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              In Discussion
            </span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4F46E5' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: '#3730A3', marginTop: '0.4rem' }}>
            {stats.contacted || enquiries.filter((e) => e.status === 'Contacted').length}
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-hairline)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Resolved
            </span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: '#166534', marginTop: '0.4rem' }}>
            {stats.resolved || enquiries.filter((e) => e.status === 'Resolved').length}
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '1.25rem',
          border: '1px solid var(--border-hairline)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '1.75rem'
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flex: '1 1 300px' }}>
          <input
            type="text"
            placeholder="Search by customer name, email, piece name, or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              padding: '0.65rem 0.85rem',
              border: '1px solid var(--border-medium)',
              borderRight: 'none',
              outline: 'none',
              fontSize: '0.85rem',
              borderRadius: '4px 0 0 4px'
            }}
          />
          <button type="submit" className="btn-dark" style={{ padding: '0.65rem 1rem', borderRadius: '0 4px 4px 0' }} aria-label="Search enquiries">
            <Search size={15} />
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Filter size={15} color="var(--text-muted)" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.65rem 0.85rem',
              border: '1px solid var(--border-medium)',
              borderRadius: '4px',
              fontSize: '0.85rem',
              backgroundColor: '#FFFFFF',
              outline: 'none'
            }}
          >
            <option value="">All Statuses</option>
            <option value="New">New Only</option>
            <option value="Contacted">Contacted Only</option>
            <option value="Resolved">Resolved Only</option>
          </select>

          <button
            type="button"
            className="btn-outline"
            onClick={fetchEnquiries}
            style={{ padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Refresh Inquiries"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Enquiries Table */}
      <div className="custom-table-wrap">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Referenced Piece / Subject</th>
              <th>Enquiry Message</th>
              <th>Email Notification</th>
              <th>Status</th>
              <th>Submitted</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>
                  Loading customer enquiries...
                </td>
              </tr>
            ) : enquiries.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No customer enquiries found matching current filters.
                </td>
              </tr>
            ) : (
              enquiries.map((item) => (
                <tr key={item._id}>
                  {/* Customer Info */}
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <a href={`mailto:${item.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {item.email}
                      </a>
                    </div>
                    {item.phone && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', marginTop: '2px' }}>
                        <a href={`tel:${item.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {item.phone}
                        </a>
                      </div>
                    )}
                  </td>

                  {/* Piece / Subject */}
                  <td style={{ maxWidth: '200px' }}>
                    {item.productName ? (
                      <div>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'block' }}>
                          {item.productName}
                        </strong>
                        {item.productSku && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            SKU: {item.productSku}
                          </span>
                        )}
                        {item.quantity > 1 && (
                          <span style={{ fontSize: '0.72rem', color: '#166534', marginLeft: '6px' }}>
                            ({item.quantity} units)
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>
                        {item.subject || 'General Inquiry'}
                      </span>
                    )}
                  </td>

                  {/* Message Preview */}
                  <td style={{ maxWidth: '240px' }}>
                    <div
                      style={{
                        fontSize: '0.82rem',
                        color: 'var(--text-body)',
                        lineHeight: 1.4,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}
                      title={item.message}
                    >
                      {item.message}
                    </div>
                  </td>

                  {/* Notification Status */}
                  <td>
                    {item.emailSent ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.75rem',
                          color: '#166534',
                          fontWeight: 600
                        }}
                      >
                        <CheckCircle2 size={13} color="#16A34A" />
                        Delivered
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.75rem',
                          color: '#B91C1C',
                          fontWeight: 500
                        }}
                        title={item.emailDeliveryError || 'Notification pending dispatch'}
                      >
                        <AlertCircle size={13} color="#DC2626" />
                        Logged in DB
                      </span>
                    )}
                  </td>

                  {/* Status Dropdown */}
                  <td>
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item._id, e.target.value)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        outline: 'none',
                        ...getStatusBadgeStyle(item.status)
                      }}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </td>

                  {/* Date */}
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {formatDate(item.createdAt)}
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => openDetails(item)}
                        style={{
                          padding: '6px',
                          background: 'none',
                          border: '1px solid var(--border-hairline)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: 'var(--text-body)'
                        }}
                        title="View Full Details"
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(item._id)}
                        style={{
                          padding: '6px',
                          background: 'none',
                          border: '1px solid var(--border-hairline)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#DC2626'
                        }}
                        title="Delete Enquiry"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Full Enquiry Detail Modal */}
      {selectedEnquiry && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedEnquiry(null);
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              maxWidth: '640px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-xl)',
              padding: '2rem',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <span className="pre-heading" style={{ marginBottom: '4px' }}>
                  ENQUIRY DOSSIER
                </span>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', margin: 0 }}>
                  {selectedEnquiry.name}
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Submitted on {formatDate(selectedEnquiry.createdAt)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Quick Status Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                backgroundColor: '#FAF7F2',
                borderRadius: '4px',
                border: '1px solid var(--border-hairline)',
                marginBottom: '1.5rem'
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Workflow Status:</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['New', 'Contacted', 'Resolved'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusChange(selectedEnquiry._id, st)}
                    style={{
                      padding: '0.35rem 0.8rem',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      border: selectedEnquiry.status === st ? '2px solid #1C1917' : '1px solid var(--border-medium)',
                      backgroundColor: selectedEnquiry.status === st ? '#1C1917' : '#FFFFFF',
                      color: selectedEnquiry.status === st ? '#FFFFFF' : 'var(--text-body)'
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Details Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1.5rem',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-hairline)',
                padding: '1.25rem',
                borderRadius: '4px'
              }}
            >
              <div>
                <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Email Address
                </label>
                <a
                  href={`mailto:${selectedEnquiry.email}?subject=Re:%20ELQARA%20Enquiry%20%E2%80%94%20${encodeURIComponent(selectedEnquiry.productName || selectedEnquiry.subject)}`}
                  style={{ color: 'var(--accent-gold)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <Mail size={14} />
                  <span>{selectedEnquiry.email}</span>
                </a>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Telephone / WhatsApp
                </label>
                {selectedEnquiry.phone ? (
                  <a
                    href={`tel:${selectedEnquiry.phone}`}
                    style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <Phone size={14} />
                    <span>{selectedEnquiry.phone}</span>
                  </a>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Not provided</span>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Preferred Channel
                </label>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedEnquiry.preferredContact || 'Email'}</span>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Delivery Destination
                </label>
                <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600 }}>elqara.home@gmail.com</span>
              </div>
            </div>

            {/* Referenced Product (if any) */}
            {selectedEnquiry.productName && (
              <div
                style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  backgroundColor: '#FAF7F2',
                  borderRadius: '4px',
                  border: '1px solid var(--border-hairline)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Referenced Piece
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)', marginTop: '2px' }}>
                    {selectedEnquiry.productName}
                  </div>
                  {selectedEnquiry.productSku && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      SKU: {selectedEnquiry.productSku} {selectedEnquiry.quantity > 1 ? `• Quantity: ${selectedEnquiry.quantity}` : ''}
                    </div>
                  )}
                </div>

                {selectedEnquiry.productUrl && (
                  <a
                    href={selectedEnquiry.productUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-outline"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <span>View Piece</span>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            )}

            {/* Full Message */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                Customer Inquiry Note
              </label>
              <div
                style={{
                  padding: '1.25rem',
                  backgroundColor: '#FAF7F2',
                  borderLeft: '3px solid var(--accent-gold)',
                  borderRadius: '0 4px 4px 0',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  color: 'var(--text-body)',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'Georgia, serif'
                }}
              >
                {selectedEnquiry.message}
              </div>
            </div>

            {/* Internal Admin Notes */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                Internal Atelier Notes (Private to Admin)
              </label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Log discussion notes, quoted custom dimensions, or callback records here..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
              <button
                type="button"
                className="btn-outline"
                disabled={updatingNotes}
                onClick={handleSaveNotes}
                style={{ marginTop: '0.5rem', padding: '0.45rem 1rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <Save size={14} />
                <span>{updatingNotes ? 'Saving Notes...' : 'Save Internal Notes'}</span>
              </button>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-hairline)', paddingTop: '1.25rem' }}>
              <a
                href={`mailto:${selectedEnquiry.email}?subject=Re:%20ELQARA%20Enquiry%20%E2%80%94%20${encodeURIComponent(selectedEnquiry.productName || selectedEnquiry.subject)}`}
                className="btn-dark"
                style={{ padding: '0.75rem 1.5rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Send size={15} />
                <span>Reply to Customer Email</span>
              </a>

              <button
                type="button"
                onClick={() => setDeleteConfirmId(selectedEnquiry._id)}
                style={{
                  padding: '0.65rem 1rem',
                  backgroundColor: '#FEE2E2',
                  color: '#B91C1C',
                  border: '1px solid #FCA5A5',
                  borderRadius: '4px',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Alert Modal */}
      {deleteConfirmId && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '6px',
              padding: '2rem',
              maxWidth: '420px',
              width: '100%',
              textAlign: 'center',
              boxShadow: 'var(--shadow-xl)'
            }}
          >
            <AlertCircle size={44} color="#DC2626" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              Confirm Deletion
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Are you sure you want to permanently delete this customer enquiry from MongoDB? This action cannot be reversed.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn-outline"
                onClick={() => setDeleteConfirmId(null)}
                style={{ padding: '0.65rem 1.5rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                style={{
                  padding: '0.65rem 1.5rem',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEnquiries;
