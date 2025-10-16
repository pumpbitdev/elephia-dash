const API_URL = "http://62.169.27.35:3000/api/transactions"; // Ajusta el puerto si es distinto
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
  });

  // --- Paginación ---
  pageInfo.textContent = `Página ${currentPage} de ${Math.ceil(
    transactions.length / pageSize
  )}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage * pageSize >= transactions.length;
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
      method: "PATCH",
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

// ---------- INICIO ----------
loadTransactions();
