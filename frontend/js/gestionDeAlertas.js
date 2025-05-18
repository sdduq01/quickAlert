document.addEventListener("DOMContentLoaded", () => {
    const userEmail = localStorage.getItem("userEmail");
  
    if (!userEmail || (!userEmail.endsWith("@konecta.com") && !userEmail.endsWith("@gmail.com"))) {
      alert("Debes iniciar sesión con un correo autorizado.");
      window.location.href = "index.html";
      return;
    }
  
    document.getElementById("user-info").textContent = `Sesión iniciada: ${userEmail}`;
    fetchAlerts(userEmail);
    setupGlobalListeners(userEmail);
  });
  
  function fetchAlerts(userEmail) {
    const url = `https://management-alerts-vcl6o2ionq-uc.a.run.app/?user_email=${encodeURIComponent(userEmail)}`;
    fetch(url)
      .then(res => res.ok ? res.json() : Promise.reject("No se pudieron obtener las alertas"))
      .then(alerts => renderAlerts(alerts))
      .catch(err => {
        document.getElementById("alerts-container").innerHTML = `<p class="error">${err}</p>`;
      });
  }
  
  function renderAlerts(alerts) {
    const container = document.getElementById("alerts-container");
    container.innerHTML = "";
  
    if (alerts.length === 0) {
      container.innerHTML = "<p>No tienes alertas configuradas.</p>";
      return;
    }
  
    alerts.forEach(alert => {
      const card = document.createElement("div");
      card.className = "alert-card";
      card.dataset.alertId = alert.alertId;
      card.dataset.enabled = alert.enabled;
  
      card.innerHTML = `
        <h2>${alert.campaign}</h2>
        <p><strong>Métrica:</strong> ${alert.metric}</p>
        <p><strong>Objetivo:</strong> ${alert.target}</p>
        <p><strong>Frecuencia:</strong> ${alert.frequency}</p>
        <p><strong>WhatsApp:</strong> ${alert.whatsapp}</p>
        <p><strong>Email:</strong> ${alert.email}</p>
        <p><strong>Estado:</strong> ${String(alert.enabled) === "true" ? "✅ Activa" : "⛔ Inactiva"}</p>
        <div class="buttons">
          <button class="toggle-btn">${alert.enabled ? "Desactivar" : "Activar"}</button>
          <button class="edit-btn">Editar</button>
          <button class="delete-btn">Eliminar</button>
        </div>
      `;
  
      card.alertData = alert; // guardar el objeto para usarlo al editar
      container.appendChild(card);
    });
  }
  
  function setupGlobalListeners(userEmail) {
    document.getElementById("alerts-container").addEventListener("click", function (e) {
      const card = e.target.closest(".alert-card");
      if (!card) return;
  
      const alertData = card.alertData;
  
      if (e.target.classList.contains("toggle-btn")) {
        toggleAlert(alertData.alertId, alertData.enabled, userEmail);
      }
  
      if (e.target.classList.contains("edit-btn")) {
        editAlert(alertData);
      }
  
      if (e.target.classList.contains("delete-btn")) {
        deleteAlert(alertData.alertId, userEmail);
      }
    });
  
    // Modal y formulario
    document.getElementById("closeModal").addEventListener("click", closeModal);
    document.getElementById("cancelEdit").addEventListener("click", closeModal);
  
    document.getElementById("editAlertForm").addEventListener("submit", function (e) {
      e.preventDefault();
  
      const alertId = document.getElementById("editAlertId").value;
      const campaign = document.getElementById("editCampaign").value.trim();
      const metric = document.getElementById("editMetric").value.trim();
      const target = document.getElementById("editTarget").value.trim();
      const frequency = document.getElementById("editFrequency").value.trim();
      const whatsapp = document.getElementById("editWhatsapp").value.trim();
      const email = document.getElementById("editEmail").value.trim();
      const enabled = document.getElementById("editEnabled").value === "true";
  
      const url = `https://management-alerts-vcl6o2ionq-uc.a.run.app/?user_email=${encodeURIComponent(userEmail)}`;
  
      fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alertId,
          campaign,
          metric,
          target,
          frequency,
          whatsapp,
          email,
          enabled
        })
      })
        .then(res => {
          if (!res.ok) throw new Error("Error al actualizar la alerta");
          return res.json();
        })
        .then(() => {
          closeModal();
          fetchAlerts(userEmail);
        })
        .catch(err => alert(err.message || "Error al actualizar la alerta"));
    });
  }
  
  function toggleAlert(alertId, currentState, userEmail) {
    const url = `https://management-alerts-vcl6o2ionq-uc.a.run.app/?user_email=${encodeURIComponent(userEmail)}`;
    fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertId, enabled: !currentState })
    })
      .then(res => {
        if (!res.ok) throw new Error("No se pudo cambiar el estado de la alerta");
        return res.json();
      })
      .then(() => fetchAlerts(userEmail))
      .catch(err => alert(err.message));
  }
  
  function deleteAlert(alertId, userEmail) {
    if (!confirm("¿Estás seguro de eliminar esta alerta?")) return;
  
    const url = `https://management-alerts-vcl6o2ionq-uc.a.run.app/?user_email=${encodeURIComponent(userEmail)}`;
    fetch(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertId })
    })
      .then(res => {
        if (!res.ok) throw new Error("No se pudo eliminar la alerta");
        return res.json();
      })
      .then(() => fetchAlerts(userEmail))
      .catch(err => alert(err.message));
  }
  
  function editAlert(alertData) {
    const modal = document.getElementById("editModal");
    modal.style.display = "flex";
  
    document.getElementById("editAlertId").value = alertData.alertId;
    document.getElementById("editCampaign").value = alertData.campaign;
    document.getElementById("editMetric").value = alertData.metric;
    document.getElementById("editTarget").value = alertData.target;
    document.getElementById("editFrequency").value = alertData.frequency;
    document.getElementById("editWhatsapp").value = alertData.whatsapp;
    document.getElementById("editEmail").value = alertData.email;
    document.getElementById("editEnabled").value = alertData.enabled ? "true" : "false";
  }
  
  function closeModal() {
    document.getElementById("editModal").style.display = "none";
  }
  