// js/creacionDeAlerta.js
console.log("✅ creacionDeAlerta.js cargado");

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM listo para creacionDeAlerta.js");

  // Prefill del email autenticado
  const storedEmail = localStorage.getItem("userEmail");
  if (storedEmail) {
    const emailInput = document.getElementById("email");
    if (emailInput) {
      emailInput.value = storedEmail;
      console.log("Email pre‑poblado:", storedEmail);
    }
  }

  // Elementos del formulario
  const campaignSelect     = document.getElementById("campaign");
  const metricSelect       = document.getElementById("metric");
  const createAlertButton  = document.getElementById("create-alert-button");
  const resumen            = document.getElementById("resumen");

  const API_BASE = "https://us-central1-kam-bi-451418.cloudfunctions.net";

  const showError = (msg, err) => {
    alert(`⚠️ ${msg}`);
    console.error(`❌ ${msg}`, err);
  };

  const populateSelect = (el, items, placeholder) => {
    el.innerHTML = `<option value="">${placeholder}</option>`;
    items.forEach(i => {
      const opt = document.createElement("option");
      opt.value       = i;
      opt.textContent = i;
      el.appendChild(opt);
    });
  };

  // 1) Fetch campañas
  const fetchCampaigns = async () => {
    try {
      const resp = await fetch(`${API_BASE}/get-campaigns`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      populateSelect(campaignSelect, data, "Seleccione una campaña");
    } catch (e) {
      showError("No se pudieron cargar las campañas.", e);
    }
  };

  // 2) Fetch métricas
  const fetchMetrics = async (campaign) => {
    try {
      const resp = await fetch(`${API_BASE}/get-metrics`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ campaign })
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      populateSelect(metricSelect, data, "Seleccione una métrica");
    } catch (e) {
      showError("No se pudieron cargar las métricas.", e);
    }
  };

  // 3) Crear alerta
  const handleCreateAlert = async () => {
    const campaign  = campaignSelect.value.trim();
    const metric    = metricSelect.value.trim();
    const target    = document.getElementById("target").value.trim();
    const frequency = document.getElementById("frequency").value.trim();
    const whatsapp  = document.getElementById("whatssapp").value.trim();
    const email     = document.getElementById("email").value.trim();
    const userEmail = localStorage.getItem("userEmail");

    if (!campaign || !metric || !target) {
      alert("❗ Completa Campaign, Metric y Target.");
      return;
    }

    const alertId = crypto.randomUUID();
    const data = { alertId, userEmail, campaign, metric, target, frequency, whatsapp, email, enable: true };

    const msg = `
🚨 Crear alerta:

🆔 ID: ${alertId}
👤 User: ${userEmail}
📌 Campaign: ${campaign}
📊 Metric:   ${metric}
🎯 Target:   ${target}
⏱ Frecuencia: ${frequency || "N/A"}
📱 WhatsApp:  ${whatsapp || "N/A"}
📧 Email:     ${email || "N/A"}

¿Continuar?`;

    if (!confirm(msg)) return;

    resumen.innerHTML = `
      <strong>Summary:</strong><br/>
      Alert <strong>${alertId}</strong> for <strong>${campaign}</strong> / <strong>${metric}</strong>,
      target <strong>${target}</strong>, freq <strong>${frequency || "N/A"}</strong>,
      WA <strong>${whatsapp || "N/A"}</strong>, email <strong>${email || "N/A"}</strong>,
      user <strong>${userEmail}</strong>.
    `;

    try {
      const resp = await fetch(`${API_BASE}/save-alert`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data)
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      alert("✅ Alerta creada correctamente.");
    } catch (e) {
      showError("Error al crear la alerta.", e);
    }
  };

  // Inicializar dropdowns
  fetchCampaigns();
  campaignSelect.addEventListener("change", () => {
    const c = campaignSelect.value;
    if (c) fetchMetrics(c);
    else  populateSelect(metricSelect, [], "Seleccione una métrica");
  });

  // Botón
  if (createAlertButton) createAlertButton.addEventListener("click", handleCreateAlert);
  else console.warn("⚠️ No se encontró create-alert-button");
});
