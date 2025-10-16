const API_URL = "http://62.169.27.35:3000/api/transactions";
const API_URL2 = "http://62.169.27.35:3000/api/payment-methods";
const tableBody = document.querySelector("#transactionsTable tbody");
const prevBtn = document.getElementById("prevPage");
const nextBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");

let transactions = [];
let currentPage = 1;
const pageSize = 5;

// ---------- CARGAR Y MOSTRAR DATOS ----------
async function loadTransactions() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Error al obtener transacciones");
    transactions = await res.json();
    renderTable();
  } catch (err) {
    console.error("Error:", err);
    tableBody.innerHTML =
      "<tr><td colspan='5'>Error al cargar las transacciones.</td></tr>";
  }
}

function renderTable() {
    tableBody.innerHTML = "";
  
    const start = (currentPage - 1) * pageSize;
    const pageItems = transactions.slice(start, start + pageSize);
  
    pageItems.forEach((tx) => {
      const row = document.createElement("tr");
  
      const idCell = createCell(tx.id, "ID");
      const userCell = createCell(tx.user_telegram_id || "-", "Usuario");
      const typeCell = createCell(tx.transaction_type || "-", "Tipo");
      const amountCell = createCell(
        `$${parseFloat(tx.amount_usd || 0).toFixed(2)}`,
        "Monto"
      );
      const statusCell = createCell(tx.status, "Estado");
  
      // --- Botón aprobar ---
      const actionCell = document.createElement("td");
      actionCell.setAttribute("data-label", "Acción");
      const btn = document.createElement("button");
      btn.textContent = tx.status === "Completada" ? "Aprobada" : "Aprobar";
      btn.classList.add("approve-btn");
      btn.disabled = tx.status === "Completada";
      btn.addEventListener("click", () => approveTransaction(tx.id, btn));
      actionCell.appendChild(btn);
  
      row.append(idCell, userCell, typeCell, amountCell, statusCell, actionCell);
      tableBody.appendChild(row);
  
      // --- Click en la fila para cargar métodos de pago ---
      row.addEventListener("click", () => {
        loadPaymentMethods(tx.user_telegram_id);
      });
    });
  
    pageInfo.textContent = `Página ${currentPage} de ${Math.ceil(
      transactions.length / pageSize
    )}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage * pageSize >= transactions.length;
  }
  
  // --------- Función loadPaymentMethods afuera de renderTable ---------
  async function loadPaymentMethods(userTelegramId) {
    const container = document.getElementById("userPaymentMethods");
    const list = document.getElementById("paymentMethodsList");
    container.style.display = "none";
    list.innerHTML = "";
  
    try {
      const res = await fetch(`${API_URL2}/${userTelegramId}`);
      if (!res.ok) throw new Error("Error al obtener métodos de pago");
      const methods = await res.json();
  
      if (methods.length === 0) {
        list.innerHTML = "<li>No hay métodos de pago registrados</li>";
      } else {
        methods.forEach((m) => {
          const li = document.createElement("li");
          li.textContent = `Tipo: ${m.method_type} | Nickname: ${m.nickname || "-"} | Cuenta: ${m.account_details || "-"} | Banco: ${m.pm_bank_name || "-"} | Tel: ${m.pm_phone_number || "-"}`;
          list.appendChild(li);
        });
      }
      container.style.display = "block";
    } catch (err) {
      console.error(err);
      list.innerHTML = "<li>Error al cargar métodos de pago</li>";
      container.style.display = "block";
    }
  }

function createCell(text, label) {
  const td = document.createElement("td");
  td.textContent = text;
  td.setAttribute("data-label", label);
  return td;
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

// ---------- APROBAR TRANSACCIÓN ----------
async function approveTransaction(id, button) {
  try {
    button.disabled = true;
    button.textContent = "Aprobando...";

    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Completada" }),
    });

    if (!res.ok) throw new Error("Error al aprobar transacción");

    const tx = transactions.find((t) => t.id === id);
    if (tx) tx.status = "Completada";
    renderTable();
  } catch (err) {
    console.error("Error al aprobar:", err);
    button.disabled = false;
    button.textContent = "Aprobar";
  }
}

const sidebar = document.getElementById("sidebar");
const openBtn = document.getElementById("openSidebar");
const closeBtn = document.getElementById("closeSidebar");

openBtn.addEventListener("click", () => {
  sidebar.style.left = "0";
});

closeBtn.addEventListener("click", () => {
  sidebar.style.left = "-260px";
});


// ---------- INICIO ----------
loadTransactions();
