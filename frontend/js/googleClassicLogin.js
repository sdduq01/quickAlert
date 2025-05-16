//const allowedDomain = "@konecta.com";
const allowedDomain = "@gmail.com";

function handleCredentialResponse(response) {
  const decoded = parseJwt(response.credential);
  const email = decoded.email;

  console.log("Email obtenido de Google:", email);

  if (email && email.endsWith(allowedDomain)) {
    console.log("Dominio válido. Guardando email y redirigiendo...");
    localStorage.setItem('userEmail', email);

    window.location.href = "creacionDeAlerta.html";
  } else {
    console.warn("Dominio inválido:", email);
    document.getElementById("error-message").textContent =
      "Solo se permite ingresar con correo " + allowedDomain;
  }
}

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
  google.accounts.id.initialize({
    client_id: "994887374053-nel9101klo1kv4k1j0thga967ld9mvi1.apps.googleusercontent.com", //Llave que se debe disponibilizar en console APIis & Services/Credentials
    callback: handleCredentialResponse
  });

  google.accounts.id.renderButton(
    document.getElementById("google-button"),
    {
      theme: "outline",
      size: "large",
      width: "280",
      type: "standard"
    }
  );
};
