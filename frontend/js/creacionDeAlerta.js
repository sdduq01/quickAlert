const API_BASE = "https://us-central1-kam-bi-451418.cloudfunctions.net";

document.addEventListener("DOMContentLoaded", async () => {
  const userEmail = localStorage.getItem("userEmail");

  if (!userEmail || !userEmail.endsWith("@gmail.com")) {
    alert("Unauthorized access. Please log in with your @konecta.com account.");
    window.location.href = "index.html";
    return;
  }

  const emailInput = document.getElementById("email");
  if (userEmail && emailInput) {
    emailInput.value = userEmail;
  }

  const campaignSelect = document.getElementById("campaign");
  const metricSelect = document.getElementById("metric");

  try {
    const response = await fetch(`${API_BASE}/get-campaigns`);
    if (!response.ok) throw new Error("Error fetching campaigns");
    const data = await response.json();

    data.campaigns.forEach(campaign => {
      const option = document.createElement("option");
      option.value = campaign;
      option.textContent = campaign;
      campaignSelect.appendChild(option);
    });

  } catch (error) {
    console.error("Error loading campaigns:", error);
    alert("No se pudieron cargar las campañas");
  }

  campaignSelect.addEventListener("change", async () => {
    const selectedCampaign = campaignSelect.value;
    metricSelect.innerHTML = "<option value=''>Cargando...</option>";

    try {
      const response = await fetch(`${API_BASE}/get-metrics?campaign=${encodeURIComponent(selectedCampaign)}`);
      if (!response.ok) throw new Error("Error fetching metrics");
      const data = await response.json();

      metricSelect.innerHTML = "<option value=''>Seleccione una métrica</option>";
      data.metrics.forEach(metric => {
        const option = document.createElement("option");
        option.value = metric;
        option.textContent = metric;
        metricSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error loading metrics:", error);
      alert("No se pudieron cargar las métricas");
      metricSelect.innerHTML = "<option value=''>Error al cargar</option>";
    }
  });

  // Mostrar modal de confirmación
  document.getElementById("create-alert-button").addEventListener("click", () => {
    const campaign = campaignSelect.value;
    const metric = metricSelect.value;
    const target = document.getElementById("target").value;
    const frequency = document.getElementById("frequency").value;
    const email = document.getElementById("email").value;

    if (!campaign || !metric || !target) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    // Mostrar resumen dentro del modal
    const resumen = `
      <strong>Campaña:</strong> ${campaign}<br>
      <strong>Métrica:</strong> ${metric}<br>
      <strong>Objetivo:</strong> ${target}<br>
      <strong>Frecuancia:</strong> ${frequency}<br>
      <strong>Email:</strong> ${email}
    `;
    document.getElementById("modal-resumen").innerHTML = resumen;

    document.getElementById("modal").classList.remove("hidden");
  });

  // Botón Confirmar del modal
  document.getElementById("confirmAlertButton").addEventListener("click", confirmarCreacionAlerta);

  // Botón Cancelar del modal
  document.getElementById("cancelAlertButton").addEventListener("click", () => {
    document.getElementById("modal").classList.add("hidden");
  });

  async function confirmarCreacionAlerta() {
    const campaign = campaignSelect.value;
    const metric = metricSelect.value;
    const target = document.getElementById("target").value;
    const frequency = document.getElementById("frequency").value;
    const whatsapp = document.getElementById("whatssapp").value;
    const email = document.getElementById("email").value;
    const alertId = crypto.randomUUID();
    const enable = true;

    const payload = {
      alertId,
      userEmail,
      campaign,
      metric,
      target,
      frequency,
      whatsapp,
      email,
      enable
    };

    try {
      const resp = await fetch(`${API_BASE}/save-alert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) throw new Error("Error saving alert");

      document.getElementById("resumen").innerHTML =
        `<p class="success-message">✅ Alerta creada exitosamente con ID: ${alertId}</p>`;

      // Cerrar modal
      document.getElementById("modal").classList.add("hidden");

    } catch (error) {
      console.error("Error creating alert:", error);
      alert("Hubo un error al crear la alerta.");
    }
  }
});
