/* ============================================================
   ESHOP — Admin Panel Logic (CRUD)
   ============================================================ */

let deleteTargetId = null;

/* ── LOAD PRODUCTS TABLE ── */
async function loadAdminProducts() {
  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="7" class="table-loading">Loading…</td></tr>';

  const { ok, data } = await apiFetch('/admins/products');

  const countEl = document.getElementById('totalProducts');
  if (!ok || !data.products?.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="table-loading">No products found.</td></tr>';
    if (countEl) countEl.textContent = '0';
    return;
  }

  if (countEl) countEl.textContent = data.products.length;

  tbody.innerHTML = data.products.map(p => `
    <tr>
      <td><span style="font-family:var(--font-mono);font-size:11px;color:var(--text-3)">#${p.id}</span></td>
      <td><img class="table-img" src="${p.imageLink}" alt="${p.name}" onerror="imgFallback(this)"/></td>
      <td class="table-name">${p.name}</td>
      <td><span style="font-family:var(--font-mono);font-size:11px;background:var(--gold-dim);color:var(--gold);padding:3px 8px;border-radius:2px">${p.category}</span></td>
      <td class="table-price">${formatPrice(p.price)}</td>
      <td class="${p.stock <= 3 ? 'table-stock-low' : 'table-stock-ok'}">${p.stock}</td>
      <td>
        <div class="table-actions">
          <button class="btn-icon" title="Edit" onclick="startEdit(${JSON.stringify(p).replace(/"/g, '&quot;')})">✎</button>
          <button class="btn-icon danger" title="Delete" onclick="openDeleteModal(${p.id}, '${p.name.replace(/'/g, "\\'")}')">✕</button>
        </div>
      </td>
    </tr>
  `).join('');
}

/* ── SUBMIT (ADD / UPDATE) ── */
async function submitProduct() {
  const id          = document.getElementById('editProductId')?.value;
  const name        = document.getElementById('pName')?.value.trim();
  const category    = document.getElementById('pCategory')?.value.trim();
  const price       = parseFloat(document.getElementById('pPrice')?.value);
  const stock       = parseInt(document.getElementById('pStock')?.value);
  const imageLink   = document.getElementById('pImageLink')?.value.trim();
  const description = document.getElementById('pDescription')?.value.trim();
  const errEl       = document.getElementById('formError');

  // Basic validation
  if (!name || name.length < 3) { showError(errEl, 'Name must be at least 3 characters'); return; }
  if (!category)                 { showError(errEl, 'Category is required'); return; }
  if (!price || price < 10)      { showError(errEl, 'Price must be at least ₹10'); return; }
  if (!stock || stock < 1)       { showError(errEl, 'Stock must be at least 1'); return; }
  if (!imageLink || imageLink.length < 20) { showError(errEl, 'Please enter a valid image URL (min 20 chars)'); return; }
  if (!description || description.length < 20) { showError(errEl, 'Description must be at least 20 characters'); return; }

  const body = { name, category, price, stock, imageLink, description };
  const isEdit = !!id;
  const path   = isEdit ? `/admins/products/${id}` : '/admins/products';
  const method = isEdit ? 'PUT' : 'POST';

  showLoading();
  const { ok, data } = await apiFetch(path, { method, body: JSON.stringify(body) });
  hideLoading();

  if (ok) {
    showToast(isEdit ? `${data.product?.name} updated!` : `${data.product?.name} added!`, 'success');
    resetForm();
    loadAdminProducts();
  } else {
    const msg = typeof data.error === 'object'
      ? Object.values(data.error).join(', ')
      : (data.error || 'Operation failed');
    showError(errEl, msg);
  }
}

/* ── EDIT ── */
function startEdit(p) {
  document.getElementById('editProductId').value  = p.id;
  document.getElementById('pName').value          = p.name;
  document.getElementById('pCategory').value      = p.category;
  document.getElementById('pPrice').value         = p.price;
  document.getElementById('pStock').value         = p.stock;
  document.getElementById('pImageLink').value     = p.imageLink;
  document.getElementById('pDescription').value   = p.description;

  document.getElementById('formTitle').textContent    = 'Edit Product';
  document.getElementById('submitBtn').textContent    = 'Update Product';
  document.getElementById('cancelBtn').style.display  = 'inline-flex';
  const badge = document.getElementById('formModeBadge');
  badge.textContent = 'EDITING';
  badge.className = 'form-mode-badge edit';

  document.querySelector('.admin-form-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetForm() {
  document.getElementById('editProductId').value  = '';
  document.getElementById('pName').value          = '';
  document.getElementById('pCategory').value      = '';
  document.getElementById('pPrice').value         = '';
  document.getElementById('pStock').value         = '';
  document.getElementById('pImageLink').value     = '';
  document.getElementById('pDescription').value   = '';

  document.getElementById('formTitle').textContent    = 'Add New Product';
  document.getElementById('submitBtn').textContent    = 'Add Product';
  document.getElementById('cancelBtn').style.display  = 'none';
  const badge = document.getElementById('formModeBadge');
  badge.textContent = 'NEW';
  badge.className = 'form-mode-badge';
}

/* ── DELETE ── */
function openDeleteModal(id, name) {
  deleteTargetId = id;
  const nameEl = document.getElementById('deleteProductName');
  if (nameEl) nameEl.textContent = `"${name}" will be permanently removed.`;
  document.getElementById('deleteModal')?.classList.add('active');
}

function closeDeleteModal(e) {
  if (e && e.target !== document.getElementById('deleteModal')) return;
  document.getElementById('deleteModal')?.classList.remove('active');
  deleteTargetId = null;
}

async function confirmDelete() {
  if (!deleteTargetId) return;
  showLoading();
  const { ok, data } = await apiFetch(`/admins/products/${deleteTargetId}`, { method: 'DELETE' });
  hideLoading();

  closeDeleteModal();
  if (ok) {
    showToast(`Product deleted successfully`, 'success');
    loadAdminProducts();
  } else {
    showToast(data.error || 'Delete failed', 'error');
  }
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  loadAdminProducts();
});
