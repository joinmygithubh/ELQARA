import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Trash2, Check, Star, Image as ImageIcon } from 'lucide-react';
import { productAPI, categoryAPI, uploadAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminProductForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: '',
    subcategory: '',
    price: '',
    mrp: '',
    discount: 0,
    sku: '',
    stock: 10,
    shortDescription: '',
    description: '',
    images: [],
    thumbnail: '',
    specifications: {
      material: 'Solid Walnut Timber & Aged Brass',
      color: 'Natural Dark Walnut',
      dimensions: '32 cm (D) x 46 cm (H)',
      weight: '2.8 kg',
      bulbType: 'E27 Warm LED Filament (Included)',
      wattage: '8W Warm White (2700K)',
      voltage: '220V - 240V AC',
      warranty: '2 Years Manufacturer Warranty'
    },
    tags: '',
    featured: false,
    bestSeller: false,
    newArrival: false,
    status: 'active'
  });

  // Direct image URL input state
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Fetch Categories & Initial Product (if Edit Mode)
  useEffect(() => {
    const initData = async () => {
      try {
        const catRes = await categoryAPI.getAll({ includeInactive: 'true' });
        if (catRes.data?.success) {
          setCategories(catRes.data.categories);
          if (!isEditMode && catRes.data.categories.length > 0) {
            setFormData((prev) => ({ ...prev, category: catRes.data.categories[0]._id }));
          }
        }

        if (isEditMode) {
          setLoading(true);
          const prodRes = await productAPI.getById(id);
          if (prodRes.data?.success) {
            const p = prodRes.data.product;
            setFormData({
              name: p.name || '',
              slug: p.slug || '',
              category: p.category?._id || p.category || '',
              subcategory: p.subcategory || '',
              price: p.price || '',
              mrp: p.mrp || '',
              discount: p.discount || 0,
              sku: p.sku || '',
              stock: p.stock !== undefined ? p.stock : 10,
              shortDescription: p.shortDescription || '',
              description: p.description || '',
              images: p.images || [],
              thumbnail: p.thumbnail || (p.images && p.images[0]) || '',
              specifications: {
                material: p.specifications?.material || '',
                color: p.specifications?.color || '',
                dimensions: p.specifications?.dimensions || '',
                weight: p.specifications?.weight || '',
                bulbType: p.specifications?.bulbType || '',
                wattage: p.specifications?.wattage || '',
                voltage: p.specifications?.voltage || '',
                warranty: p.specifications?.warranty || ''
              },
              tags: p.tags ? p.tags.join(', ') : '',
              featured: !!p.featured,
              bestSeller: !!p.bestSeller,
              newArrival: !!p.newArrival,
              status: p.status || 'active'
            });
          }
        }
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [id, isEditMode]);

  // Real-time discount calculation
  useEffect(() => {
    const priceNum = Number(formData.price);
    const mrpNum = Number(formData.mrp);
    if (mrpNum > 0 && priceNum > 0 && mrpNum > priceNum) {
      const disc = Math.round(((mrpNum - priceNum) / mrpNum) * 100);
      setFormData((prev) => ({ ...prev, discount: disc }));
    }
  }, [formData.price, formData.mrp]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSpecChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [name]: value
      }
    }));
  };

  // Handle Multi-file Upload via backend API
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadForm = new FormData();
    for (let i = 0; i < files.length; i++) {
      uploadForm.append('images', files[i]);
    }

    try {
      const res = await uploadAPI.multiple(uploadForm);
      if (res.data?.success) {
        const newUrls = res.data.urls;
        setFormData((prev) => {
          const updatedImages = [...prev.images, ...newUrls];
          return {
            ...prev,
            images: updatedImages,
            thumbnail: prev.thumbnail || updatedImages[0]
          };
        });
        showToast(`${newUrls.length} images uploaded successfully`, 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setFormData((prev) => {
      const updated = [...prev.images, imageUrlInput.trim()];
      return {
        ...prev,
        images: updated,
        thumbnail: prev.thumbnail || updated[0]
      };
    });
    setImageUrlInput('');
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => {
      const updated = prev.images.filter((_, idx) => idx !== indexToRemove);
      let newThumb = prev.thumbnail;
      if (prev.thumbnail === prev.images[indexToRemove]) {
        newThumb = updated[0] || '';
      }
      return { ...prev, images: updated, thumbnail: newThumb };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.category || !formData.price || !formData.description) {
      showToast('Please fill all required product fields', 'error');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        mrp: Number(formData.mrp) || Number(formData.price),
        stock: Number(formData.stock),
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : []
      };

      if (!payload.thumbnail && payload.images.length > 0) {
        payload.thumbnail = payload.images[0];
      }

      if (isEditMode) {
        const res = await productAPI.update(id, payload);
        if (res.data?.success) {
          showToast('Product updated successfully and live on store', 'success');
          navigate('/admin/products');
        }
      } else {
        const res = await productAPI.create(payload);
        if (res.data?.success) {
          showToast('Product created successfully and live on store', 'success');
          navigate('/admin/products');
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: '5rem' }}>
      {/* Top Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link
          to="/admin/products"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            marginBottom: '0.8rem'
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to Product List</span>
        </Link>
        <span className="pre-heading">{isEditMode ? 'MODIFY EDITION' : 'NEW ATELIER PIECE'}</span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
          {isEditMode ? `Edit: ${formData.name}` : 'Create Handcrafted Product Edition'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem' }} className="admin-form-grid">
          {/* Left Column: Core Fields & Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* 1. Basic Info */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '2rem', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '1.25rem' }}>
                1. General Information
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Sylvan Minimalist Walnut Table Lamp"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                      Category / Discipline *
                    </label>
                    <select
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)', backgroundColor: '#FFF' }}
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                      Subcategory (Optional)
                    </label>
                    <input
                      type="text"
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleInputChange}
                      placeholder="e.g. Accent Lighting"
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Short Summary Description
                  </label>
                  <input
                    type="text"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    placeholder="Brief 1-2 sentence overview for cards and quick-views"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Full Editorial Narrative & Craft Story *
                  </label>
                  <textarea
                    rows={6}
                    required
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Detail the timber seasoning, lathe handiwork, electrical components, and inspiration..."
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)', resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>

            {/* 2. Pricing & Inventory */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '2rem', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '1.25rem' }}>
                2. Pricing & Atelier Inventory
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    name="price"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="6499"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    MRP (₹)
                  </label>
                  <input
                    type="number"
                    name="mrp"
                    min="0"
                    value={formData.mrp}
                    onChange={handleInputChange}
                    placeholder="8999"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Calculated Discount (%)
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`${formData.discount}%`}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-hairline)', backgroundColor: '#FAF7F2', borderRadius: 'var(--radius-xs)', fontWeight: 600, color: 'var(--accent-terracotta)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    SKU Code
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="Auto-generated if empty (e.g. ELQ-TBL-104)"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Stock Units Available *
                  </label>
                  <input
                    type="number"
                    required
                    name="stock"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)' }}
                  />
                </div>
              </div>
            </div>

            {/* 3. Product Gallery & Images */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '2rem', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '0.4rem' }}>
                3. Product Imagery
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Upload multiple high-resolution photographs. Select a thumbnail image to represent this piece in catalog grids.
              </p>

              {/* Upload Drop Area */}
              <div
                style={{
                  border: '2px dashed var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '2rem',
                  textAlign: 'center',
                  backgroundColor: '#FAF7F2',
                  marginBottom: '1.5rem',
                  position: 'relative'
                }}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '100%',
                    height: '100%'
                  }}
                />
                <Upload size={32} color="var(--accent-gold)" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                  {uploading ? 'Processing Image Upload...' : 'Click or Drag images to upload'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Supports JPEG, PNG, WEBP up to 10MB each
                </div>
              </div>

              {/* Or manual URL adder */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  placeholder="Or enter image URL (e.g. /uploads/hero-slide-1.jpg or Cloudinary URL)"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  style={{ flex: 1, padding: '0.65rem 0.85rem', border: '1px solid var(--border-medium)', fontSize: '0.85rem' }}
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="btn-outline"
                  style={{ padding: '0.65rem 1rem', fontSize: '0.78rem' }}
                >
                  Add Image
                </button>
              </div>

              {/* Images Preview List */}
              {formData.images.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '1rem' }}>
                  {formData.images.map((img, idx) => {
                    const isSelectedThumb = formData.thumbnail === img;
                    return (
                      <div
                        key={idx}
                        style={{
                          position: 'relative',
                          aspectRatio: '1 / 1',
                          borderRadius: 'var(--radius-xs)',
                          overflow: 'hidden',
                          border: `2px solid ${isSelectedThumb ? 'var(--accent-gold)' : 'var(--border-hairline)'}`,
                          backgroundColor: '#F8F5F0'
                        }}
                      >
                        <img src={img} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                        {/* Thumbnail selector badge */}
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, thumbnail: img }))}
                          style={{
                            position: 'absolute',
                            top: '6px',
                            left: '6px',
                            backgroundColor: isSelectedThumb ? 'var(--accent-gold)' : 'rgba(0,0,0,0.6)',
                            color: '#FFF',
                            fontSize: '0.65rem',
                            padding: '2px 6px',
                            borderRadius: '2px',
                            cursor: 'pointer'
                          }}
                        >
                          {isSelectedThumb ? '★ Main' : 'Make Main'}
                        </button>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            backgroundColor: 'rgba(220, 38, 38, 0.85)',
                            color: '#FFF',
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 4. Specifications */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '2rem', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '1.25rem' }}>
                4. Architectural Specifications
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Material</label>
                  <input
                    type="text"
                    name="material"
                    value={formData.specifications.material}
                    onChange={handleSpecChange}
                    style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border-medium)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Color / Finish</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.specifications.color}
                    onChange={handleSpecChange}
                    style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border-medium)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Dimensions</label>
                  <input
                    type="text"
                    name="dimensions"
                    value={formData.specifications.dimensions}
                    onChange={handleSpecChange}
                    style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border-medium)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Weight</label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.specifications.weight}
                    onChange={handleSpecChange}
                    style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border-medium)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Bulb Compatibility</label>
                  <input
                    type="text"
                    name="bulbType"
                    value={formData.specifications.bulbType}
                    onChange={handleSpecChange}
                    style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border-medium)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Wattage / Spectrum</label>
                  <input
                    type="text"
                    name="wattage"
                    value={formData.specifications.wattage}
                    onChange={handleSpecChange}
                    style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border-medium)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Operating Voltage</label>
                  <input
                    type="text"
                    name="voltage"
                    value={formData.specifications.voltage}
                    onChange={handleSpecChange}
                    style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border-medium)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>Warranty Coverage</label>
                  <input
                    type="text"
                    name="warranty"
                    value={formData.specifications.warranty}
                    onChange={handleSpecChange}
                    style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border-medium)' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Status & Flags */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '2rem', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '1.25rem' }}>
                Publish Settings
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Edition Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)', backgroundColor: '#FFF' }}
                  >
                    <option value="active">Active (Visible in Store)</option>
                    <option value="inactive">Inactive (Hidden)</option>
                    <option value="draft">Draft (In Progress)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="walnut, table lamp, warm light"
                    style={{ width: '100%', padding: '0.65rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)' }}
                  />
                </div>
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem 0', borderTop: '1px solid var(--border-hairline)', borderBottom: '1px solid var(--border-hairline)', marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    style={{ accentColor: 'var(--text-main)', width: '16px', height: '16px' }}
                  />
                  <span>Feature on Homepage Spotlight</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="bestSeller"
                    checked={formData.bestSeller}
                    onChange={handleInputChange}
                    style={{ accentColor: 'var(--text-main)', width: '16px', height: '16px' }}
                  />
                  <span>Mark as Best Seller</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="newArrival"
                    checked={formData.newArrival}
                    onChange={handleInputChange}
                    style={{ accentColor: 'var(--text-main)', width: '16px', height: '16px' }}
                  />
                  <span>Display in New Arrivals</span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="btn-dark"
                style={{ width: '100%', padding: '0.95rem' }}
              >
                <span>{loading ? 'Publishing to MongoDB...' : isEditMode ? 'Update Product Edition' : 'Publish Product to Store'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      <style>{`
        @media (max-width: 960px) {
          .admin-form-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminProductForm;
