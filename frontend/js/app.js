console.log("✅ Archivo JS cargado correctamente");

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM completamente cargado");

  const createAlertButton = document.getElementById("create-alert-button");
  const campaignSelect     = document.getElementById("campaign");
  const metricSelect       = document.getElementById("metric");
  const resumen            = document.getElementById("resumen");

  const API_BASE = "https://us-central1-kam-bi-451418.cloudfunctions.net";

  const showError = (msg, error) => {
    alert(`⚠️ ${msg}`);
    console.error(`❌ ${msg}`, error);
  };

  const populateSelect = (selectEl, items, placeholder) => {
    selectEl.innerHTML = `<option value="">${placeholder}</option>`;
    items.forEach(item => {
      const opt = document.createElement("option");
      opt.value       = item;
      opt.textContent = item;
      selectEl.appendChild(opt);
    });
  };

  // 1) Traer campañas
  const fetchCampaigns = async () => {
    try {
      const resp = await fetch(`${API_BASE}/get-campaigns`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      populateSelect(campaignSelect, data, "Seleccione una campaña");
    } catch (err) {
      showError("No se pudieron cargar las campañas.", err);
    }
  };

  // 2) Traer métricas según campaña seleccionada
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
    } catch (err) {
      showError("No se pudieron cargar las métricas para la campaña seleccionada.", err);
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
      alert("❗ Por favor completa los campos obligatorios: Campaign, Metric y Target.");
      return;
    }

    // Generar ID único para la alerta
    const alertId = crypto.randomUUID();

    const data = {
      alertId,        // ID único
      userEmail,      // correo autenticado
      campaign,
      metric,
      target,
      frequency,
      whatsapp,
      email,
      enable: true    // alerta activa
    };

    const confirmMsg = `
🚨 Se va a crear una alerta con los siguientes parámetros:

📌 Campaign: ${campaign}
📊 Metric:   ${metric}
🎯 Target:   ${target}
⏱ Frecuencia: ${frequency || "No especificada"}
📱 WhatsApp:  ${whatsapp || "No especificado"}
📧 Email:     ${email || "No especificado"}
👤 UserEmail: ${userEmail}
🆔 AlertId:   ${alertId}

¿Deseas continuar?`;

    if (!confirm(confirmMsg)) {
      console.log("❌ Acción cancelada por el usuario.");
      return;
    }

    resumen.innerHTML = `
      <strong>Resumen:</strong><br/>
      Alerta [<strong>${alertId}</strong>] para campaña <strong>${campaign}</strong>, métrica <strong>${metric}</strong>,
      objetivo <strong>${target}</strong>, frecuencia <strong>${frequency || "No especificada"}</strong>,
      WhatsApp <strong>${whatsapp || "No especificado"}</strong>, correo <strong>${email || "No especificado"}</strong>,
      usuario <strong>${userEmail}</strong>.
    `;

    try {
      const resp = await fetch(`${API_BASE}/save-alert`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data)
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      alert("✅ La alerta fue enviada y guardada correctamente.");
    } catch (err) {
      showError("Ocurrió un error al enviar la alerta.", err);
    }
  };

  // Inicialización
  fetchCampaigns();

  campaignSelect.addEventListener("change", () => {
    const sel = campaignSelect.value;
    if (sel) fetchMetrics(sel);
    else    populateSelect(metricSelect, [], "Seleccione una métrica");
  });

  if (createAlertButton) {
    createAlertButton.addEventListener("click", handleCreateAlert);
  } else {
    console.warn("⚠️ No se encontró el botón de crear alerta.");
  }
});
