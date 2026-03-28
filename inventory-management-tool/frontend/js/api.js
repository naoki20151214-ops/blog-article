// API Configuration - Dynamically build base URL
const getAPIBaseURL = () => {
  const host = window.location.hostname;
  const port = 5000;
  return `http://${host}:${port}/api`;
};

const API_BASE_URL = getAPIBaseURL();

// API Module
const API = {
  // Products API
  products: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/products`);
      return response.json();
    },

    getById: async (id) => {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      return response.json();
    },

    getByCategory: async (category) => {
      const response = await fetch(`${API_BASE_URL}/products/category/${category}`);
      return response.json();
    },

    search: async (query) => {
      const response = await fetch(`${API_BASE_URL}/products/search/${query}`);
      return response.json();
    },

    create: async (data) => {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    update: async (id, data) => {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
      });
      return response.json();
    },
  },

  // Suppliers API
  suppliers: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/suppliers`);
      return response.json();
    },

    getById: async (id) => {
      const response = await fetch(`${API_BASE_URL}/suppliers/${id}`);
      return response.json();
    },

    getProducts: async (id) => {
      const response = await fetch(`${API_BASE_URL}/suppliers/${id}/products`);
      return response.json();
    },

    create: async (data) => {
      const response = await fetch(`${API_BASE_URL}/suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    update: async (id, data) => {
      const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
        method: 'DELETE',
      });
      return response.json();
    },
  },

  // Inventory API
  inventory: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/inventory`);
      return response.json();
    },

    getById: async (id) => {
      const response = await fetch(`${API_BASE_URL}/inventory/${id}`);
      return response.json();
    },

    getByProductId: async (productId) => {
      const response = await fetch(`${API_BASE_URL}/inventory/product/${productId}`);
      return response.json();
    },

    getLowStock: async (level = 50) => {
      const response = await fetch(`${API_BASE_URL}/inventory/alert/low-stock?level=${level}`);
      return response.json();
    },

    create: async (data) => {
      const response = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    adjust: async (id, data) => {
      const response = await fetch(`${API_BASE_URL}/inventory/${id}/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    recordCount: async (id, data) => {
      const response = await fetch(`${API_BASE_URL}/inventory/${id}/count`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    update: async (id, data) => {
      const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },

    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
        method: 'DELETE',
      });
      return response.json();
    },
  },
};

// Helper Functions
function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  document.body.insertBefore(alertDiv, document.body.firstChild);

  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

function showLoading() {
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'loading';
  loadingDiv.innerHTML = '<div class="spinner"></div><p>読み込み中...</p>';
  loadingDiv.id = 'loading-indicator';
  document.body.appendChild(loadingDiv);
}

function hideLoading() {
  const loadingDiv = document.getElementById('loading-indicator');
  if (loadingDiv) {
    loadingDiv.remove();
  }
}

// Format Currency
function formatCurrency(value) {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(value);
}

// Format Date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP');
}

// Format DateTime
function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('ja-JP');
}
