import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Layers, AlertCircle, X, Check } from 'lucide-react';
import { categoryAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    isActive: true,
    displayOrder: 0
  });

  const { showToast } = useToast();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryAPI.getAll({ includeInactive: 'true' });
      if (res.data?.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', image: '', isActive: true, displayOrder: categories.length + 1 });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '',
      isActive: cat.isActive !== undefined ? cat.isActive : true,
      displayOrder: cat.displayOrder || 0
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    try {
      if (editingCategory) {
        const res = await categoryAPI.update(editingCategory._id, formData);
        if (res.data?.success) {
          showToast('Category updated successfully', 'success');
          setIsModalOpen(false);
          fetchCategories();
        }
      } else {
        const res = await categoryAPI.create(formData);
        if (res.data?.success) {
          showToast('Category created successfully', 'success');
          setIsModalOpen(false);
          fetchCategories();
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (cat) => {
    if (cat.productCount > 0) {
      showToast(`Cannot delete: ${cat.productCount} active product(s) belong to "${cat.name}". Please reassign them first.`, 'error');
      return;
    }

    if (window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      try {
        const res = await categoryAPI.delete(cat._id);
        if (res.data?.success) {
          showToast('Category deleted successfully', 'success');
          fetchCategories();
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="pre-heading">TAXONOMY & DISCIPLINES</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
            Categories & Collections
          </h1>
        </div>

        <button type="button" onClick={openCreateModal} className="btn-dark" style={{ padding: '0.75rem 1.5rem', fontSize: '0.85rem' }}>
          <Plus size={16} />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="custom-table-wrap">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Image</th>
              <th>Category Name</th>
              <th>Slug</th>
              <th>Description</th>
              <th>Editions Assigned</th>
              <th>Order</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem' }}>
                  Loading categories...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No categories created yet.
                </td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c._id}>
                  <td>
                    <img
                      src={c.image || '/uploads/prod-mushroom-wood.jpg'}
                      alt={c.name}
                      style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '2px', backgroundColor: '#F8F5F0' }}
                    />
                  </td>
                  <td style={{ fontWeight: 600, fontFamily: 'var(--font-serif)', fontSize: '1.05rem' }}>
                    {c.name}
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {c.slug}
                  </td>
                  <td style={{ maxWidth: '280px', fontSize: '0.82rem', color: 'var(--text-body)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {c.description || '—'}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{c.productCount || 0} Products</span>
                  </td>
                  <td>{c.displayOrder || 0}</td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: c.isActive ? '#16A34A' : '#9CA3AF' }}>
                      {c.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => openEditModal(c)}
                        style={{ padding: '0.4rem', backgroundColor: '#F5F2EA', borderRadius: '2px', cursor: 'pointer' }}
                        title="Edit"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c)}
                        style={{ padding: '0.4rem', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '2px', cursor: 'pointer' }}
                        title="Delete"
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
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
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              padding: '2.5rem',
              maxWidth: '520px',
              width: '100%',
              boxShadow: 'var(--shadow-lg)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem' }}>
                {editingCategory ? 'Edit Category' : 'Create Category Discipline'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sculptural Sconces"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Curatorial Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Briefly describe this design collection..."
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="/uploads/hero-slide-1.jpg or external CDN URL"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginTop: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      style={{ accentColor: 'var(--text-main)', width: '16px', height: '16px' }}
                    />
                    <span>Active in Catalog</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1rem' }}>
                <button type="button" className="btn-outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-dark">
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
