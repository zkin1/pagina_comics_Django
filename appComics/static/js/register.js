// Obtener el formulario de registro
const registerForm = document.getElementById('register-form');

// Manejar el envío del formulario
registerForm.addEventListener('submit', (event) => {
  event.preventDefault(); // Evitar el envío del formulario

  // Obtener los valores de los campos
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  // Validar que las contraseñas coincidan
  if (password !== confirmPassword) {
    alert('Las contraseñas no coinciden');
    return;
  }

  // Aquí puedes realizar la lógica de registro
  // Enviar los datos a la API
  fetch('http://localhost:3001/api/registros', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ usuario: username, email: email, contraseña: password })
  })
    .then(response => response.text())
    .then(data => {
      console.log(data);
      alert('Registro exitoso');
      // Redirigir al usuario a la página de inicio de sesión
      window.location.href = 'login.html';
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error al registrar el usuario');
    });
}); // Cerrar el bloque de la función addEventListener y el bloque del archivo register.js