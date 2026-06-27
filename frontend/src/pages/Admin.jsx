import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  AlertTriangle, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  ShieldAlert, 
  Settings, 
  Truck, 
  Upload,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { apiFetch } from '../api.js';

// TipTap Rich Text Editor Sub-component
function TipTapEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '<p>Enter product description here...</p>',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="tiptap-toolbar">
        <button 
          type="button" 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          className={editor.isActive('bold') ? 'is-active' : ''}
        >
          Bold
        </button>
        <button 
          type="button" 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          className={editor.isActive('italic') ? 'is-active' : ''}
        >
          Italic
        </button>
        <button 
          type="button" 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          className={editor.isActive('bulletList') ? 'is-active' : ''}
        >
          Bullet List
        </button>
        <button 
          type="button" 
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          className={editor.isActive('orderedList') ? 'is-active' : ''}
        >
          Ordered List
        </button>
        <button type="button" onClick={() => editor.chain().focus().undo().run()}>Undo</button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()}>Redo</button>
      </div>
      <EditorContent editor={editor} className="tiptap-editor" />
    </div>
  );
}

export default function Admin({ user, onLogout }) {
  useEffect(() => {
    document.title = "Yard Administration Dashboard | JMD Global Stones";
  }, []);

  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [shippingZones, setShippingZones] = useState([]);
  const [siteSettings, setSiteSettings] = useState({});
  const [loading, setLoading] = useState(true);

  // Editing Product states
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProductData, setNewProductData] = useState({
    name: '',
    slug: '',
    category: 'Sandstone',
    price: 300,
    stock: 25,
    size: '900x600mm Pack 30 Pieces',
    description: '',
    images: [''],
    stars: 5,
    is_featured: false,
    variant_group_id: ''
  });

  // Settings update fields
  const [tempSettings, setTempSettings] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodsRes, ordsRes, revsRes, zonesRes, settingsRes] = await Promise.all([
        apiFetch('/api/products'),
        apiFetch('/api/orders'),
        apiFetch('/api/reviews'),
        apiFetch('/api/shipping-zones'),
        apiFetch('/api/site-settings')
      ]);
      
      const prods = await prodsRes.json();
      const ords = await ordsRes.json();
      const revs = await revsRes.json();
      const zones = await zonesRes.json();
      const settings = await settingsRes.json();
      
      const normalizedOrds = (ords || []).map(o => ({
        ...o,
        subtotal: Number(o.subtotal || 0),
        vat: Number(o.vat || 0),
        shipping: Number(o.shipping || 0),
        total: Number(o.total || 0),
        customer_details: typeof o.customer_details === 'string' 
          ? JSON.parse(o.customer_details) 
          : (o.customer_details || {}),
        shipping_address: typeof o.shipping_address === 'string'
          ? JSON.parse(o.shipping_address)
          : (o.shipping_address || {}),
        items: typeof o.items === 'string'
          ? JSON.parse(o.items)
          : (o.items || [])
      }));

      setProducts(prods);
      setOrders(normalizedOrds);
      setReviews(revs);
      setShippingZones(zones);
      setSiteSettings(settings);
      setTempSettings(settings);
    } catch (error) {
      console.error('Error fetching CMS admin registry data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const lowStockProducts = products.filter(p => (p.stock || 0) <= 5);

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing': return 'var(--color-accent)';
      case 'dispatched': return '#2B82D9';
      case 'delivered': return 'var(--color-success)';
      case 'cancelled': return 'var(--color-danger)';
      default: return 'var(--text-on-light)';
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await apiFetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      console.error('Failed to update order status', err);
    }
  };

  const handleApproveReview = async (reviewId) => {
    try {
      const response = await apiFetch(`/api/reviews/${reviewId}/approve`, { method: 'PUT' });
      if (response.ok) {
        setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, is_approved: true } : r));
      }
    } catch (err) {
      console.error('Failed to approve review', err);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const response = await apiFetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });
      if (response.ok) {
        setReviews(prev => prev.filter(r => r.id !== reviewId));
      }
    } catch (err) {
      console.error('Failed to delete review', err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { supabase } = await import('../supabase.js');
      if (supabase) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error } = await supabase.storage
          .from('stone-images')
          .upload(filePath, file);

        if (error) {
          alert('Upload failed: ' + error.message);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('stone-images')
            .getPublicUrl(filePath);

          if (editingProduct) {
            setEditingProduct(prev => ({ ...prev, images: [publicUrl, ...prev.images.slice(1)] }));
          } else {
            setNewProductData(prev => ({ ...prev, images: [publicUrl, ...prev.images.slice(1)] }));
          }
        }
      } else {
        alert('Supabase storage not active. Applying simulated upload path.');
        const mockUrl = `https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/${file.name}`;
        if (editingProduct) {
          setEditingProduct(prev => ({ ...prev, images: [mockUrl, ...prev.images.slice(1)] }));
        } else {
          setNewProductData(prev => ({ ...prev, images: [mockUrl, ...prev.images.slice(1)] }));
        }
      }
    } catch (err) {
      console.error('Image upload crash:', err);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const isEdit = !!editingProduct;
    const url = isEdit ? `/api/products/${editingProduct.id}` : '/api/products';
    const method = isEdit ? 'PUT' : 'POST';
    const payload = isEdit ? editingProduct : newProductData;

    try {
      const response = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        await fetchData();
        setEditingProduct(null);
        setIsAddingProduct(false);
        setNewProductData({
          name: '',
          slug: '',
          category: 'Sandstone',
          price: 300,
          stock: 25,
          size: '900x600mm Pack 30 Pieces',
          description: '',
          images: [''],
          stars: 5,
          is_featured: false,
          variant_group_id: ''
        });
      } else {
        alert('Failed to save product details.');
      }
    } catch (err) {
      console.error('Failed to save product', err);
    }
  };

  const handleDeleteProduct = async (prodId) => {
    if (!confirm('Delete this product permanently?')) return;
    try {
      const response = await apiFetch(`/api/products/${prodId}`, { method: 'DELETE' });
      if (response.ok) {
        setProducts(prev => prev.filter(p => p.id !== prodId));
      }
    } catch (err) {
      console.error('Failed to delete product', err);
    }
  };

  const handleSaveZoneRate = async (zoneId, newRate) => {
    try {
      const response = await apiFetch(`/api/shipping-zones/${zoneId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate: newRate })
      });
      if (response.ok) {
        setShippingZones(prev => prev.map(z => z.id === zoneId ? { ...z, rate: parseFloat(newRate) } : z));
        alert('Shipping carriage rate updated successfully.');
      }
    } catch (err) {
      console.error('Failed to save zone rate:', err);
    }
  };

  const handleSaveSiteSetting = async (key, value) => {
    try {
      const response = await apiFetch(`/api/site-settings/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value })
      });
      if (response.ok) {
        setSiteSettings(prev => ({ ...prev, [key]: value }));
        alert(`Site setting [${key}] updated successfully.`);
      }
    } catch (err) {
      console.error('Failed to update site settings:', err);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-light)', padding: '5rem 0', minHeight: '90vh' }}>
      <div className="container">
        
        {/* Dashboard Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-accent)' }}>
              <ShieldAlert size={16} />
              <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em' }}>Secure CMS Panel</span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', marginTop: '0.5rem', fontWeight: 400 }}>JMD Yard Management CMS</h1>
          </div>
          <button onClick={onLogout} className="btn btn-secondary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
            Logout (Director)
          </button>
        </div>

        {/* Sidebar Navigation Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '3.5rem' }} className="admin-layout">
          
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <button 
              onClick={() => { setActiveTab('overview'); setEditingProduct(null); setIsAddingProduct(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem 1rem', border: '1px solid var(--color-border-light)', backgroundColor: activeTab === 'overview' ? '#FFFFFF' : 'transparent', color: activeTab === 'overview' ? 'var(--color-accent)' : 'var(--text-muted-on-light)', fontWeight: activeTab === 'overview' ? 600 : 500, cursor: 'pointer', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' }}
            >
              <LayoutDashboard size={16} /> Overview
            </button>
            <button 
              onClick={() => { setActiveTab('products'); setEditingProduct(null); setIsAddingProduct(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem 1rem', border: '1px solid var(--color-border-light)', backgroundColor: activeTab === 'products' ? '#FFFFFF' : 'transparent', color: activeTab === 'products' ? 'var(--color-accent)' : 'var(--text-muted-on-light)', fontWeight: activeTab === 'products' ? 600 : 500, cursor: 'pointer', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' }}
            >
              <Package size={16} /> Products ({products.length})
            </button>
            <button 
              onClick={() => { setActiveTab('orders'); setEditingProduct(null); setIsAddingProduct(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem 1rem', border: '1px solid var(--color-border-light)', backgroundColor: activeTab === 'orders' ? '#FFFFFF' : 'transparent', color: activeTab === 'orders' ? 'var(--color-accent)' : 'var(--text-muted-on-light)', fontWeight: activeTab === 'orders' ? 600 : 500, cursor: 'pointer', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' }}
            >
              <ShoppingCart size={16} /> Orders ({orders.length})
            </button>
            <button 
              onClick={() => { setActiveTab('reviews'); setEditingProduct(null); setIsAddingProduct(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem 1rem', border: '1px solid var(--color-border-light)', backgroundColor: activeTab === 'reviews' ? '#FFFFFF' : 'transparent', color: activeTab === 'reviews' ? 'var(--color-accent)' : 'var(--text-muted-on-light)', fontWeight: activeTab === 'reviews' ? 600 : 500, cursor: 'pointer', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' }}
            >
              <MessageSquare size={16} /> Reviews ({reviews.length})
            </button>
            <button 
              onClick={() => { setActiveTab('shipping'); setEditingProduct(null); setIsAddingProduct(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem 1rem', border: '1px solid var(--color-border-light)', backgroundColor: activeTab === 'shipping' ? '#FFFFFF' : 'transparent', color: activeTab === 'shipping' ? 'var(--color-accent)' : 'var(--text-muted-on-light)', fontWeight: activeTab === 'shipping' ? 600 : 500, cursor: 'pointer', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' }}
            >
              <Truck size={16} /> Shipping Zones
            </button>
            <button 
              onClick={() => { setActiveTab('settings'); setEditingProduct(null); setIsAddingProduct(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem 1rem', border: '1px solid var(--color-border-light)', backgroundColor: activeTab === 'settings' ? '#FFFFFF' : 'transparent', color: activeTab === 'settings' ? 'var(--color-accent)' : 'var(--text-muted-on-light)', fontWeight: activeTab === 'settings' ? 600 : 500, cursor: 'pointer', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' }}
            >
              <Settings size={16} /> Site Settings
            </button>
          </aside>

          {/* Main CMS Panel content */}
          <div style={{ border: '1px solid var(--color-border-light)', padding: '3rem', backgroundColor: 'transparent' }}>
            
            {loading ? (
              <p style={{ color: 'var(--text-muted-on-light)', fontSize: '0.95rem' }}>Loading registry...</p>
            ) : (
              <>
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '1rem', fontWeight: 400 }}>Overview Metrics</h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '4rem' }}>
                      <div style={{ border: '1px solid var(--color-border-light)', padding: '1.75rem 1.5rem', backgroundColor: '#EBE4D9' }}>
                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted-on-light)' }}>Total Orders</span>
                        <h3 style={{ fontSize: '2.2rem', marginTop: '0.5rem', fontFamily: 'var(--font-body)', fontWeight: 500 }}>{orders.length}</h3>
                      </div>
                      <div style={{ border: '1px solid var(--color-border-light)', padding: '1.75rem 1.5rem', backgroundColor: '#EBE4D9' }}>
                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted-on-light)' }}>Gross Sales</span>
                        <h3 style={{ fontSize: '2.2rem', marginTop: '0.5rem', fontFamily: 'var(--font-body)', fontWeight: 500, color: 'var(--color-accent)' }}>£{totalRevenue.toFixed(2)}</h3>
                      </div>
                      <div style={{ border: '1px solid var(--color-danger)', padding: '1.75rem 1.5rem', backgroundColor: '#FDF2F2' }}>
                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-danger)' }}>Low Stock Warning</span>
                        <h3 style={{ fontSize: '2.2rem', marginTop: '0.5rem', color: 'var(--color-danger)', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                          {lowStockProducts.length} <AlertTriangle size={22} />
                        </h3>
                      </div>
                    </div>

                    <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem', fontWeight: 600 }}>Recent Sales</h3>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#EBE4D9', borderBottom: '1px solid var(--color-border-light)' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Order ID</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Customer</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Total</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Date</th>
                            <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.slice(0, 5).map((o) => (
                            <tr key={o.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                              <td style={{ padding: '1rem', fontWeight: 600 }}>#{o.id}</td>
                              <td style={{ padding: '1rem' }}>{o.customer_details.name}</td>
                              <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-accent)' }}>£{o.total.toFixed(2)}</td>
                              <td style={{ padding: '1rem' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                              <td style={{ padding: '1rem' }}>
                                <span style={{ color: getStatusColor(o.status), fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                                  {o.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* PRODUCTS TAB */}
                {activeTab === 'products' && (
                  <div>
                    {!editingProduct && !isAddingProduct ? (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '1.25rem' }}>
                          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 400 }}>Product Catalog Management</h2>
                          <button onClick={() => setIsAddingProduct(true)} className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', letterSpacing: '0.05em' }}>
                            <Plus size={15} /> Add Standalone Product
                          </button>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                              <tr style={{ backgroundColor: '#EBE4D9', borderBottom: '1px solid var(--color-border-light)' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Image</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Material Name</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Category</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Size Specs</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Price (ex. VAT)</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Stock</th>
                                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {products.map((p) => (
                                <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                                  <td style={{ padding: '1rem' }}>
                                    <img src={p.images[0]} alt={p.name} style={{ width: '44px', height: '44px', objectFit: 'cover', border: '1px solid var(--color-border-light)' }} />
                                  </td>
                                  <td style={{ padding: '1rem', fontWeight: 500 }}>
                                    {p.name}
                                    {p.stock <= 5 && (
                                      <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--color-danger)', color: '#FFFFFF', padding: '0.15rem 0.35rem', marginLeft: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Low Stock
                                      </span>
                                    )}
                                  </td>
                                  <td style={{ padding: '1rem' }}>{p.category}</td>
                                  <td style={{ padding: '1rem', color: 'var(--text-muted-on-light)' }}>{p.size}</td>
                                  <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-accent)' }}>£{p.price.toFixed(2)}</td>
                                  <td style={{ padding: '1rem', color: p.stock <= 5 ? 'var(--color-danger)' : 'inherit', fontWeight: p.stock <= 5 ? 700 : 'inherit' }}>
                                    {p.stock} packs
                                  </td>
                                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <button onClick={() => setEditingProduct(p)} style={{ cursor: 'pointer', marginRight: '1.25rem', color: 'var(--color-accent)' }} title="Edit Product">
                                      <Edit2 size={15} />
                                    </button>
                                    <button onClick={() => handleDeleteProduct(p.id)} style={{ cursor: 'pointer', color: 'var(--color-danger)' }} title="Delete Product">
                                      <Trash2 size={15} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    ) : (
                      /* CMS PRODUCT FORM (With TipTap & Image uploads) */
                      <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '1rem' }}>
                          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 400 }}>
                            {editingProduct ? `Edit Material: ${editingProduct.name}` : 'Add New Paving Slab Product'}
                          </h2>
                          <button 
                            type="button" 
                            onClick={() => { setEditingProduct(null); setIsAddingProduct(false); }}
                            className="btn btn-secondary"
                            style={{ padding: '0.5rem 1.25rem', fontSize: '0.75rem', letterSpacing: '0.05em' }}
                          >
                            Cancel
                          </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="form-grid-2">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product Name</label>
                            <input 
                              type="text" 
                              required 
                              value={editingProduct ? editingProduct.name : newProductData.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                const slugified = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                                if (editingProduct) {
                                  setEditingProduct(prev => ({ ...prev, name: val, slug: slugified }));
                                } else {
                                  setNewProductData(prev => ({ ...prev, name: val, slug: slugified }));
                                }
                              }}
                              placeholder="e.g. Raj Green Premium Sandstone"
                              style={{ padding: '0.85rem 1rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', fontSize: '0.9rem' }} 
                            />
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Slug URL</label>
                            <input 
                              type="text" 
                              required 
                              value={editingProduct ? editingProduct.slug : newProductData.slug}
                              onChange={(e) => {
                                if (editingProduct) {
                                  setEditingProduct(prev => ({ ...prev, slug: e.target.value }));
                                } else {
                                  setNewProductData(prev => ({ ...prev, slug: e.target.value }));
                                }
                              }}
                              placeholder="e.g. raj-green-premium-sandstone"
                              style={{ padding: '0.85rem 1rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', fontSize: '0.9rem' }} 
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="form-grid-2">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</label>
                            <select 
                              value={editingProduct ? editingProduct.category : newProductData.category}
                              onChange={(e) => {
                                if (editingProduct) {
                                  setEditingProduct(prev => ({ ...prev, category: e.target.value }));
                                } else {
                                  setNewProductData(prev => ({ ...prev, category: e.target.value }));
                                }
                              }}
                              style={{ padding: '0.85rem 1rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', cursor: 'pointer', fontSize: '0.9rem', outline: 'none' }}
                            >
                              <option value="Sandstone">Sandstone</option>
                              <option value="Porcelain">Porcelain</option>
                              <option value="Limestone">Limestone</option>
                              <option value="Slate">Slate</option>
                              <option value="Bricks">Bricks</option>
                            </select>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price (£ ex. VAT)</label>
                            <input 
                              type="number" 
                              required 
                              step="0.01"
                              value={editingProduct ? editingProduct.price : newProductData.price}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                if (editingProduct) {
                                  setEditingProduct(prev => ({ ...prev, price: val }));
                                } else {
                                  setNewProductData(prev => ({ ...prev, price: val }));
                                }
                              }}
                              style={{ padding: '0.85rem 1rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', fontSize: '0.9rem' }} 
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="form-grid-2">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Size Specification</label>
                            <input 
                              type="text" 
                              required 
                              value={editingProduct ? editingProduct.size : newProductData.size}
                              onChange={(e) => {
                                if (editingProduct) {
                                  setEditingProduct(prev => ({ ...prev, size: e.target.value }));
                                } else {
                                  setNewProductData(prev => ({ ...prev, size: e.target.value }));
                                }
                              }}
                              placeholder="e.g. 900x600mm Pack 30 Pieces"
                              style={{ padding: '0.85rem 1rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', fontSize: '0.9rem' }} 
                            />
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stock (wooden crates)</label>
                            <input 
                              type="number" 
                              required 
                              value={editingProduct ? editingProduct.stock : newProductData.stock}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                if (editingProduct) {
                                  setEditingProduct(prev => ({ ...prev, stock: val }));
                                } else {
                                  setNewProductData(prev => ({ ...prev, stock: val }));
                                }
                              }}
                              style={{ padding: '0.85rem 1rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', fontSize: '0.9rem' }} 
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="form-grid-2">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Variant Group ID (to link sizes)</label>
                            <input 
                              type="text" 
                              value={editingProduct ? (editingProduct.variant_group_id || '') : (newProductData.variant_group_id || '')}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (editingProduct) {
                                  setEditingProduct(prev => ({ ...prev, variant_group_id: val }));
                                } else {
                                  setNewProductData(prev => ({ ...prev, variant_group_id: val }));
                                }
                              }}
                              placeholder="e.g. raj-green-sizes"
                              style={{ padding: '0.85rem 1rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', fontSize: '0.9rem' }} 
                            />
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upload Primary Image</label>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageUpload} 
                                style={{ display: 'none' }} 
                                id="admin-file-upload" 
                              />
                              <label htmlFor="admin-file-upload" className="btn btn-secondary" style={{ display: 'inline-flex', gap: '0.5rem', height: '48px', padding: '0 1.5rem', cursor: 'pointer', alignItems: 'center', fontSize: '0.75rem' }}>
                                <Upload size={14} /> Choose File
                              </label>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted-on-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                                {editingProduct ? editingProduct.images[0] : newProductData.images[0]}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Primary Image URL (Bypass)</label>
                          <input 
                            type="text" 
                            value={editingProduct ? (editingProduct.images[0] || '') : (newProductData.images[0] || '')}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (editingProduct) {
                                setEditingProduct(prev => ({ ...prev, images: [val, ...prev.images.slice(1)] }));
                              } else {
                                setNewProductData(prev => ({ ...prev, images: [val, ...prev.images.slice(1)] }));
                              }
                            }}
                            placeholder="https://..."
                            style={{ padding: '0.85rem 1rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', fontSize: '0.9rem' }} 
                          />
                        </div>

                        {/* PRODUCT GALLERY MANAGER */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderTop: '1px solid var(--color-border-light)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-accent)' }}>Product Gallery / Additional Images</label>
                          
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                            {(editingProduct ? editingProduct.images : newProductData.images).map((img, idx) => {
                              if (!img) return null;
                              return (
                                <div key={idx} style={{ position: 'relative', border: '1px solid var(--color-border-light)', padding: '0.5rem', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <img src={img} alt={`Gallery ${idx + 1}`} style={{ width: '80px', height: '80px', objectFit: 'cover', marginBottom: '0.5rem' }} />
                                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted-on-light)', fontWeight: 600 }}>{idx === 0 ? 'Primary' : `Image ${idx + 1}`}</span>
                                  {idx > 0 && (
                                    <button 
                                      type="button" 
                                      onClick={() => {
                                        const currentImages = editingProduct ? [...editingProduct.images] : [...newProductData.images];
                                        currentImages.splice(idx, 1);
                                        if (editingProduct) {
                                          setEditingProduct(prev => ({ ...prev, images: currentImages }));
                                        } else {
                                          setNewProductData(prev => ({ ...prev, images: currentImages }));
                                        }
                                      }}
                                      style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', backgroundColor: 'var(--color-danger)', color: '#FFFFFF', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', fontSize: '0.65rem' }}
                                      title="Remove Image"
                                    >
                                      &times;
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexGrow: 1 }}>
                              <label style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Add Image URL to Gallery</label>
                              <input 
                                type="text" 
                                id="new-gallery-image-url"
                                placeholder="https://..."
                                style={{ padding: '0.85rem 1rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', fontSize: '0.9rem' }} 
                              />
                            </div>
                            <button 
                              type="button"
                              onClick={() => {
                                const input = document.getElementById('new-gallery-image-url');
                                const url = input.value.trim();
                                if (!url) return;
                                const currentImages = editingProduct ? [...editingProduct.images] : [...newProductData.images];
                                currentImages.push(url);
                                if (editingProduct) {
                                  setEditingProduct(prev => ({ ...prev, images: currentImages }));
                                } else {
                                  setNewProductData(prev => ({ ...prev, images: currentImages }));
                                }
                                input.value = '';
                              }}
                              className="btn btn-secondary"
                              style={{ height: '48px', padding: '0 1.5rem', fontSize: '0.75rem' }}
                            >
                              Add URL
                            </button>
                          </div>

                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                try {
                                  const { supabase } = await import('../supabase.js');
                                  let imageUrl = '';
                                  if (supabase) {
                                    const fileExt = file.name.split('.').pop();
                                    const fileName = `${Date.now()}.${fileExt}`;
                                    const filePath = `products/${fileName}`;

                                    const { error } = await supabase.storage
                                      .from('stone-images')
                                      .upload(filePath, file);

                                    if (error) {
                                      alert('Upload failed: ' + error.message);
                                      return;
                                    }
                                    const { data: { publicUrl } } = supabase.storage
                                      .from('stone-images')
                                      .getPublicUrl(filePath);
                                    imageUrl = publicUrl;
                                  } else {
                                    imageUrl = `https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/${file.name}`;
                                  }
                                  const currentImages = editingProduct ? [...editingProduct.images] : [...newProductData.images];
                                  currentImages.push(imageUrl);
                                  if (editingProduct) {
                                    setEditingProduct(prev => ({ ...prev, images: currentImages }));
                                  } else {
                                    setNewProductData(prev => ({ ...prev, images: currentImages }));
                                  }
                                } catch (err) {
                                  console.error('Upload failed:', err);
                                }
                              }} 
                              style={{ display: 'none' }} 
                              id="admin-gallery-file-upload" 
                            />
                            <label htmlFor="admin-gallery-file-upload" className="btn btn-secondary" style={{ display: 'inline-flex', gap: '0.5rem', height: '48px', padding: '0 1.5rem', cursor: 'pointer', alignItems: 'center', fontSize: '0.75rem' }}>
                              <Upload size={14} /> Upload & Add to Gallery
                            </label>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Rich Text Description (WYSIWYG Editor)</label>
                          <TipTapEditor 
                            value={editingProduct ? editingProduct.description : newProductData.description}
                            onChange={(html) => {
                              if (editingProduct) {
                                setEditingProduct(prev => ({ ...prev, description: html }));
                              } else {
                                setNewProductData(prev => ({ ...prev, description: html }));
                              }
                            }}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1.25rem' }}>
                          <button type="submit" className="btn btn-primary" style={{ flexGrow: 1, height: '52px', fontSize: '0.8rem', letterSpacing: '0.12em' }}>Save Product Info</button>
                          <button 
                            type="button" 
                            onClick={() => { setEditingProduct(null); setIsAddingProduct(false); }}
                            className="btn btn-secondary"
                            style={{ height: '52px', fontSize: '0.8rem', letterSpacing: '0.12em' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* ORDERS TAB */}
                {activeTab === 'orders' && (
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '1rem', fontWeight: 400 }}>Order Management</h2>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                      {orders.map((o) => (
                        <div key={o.id} style={{ border: '1px solid var(--color-border-light)', padding: '2.5rem 2rem', backgroundColor: 'transparent' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }} className="order-mgmt-header">
                            <div>
                              <h4 style={{ fontSize: '1.2rem', fontWeight: 500, fontFamily: 'var(--font-body)' }}>Order #{o.id}</h4>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted-on-light)' }}>Placed: {new Date(o.created_at).toLocaleString()}</p>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted-on-light)' }}>Status:</span>
                              <select 
                                value={o.status} 
                                onChange={(e) => handleOrderStatusUpdate(o.id, e.target.value)}
                                style={{ border: '1px solid var(--color-border-light)', padding: '0.4rem 1.5rem 0.4rem 0.5rem', backgroundColor: '#EBE4D9', fontWeight: 600, color: getStatusColor(o.status), cursor: 'pointer', outline: 'none', fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}
                              >
                                <option value="pending">Pending</option>
                                <option value="processing">Preparing</option>
                                <option value="dispatched">Dispatched</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem' }} className="order-mgmt-grid">
                            <div>
                              <h5 style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--text-muted-on-light)', marginBottom: '0.75rem', fontWeight: 600 }}>Items Ordered</h5>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                                {(o.items || []).map((item, idx) => (
                                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-on-light)' }}>
                                    <span>{item.product_name} <span style={{ color: 'var(--text-muted-on-light)', fontSize: '0.75rem' }}>({item.variant_size})</span> x {item.quantity}</span>
                                    <span style={{ fontWeight: 600 }}>£{Number(item.price * item.quantity || 0).toFixed(2)}</span>
                                  </div>
                                ))}
                                <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '0.75rem', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted-on-light)' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <span>Subtotal:</span>
                                    <span>£{Number(o.subtotal || 0).toFixed(2)} ex</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <span>VAT (20%):</span>
                                    <span>£{Number(o.vat || 0).toFixed(2)}</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <span>Carriage rate:</span>
                                    <span>£{Number(o.shipping || 0).toFixed(2)}</span>
                                  </div>
                                </div>
                                <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-accent)' }}>
                                  <span>Total (Inc. VAT & Carriage)</span>
                                  <span>£{Number(o.total || 0).toFixed(2)}</span>
                                </div>
                              </div>
                            </div>

                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted-on-light)', lineHeight: 1.6 }}>
                              <h5 style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--text-muted-on-light)', marginBottom: '0.75rem', fontWeight: 600 }}>Customer Details</h5>
                              <p><strong style={{ color: 'var(--text-on-light)' }}>Name:</strong> {(o.customer_details || {}).name || 'N/A'}</p>
                              <p><strong style={{ color: 'var(--text-on-light)' }}>Email:</strong> {(o.customer_details || {}).email || 'N/A'}</p>
                              <p><strong style={{ color: 'var(--text-on-light)' }}>Phone:</strong> {(o.customer_details || {}).phone || 'N/A'}</p>
                              <p><strong style={{ color: 'var(--text-on-light)' }}>Address:</strong> {(o.customer_details || {}).address || 'N/A'}</p>
                              <p style={{ marginTop: '0.5rem' }}><strong style={{ color: 'var(--text-on-light)' }}>Payment Method:</strong> {o.payment_method === 'stripe' ? 'Card Elements' : 'Bank Transfer'}</p>
                              <p><strong style={{ color: 'var(--text-on-light)' }}>Payment Status:</strong> <span style={{ textTransform: 'uppercase', fontWeight: 700, color: o.payment_status === 'paid' ? 'var(--color-success)' : 'var(--color-danger)' }}>{o.payment_status || 'unpaid'}</span></p>
                              <div style={{ marginTop: '1rem' }}>
                                <Link to={`/invoice/${o.id}`} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.7rem' }}>
                                  View Printable Invoice
                                </Link>
                              </div>
                            </div>

                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* REVIEWS TAB */}
                {activeTab === 'reviews' && (
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '1rem', fontWeight: 400 }}>Customer Reviews Moderation</h2>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {reviews.length === 0 ? (
                        <p style={{ color: 'var(--text-muted-on-light)', textAlign: 'center', padding: '4rem 0', fontSize: '0.95rem' }}>No customer reviews found.</p>
                      ) : (
                        reviews.map((r) => (
                          <div key={r.id} style={{ border: '1px solid var(--color-border-light)', padding: '2rem 1.5rem', backgroundColor: 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="review-row">
                            <div style={{ maxWidth: '75%' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-on-light)' }}>{r.user_name}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted-on-light)' }}>on product: <em>{r.product_slug.replace(/-/g, ' ')}</em></span>
                              </div>
                              <div style={{ display: 'flex', gap: '0.15rem', color: 'var(--color-accent)', marginBottom: '0.75rem' }}>
                                {[...Array(r.rating)].map((_, i) => (
                                  <span key={i} style={{ fontSize: '0.8rem' }}>★</span>
                                ))}
                              </div>
                              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted-on-light)', lineHeight: 1.5 }}>"{r.comment}"</p>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                              {!r.is_approved ? (
                                <button 
                                  onClick={() => handleApproveReview(r.id)} 
                                  className="btn" 
                                  style={{ padding: '0.5rem 1rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'var(--color-success)', border: 'none', color: '#FFFFFF', letterSpacing: '0.05em' }}
                                >
                                  <Check size={12} /> Approve
                                </button>
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600, textTransform: 'uppercase', marginRight: '1rem', display: 'flex', alignItems: 'center', letterSpacing: '0.05em' }}>
                                  Approved
                                </span>
                              )}
                              <button 
                                onClick={() => handleDeleteReview(r.id)} 
                                className="btn" 
                                style={{ padding: '0.5rem 1rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'transparent', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', letterSpacing: '0.05em' }}
                              >
                                <X size={12} /> Delete
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* SHIPPING ZONES TAB */}
                {activeTab === 'shipping' && (
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '1rem', fontWeight: 400 }}>Shipping Zones Rates</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted-on-light)', marginBottom: '2rem', lineHeight: 1.6 }}>
                      Configure the flat carriage cost for each UK region. Customers postcodes are looked up and their zone matched dynamically.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {shippingZones.map((zone) => (
                        <div key={zone.id} style={{ border: '1px solid var(--color-border-light)', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{zone.zone_name}</span>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted-on-light)', marginTop: '0.25rem' }}>
                              {zone.id === 1 && "Fallback Zone - default UK regions"}
                              {zone.id === 2 && "BA, BH, BN, CA, CT, DL, GU, LA, ME, LL, LN, SP, SY, TA, WA, WN"}
                              {zone.id === 3 && "BR, CM, CR, DA, DT, EH, EN, EX, HA and 39 other regions"}
                              {zone.id === 4 && "EC, N, NW, SE, SW, W, WC, E1-E9 and London outcodes"}
                              {zone.id === 5 && "AB, BT, DD, DG, FK, G1-G4 and Scotland/Northern Ireland"}
                              {zone.id === 6 && "IV, KW, PH, GY, JE and Highlands & Islands"}
                              {zone.id === 7 && "HS, IM, KA"}
                              {zone.id === 8 && "PA, ZE"}
                            </p>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>£</span>
                            <input 
                              type="number" 
                              step="0.01" 
                              defaultValue={zone.rate} 
                              onBlur={(e) => handleSaveZoneRate(zone.id, e.target.value)} 
                              style={{ width: '90px', padding: '0.5rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', fontWeight: 600, fontSize: '0.9rem', textAlign: 'right' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SITE SETTINGS TAB */}
                {activeTab === 'settings' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    
                    <div>
                      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '1rem', fontWeight: 400 }}>Site Configuration</h2>
                      
                      {/* Maintenance mode toggle */}
                      <div style={{ border: '1px solid var(--color-border-light)', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', marginBottom: '1.5rem' }}>
                        <div>
                          <strong style={{ fontSize: '0.9rem' }}>Maintenance Mode</strong>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted-on-light)' }}>Locks the store public pages and displays a construction screen.</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => handleSaveSiteSetting('maintenance_mode', !siteSettings.maintenance_mode)}
                          style={{ cursor: 'pointer', color: 'var(--color-accent)' }}
                        >
                          {siteSettings.maintenance_mode ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                        </button>
                      </div>

                      {/* WhatsApp Config */}
                      <div style={{ border: '1px solid var(--color-border-light)', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', marginBottom: '1.5rem' }}>
                        <div>
                          <strong style={{ fontSize: '0.9rem' }}>WhatsApp Support Number</strong>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted-on-light)' }}>UK phone number matching the floating support widget link.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input 
                            type="text" 
                            value={tempSettings.whatsapp_number || ''}
                            onChange={(e) => setTempSettings({ ...tempSettings, whatsapp_number: e.target.value })}
                            style={{ padding: '0.5rem', border: '1px solid var(--color-border-light)', fontSize: '0.9rem', width: '180px' }} 
                          />
                          <button 
                            type="button" 
                            onClick={() => handleSaveSiteSetting('whatsapp_number', tempSettings.whatsapp_number)}
                            className="btn btn-primary" 
                            style={{ padding: '0 1rem', fontSize: '0.75rem', height: '37px' }}
                          >
                            Save
                          </button>
                        </div>
                      </div>

                      {/* Starting Invoice Number Config */}
                      <div style={{ border: '1px solid var(--color-border-light)', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
                        <div>
                          <strong style={{ fontSize: '0.9rem' }}>Starting Invoice Number</strong>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted-on-light)' }}>The base sequence number from which future orders will increment (e.g. 100475).</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input 
                            type="number" 
                            value={tempSettings.invoice_starting_number || 100475}
                            onChange={(e) => setTempSettings({ ...tempSettings, invoice_starting_number: parseInt(e.target.value) || 100475 })}
                            style={{ padding: '0.5rem', border: '1px solid var(--color-border-light)', fontSize: '0.9rem', width: '180px' }} 
                          />
                          <button 
                            type="button" 
                            onClick={() => handleSaveSiteSetting('invoice_starting_number', tempSettings.invoice_starting_number)}
                            className="btn btn-primary" 
                            style={{ padding: '0 1rem', fontSize: '0.75rem', height: '37px' }}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Homepage Hero Texts */}
                    <div>
                      <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.25rem', fontWeight: 600 }}>Homepage Content Editor</h3>
                      
                      <div style={{ border: '1px solid var(--color-border-light)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Hero Title Line 1</label>
                          <input 
                            type="text"
                            value={tempSettings.home_hero_headline || ''}
                            onChange={(e) => setTempSettings({ ...tempSettings, home_hero_headline: e.target.value })}
                            style={{ padding: '0.75rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', fontSize: '0.9rem' }}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Hero Title Line 2</label>
                          <input 
                            type="text"
                            value={tempSettings.home_hero_subheadline || ''}
                            onChange={(e) => setTempSettings({ ...tempSettings, home_hero_subheadline: e.target.value })}
                            style={{ padding: '0.75rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', fontSize: '0.9rem' }}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Hero Subtitle Paragraph</label>
                          <textarea 
                            value={tempSettings.home_hero_text || ''}
                            onChange={(e) => setTempSettings({ ...tempSettings, home_hero_text: e.target.value })}
                            rows="3"
                            style={{ padding: '0.75rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', fontSize: '0.9rem', resize: 'vertical', lineHeight: 1.5 }}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                          <button 
                            type="button" 
                            onClick={() => {
                              handleSaveSiteSetting('home_hero_headline', tempSettings.home_hero_headline);
                              handleSaveSiteSetting('home_hero_subheadline', tempSettings.home_hero_subheadline);
                              handleSaveSiteSetting('home_hero_text', tempSettings.home_hero_text);
                            }}
                            className="btn btn-primary"
                            style={{ flexGrow: 1, height: '48px', fontSize: '0.75rem' }}
                          >
                            Save Hero Contents
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Trust Badges rows */}
                    <div>
                      <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.25rem', fontWeight: 600 }}>Trust Badges Sub-descriptions</h3>
                      
                      <div style={{ border: '1px solid var(--color-border-light)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {Array.from({ length: 4 }).map((_, idx) => (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Badge {idx + 1} Description</label>
                            <input 
                              type="text"
                              value={tempSettings.trust_bar?.[idx] || ''}
                              onChange={(e) => {
                                const newBar = [...(tempSettings.trust_bar || [])];
                                newBar[idx] = e.target.value;
                                setTempSettings({ ...tempSettings, trust_bar: newBar });
                              }}
                              style={{ padding: '0.75rem', border: '1px solid var(--color-border-light)', backgroundColor: '#FFFFFF', fontSize: '0.9rem' }}
                            />
                          </div>
                        ))}
                        <button 
                          type="button" 
                          onClick={() => handleSaveSiteSetting('trust_bar', tempSettings.trust_bar)}
                          className="btn btn-primary"
                          style={{ height: '48px', fontSize: '0.75rem', marginTop: '0.5rem' }}
                        >
                          Save Trust Bar
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </>
            )}

          </div>

        </div>

      </div>
      
      <style>{`
        @media (max-width: 768px) {
          .admin-layout { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .admin-layout aside { flex-direction: row !important; overflow-x: auto; padding-bottom: 0.5rem; }
          .admin-layout aside button { flex-shrink: 0; padding: 0.5rem 1rem !important; }
          .form-grid-2 { grid-template-columns: 1fr !important; }
          .variant-row { flex-direction: column; align-items: stretch !important; gap: 0.5rem; border-bottom: 1px solid var(--color-border-light); padding-bottom: 0.75rem; }
          .variant-row input { width: 100% !important; }
          .order-mgmt-header, .order-mgmt-grid, .review-row { flex-direction: column; align-items: flex-start !important; gap: 1rem; }
          .review-row div { max-width: 100% !important; }
        }
      `}</style>

    </div>
  );
}
