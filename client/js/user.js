const API_TX = "http://localhost:3000/api/transactions";
const API_PM = "http://localhost:3000/api/payment-methods";

const tableBody = document.querySelector("#userTransactionsTable tbody");
const prevBtn = document.getElementById("prevPage");
const nextBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");
const userTitle = document.getElementById("userTitle");
const pmContainer = document.getElementById("userPaymentMethods");
const pmList = document.getElementById("paymentMethodsList");

let transactions = [];
let currentPage = 1;
const pageSize = 5;

// Obtener telegramId de la URL
const params = new URLSearchParams(window.location.search);
const telegramId = params.get("telegramId");
userTitle.textContent = `Transacciones del Usuario: ${telegramId}`;

// ---------- CARGAR DATOS ----------
async function loadUserTransactions() {
  try {
    const res = await fetch(`${API_TX}/${telegramId}`);
    if (!res.ok) throw new Error("Error al obtener transacciones");
    transactions = await res.json();
    renderTable();
  } catch (err) {
    console.error(err);
    tableBody.innerHTML = "<tr><td colspan='8'>Error al cargar transacciones.</td></tr>";
  }
}

// ---------- RENDER TABLE ----------
function renderTable() {
  tableBody.innerHTML = "";
  const start = (currentPage - 1) * pageSize;
  const pageItems = transactions.slice(start, start + pageSize);

  pageItems.forEach(tx => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${tx.id}</td>
      <td>${tx.transaction_type}</td>
      <td>$${parseFloat(tx.amount_usd).toFixed(2)}</td>
      <td>$${parseFloat(tx.commission_usd).toFixed(2)}</td>
      <td>$${parseFloat(tx.total_usd).toFixed(2)}</td>
      <td>${parseFloat(tx.rate_bs).toFixed(2)}</td>
      <td>${parseFloat(tx.total_bs).toFixed(2)}</td>
      <td>${tx.status}</td>
    `;
    tableBody.appendChild(row);
  });

  pageInfo.textContent = `Página ${currentPage} de ${Math.ceil(transactions.length / pageSize)}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage * pageSize >= transactions.length;
}

// ---------- PAGINACIÓN ----------
prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
});

nextBtn.addEventListener("click", () => {
  if (currentPage * pageSize < transactions.length) {
    currentPage++;
    renderTable();
  }
});

// ---------- MÉTODOS DE PAGO ----------
async function loadPaymentMethods() {
  try {
    const res = await fetch(`${API_PM}/${telegramId}`);
    if (!res.ok) throw new Error("Error al obtener métodos de pago");
    const methods = await res.json();

    pmList.innerHTML = "";
    if (methods.length === 0) {
      pmList.innerHTML = "<li>No hay métodos de pago registrados</li>";
    } else {
      methods.forEach(m => {
        const li = document.createElement("li");
        li.textContent = `Tipo: ${m.method_type} | Cuenta: ${m.account_details || m.nickname || "-"}`;
        pmList.appendChild(li);
      });
    }
    pmContainer.style.display = "block";
  } catch (err) {
    console.error(err);
    pmList.innerHTML = "<li>Error al cargar métodos de pago</li>";
    pmContainer.style.display = "block";
  }
}

// ---------- INICIO ----------
loadUserTransactions();
loadPaymentMethods();
