import React, { useState, useEffect } from 'react';
import { getSpareParts, createSparePart, updateSparePartStock } from '../api';
import { Package, Plus, RefreshCw, AlertCircle, Edit3 } from 'lucide-react';

export default function SparePartsManager() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [partName, setPartName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [quantityAvailable, setQuantityAvailable] = useState(10);
  const [unitPrice, setUnitPrice] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadParts = async () => {
    setLoading(true);
    try {
      const res = await getSpareParts();
      setParts(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParts();
  }, []);

  const handleAddPart = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!partName.trim() || !partNumber.trim()) {
      setErrorMsg('Part name and Part number are required.');
      return;
    }

    if (!unitPrice || isNaN(unitPrice) || parseFloat(unitPrice) <= 0) {
      setErrorMsg('Valid unit price is required.');
      return;
    }

    try {
      await createSparePart({
        part_name: partName,
        part_number: partNumber,
        quantity_available: Number(quantityAvailable),
        unit_price: Number(unitPrice)
      });
      setSuccessMsg('Spare part added to inventory successfully!');
      setPartName('');
      setPartNumber('');
      setQuantityAvailable(10);
      setUnitPrice('');
      setShowAddForm(false);
      loadParts();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to add spare part');
    }
  };

  const handleUpdateStock = async (id, currentQty) => {
    const newQtyStr = prompt(`Update Stock Quantity for Part #${id}:`, currentQty);
    if (newQtyStr === null) return;

    const newQty = parseInt(newQtyStr);
    if (isNaN(newQty) || newQty < 0) {
      alert('Invalid stock quantity. Must be zero or positive integer.');
      return;
    }

    try {
      await updateSparePartStock(id, newQty);
      loadParts();
    } catch (err) {
      alert('Failed to update stock');
    }
  };

  return (
    <div className="card-box" style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={22} color="var(--primary)" />
            Spare Parts Inventory
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Monitor stock availability, SKU numbers, unit pricing, and manual stock updates</p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={16} />
          {showAddForm ? 'Cancel' : 'Add Spare Part'}
        </button>
      </div>

      {errorMsg && (
        <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '12px 16px', background: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46', borderRadius: '8px', marginBottom: '16px', fontSize: '0.88rem' }}>
          {successMsg}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleAddPart} style={{ background: 'var(--bg-subtle)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px' }}>Add Spare Part to Stock</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label className="form-label">Part Name</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="e.g. Synthetic Engine Oil 4L"
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">Part Number / SKU</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="e.g. OIL-SYN-4L"
                value={partNumber}
                onChange={(e) => setPartNumber(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">Initial Quantity Available</label>
              <input 
                type="number" 
                className="form-control"
                min="0"
                value={quantityAvailable}
                onChange={(e) => setQuantityAvailable(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">Unit Price (₹)</label>
              <input 
                type="number" 
                step="0.01"
                className="form-control"
                placeholder="e.g. 1450.00"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Save Spare Part</button>
        </form>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
          <RefreshCw className="spin" size={24} />
          <p style={{ marginTop: '8px' }}>Loading Inventory...</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Part ID</th>
                <th>Part Name</th>
                <th>SKU Part Number</th>
                <th>Unit Price</th>
                <th>Quantity Available</th>
                <th>Stock Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {parts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No spare parts registered in inventory.</td>
                </tr>
              ) : (
                parts.map((p) => (
                  <tr key={p.id}>
                    <td><strong>#{p.id}</strong></td>
                    <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{p.part_name}</td>
                    <td><code>{p.part_number}</code></td>
                    <td style={{ fontWeight: '600' }}>₹{parseFloat(p.unit_price).toFixed(2)}</td>
                    <td>
                      <strong style={{ fontSize: '1rem', color: p.quantity_available < 5 ? '#DC2626' : 'var(--text-main)' }}>
                        {p.quantity_available}
                      </strong>
                    </td>
                    <td>
                      {p.quantity_available === 0 ? (
                        <span className="badge badge-cancelled">Out of Stock</span>
                      ) : p.quantity_available < 10 ? (
                        <span className="badge badge-pending">Low Stock</span>
                      ) : (
                        <span className="badge badge-completed">In Stock</span>
                      )}
                    </td>
                    <td>
                      <button 
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => handleUpdateStock(p.id, p.quantity_available)}
                      >
                        <Edit3 size={12} />
                        Update Stock
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
