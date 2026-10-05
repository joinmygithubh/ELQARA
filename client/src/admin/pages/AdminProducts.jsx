import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Eye, ToggleLeft, ToggleRight, Check, X, AlertTriangle } from 'lucide-react';
import { productAPI, categoryAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  const { showToast } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        adminView: 'true',
        limit: 100,
        sort: 'newest'
      };
      if (search) params.search = search;
      if (selectedCat !== 'all') params.category = selectedCat;

      const [prodRes, catRes] = await Promise.all([
        productAPI.getAll(params),
        categoryAPI.getAll({ includeInactive: 'true' })
      ]);

      if (prodRes.data?.success) setProducts(prodRes.data.products);
      if (catRes.data?.success) setCategories(catRes.data.categories);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCat]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleToggleStatus = async (product) => {
    try {
      const res = await productAPI.toggleStatus(product._id);
      if (res.data?.success) {
        showToast(res.data.message, 'success');
        setProducts((prev) =>
          prev.map((p) => (p._id === product._id ? { ...p, status: res.data.status } : p))
        );
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      const res = await productAPI.delete(deleteCandidate._id);
      if (res.data?.success) {
        showToast('Product edition deleted successfully', 'success');
        setProducts((prev) => prev.filter((p) => p._id !== deleteCandidate._id));
        setDeleteCandidate(null);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const formatPrice = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt || 0);
  };

  return (
    <div>
      {/* Title & Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="pre-heading">CATALOG INVENTORY</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
            Products & Handcrafted Editions
          </h1>
        </div>

        <Link to="/admin/products/new" className="btn-dark" style={{ padding: '0.75rem 1.5rem', fontSize: '0.85rem' }}>
          <Plus size={16} />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter / Search Bar */}
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
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flex: 1, minWidth: '260px' }}>
          <input
            type="text"
            placeholder="Search by name, SKU, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              padding: '0.65rem 0.85rem',
              border: '1px solid var(--border-medium)',
              borderRight: 'none',
              outline: 'none',
              fontSize: '0.85rem'
            }}
          />
          <button
            type="submit"
            className="btn-dark"
            style={{ padding: '0.65rem 1rem', fontSize: '0.8rem', borderRadius: '0' }}
          >
            <Search size={15} />
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Category:</span>
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            style={{
              padding: '0.65rem 1rem',
              border: '1px solid var(--border-medium)',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.85rem'
            }}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="custom-table-wrap">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Image</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>SKU</th>
              <th>Price / MRP</th>
              <th>Stock</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem' }}>
                  Loading catalog editions...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No products found. Click "Add New Product" to create your first edition.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <img
                      src={p.thumbnail || (p.images && p.images[0]) || '/logo-icon.svg'}
                      alt={p.name}
                      style={{
                        width: '46px',
                        height: '46px',
                        objectFit: 'cover',
                        borderRadius: '2px',
                        backgroundColor: '#F8F5F0'
                      }}
                    />
                  </td>
                  <td>
                    <Link
                      to={`/product/${p.slug}`}
                      target="_blank"
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.05rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        display: 'block'
                      }}
                    >
                      {p.name}
                    </Link>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                      {p.featured && (
                        <span style={{ fontSize: '0.65rem', background: '#FEF3C7', color: '#92400E', padding: '1px 5px', borderRadius: '2px' }}>
                          Featured
                        </span>
                      )}
                      {p.bestSeller && (
                        <span style={{ fontSize: '0.65rem', background: '#DCFCE7', color: '#166534', padding: '1px 5px', borderRadius: '2px' }}>
                          Best Seller
                        </span>
                      )}
                      {p.newArrival && (
                        <span style={{ fontSize: '0.65rem', background: '#DBEAFE', color: '#1E40AF', padding: '1px 5px', borderRadius: '2px' }}>
                          New
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{p.category?.name || p.categoryName || 'Unassigned'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.sku}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{formatPrice(p.price)}</div>
                    {p.mrp > p.price && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                        {formatPrice(p.mrp)} (-{p.discount}%)
                      </div>
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        fontWeight: 600,
                        color: p.stock <= 5 ? '#DC2626' : 'var(--text-main)'
                      }}
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(p)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.25rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        backgroundColor: p.status === 'active' ? '#DCFCE7' : '#F3F4F6',
                        color: p.status === 'active' ? '#166534' : '#6B7280',
                        cursor: 'pointer'
                      }}
                    >
                      {p.status === 'active' ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <Link
                        to={`/admin/products/edit/${p._id}`}
                        style={{
                          padding: '0.4rem',
                          color: 'var(--text-main)',
                          backgroundColor: '#F5F2EA',
                          borderRadius: '2px'
                        }}
                        title="Edit Product"
                      >
                        <Edit2 size={15} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteCandidate(p)}
                        style={{
                          padding: '0.4rem',
                          color: '#DC2626',
                          backgroundColor: '#FEE2E2',
                          borderRadius: '2px',
                          cursor: 'pointer'
                        }}
                        title="Delete Product"
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

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(25, 22, 20, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            zIndex: 3500
          }}
          onClick={() => setDeleteCandidate(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              padding: '2.5rem',
              maxWidth: '460px',
              width: '100%',
              boxShadow: 'var(--shadow-lg)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#DC2626', marginBottom: '1rem' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--text-main)' }}>
                Confirm Deletion
              </h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: 1.6, marginBottom: '2rem' }}>
              Are you certain you wish to delete "<strong>{deleteCandidate.name}</strong>"? This action is irreversible and will remove this piece from customer storefronts.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
              <button
                type="button"
                className="btn-outline"
                onClick={() => setDeleteCandidate(null)}
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.8rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                style={{
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  padding: '0.65rem 1.4rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 'var(--radius-xs)',
                  cursor: 'pointer'
                }}
              >
                Delete Edition
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
