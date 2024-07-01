let loggedInUser = null;


const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch('http://localhost:3001/api/registros')
    .then(response => response.json())
    .then(data => {
      const user = data.find(user => user.usuario === username && user.contraseña === password);
      if (user) {
        alert('Inicio de sesión exitoso');
        localStorage.setItem('loggedInUser', user.usuario);
        const previousPage = localStorage.getItem('previousPage');
        if (previousPage) {
          window.location.href = previousPage;
          localStorage.removeItem('previousPage');
        } else {
          window.location.href = 'index.html';
        }
      } else {
        alert('Credenciales incorrectas');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error al obtener los datos de usuario')
    });
});