// Dominio permitido
//const allowedDomain = "@konecta.com";  // Ajusta aquí al dominio real de tu cuenta
const allowedDomain = "@gmail.com";  // Ajusta aquí al dominio real de tu cuenta

// Función que maneja la respuesta de Google
function handleCredentialResponse(response) {
  // Decodificar el JWT para obtener el email
  const decoded = parseJwt(response.credential);
  const email = decoded.email;

  console.log("Email obtenido de Google:", email);

  if (email && email.endsWith(allowedDomain)) {
    console.log("Dominio válido. Guardando email y redirigiendo...");
    // Guardar el email en localStorage
    localStorage.setItem('userEmail', email);

    // Redirigir
    window.location.href = "creacionDeAlerta.html";
  } else {
    console.warn("Dominio inválido:", email);
    // Mostrar error al usuario
    document.getElementById("error-message").textContent =
      "Solo se permite ingresar con correo " + allowedDomain;
  }
}

// Función para decodificar el JWT de Google
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

window.onload = function() {
  // Inicializar Google Identity Services
  google.accounts.id.initialize({
    client_id: "994887374053-nel9101klo1kv4k1j0thga967ld9mvi1.apps.googleusercontent.com",
    callback: handleCredentialResponse
  });

  // Renderizar el botón oficial dentro del contenedor #google-button
  google.accounts.id.renderButton(
    document.getElementById("google-button"),
    {
      theme: "outline",
      size: "large",
      width: "280",    // ancho fijo para evitar saltos
      type: "standard" // estilo del botón
    }
  );

  // Opcional: mostrar prompt automático
  // google.accounts.id.prompt();
};
