const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch('{% url "login" %}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': '{{ csrf_token }}'
    },
    body: JSON.stringify({ username: username, password: password })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Inicio de sesión exitoso');
        localStorage.setItem('loggedInUser', data.username);
        const previousPage = localStorage.getItem('previousPage');
        if (previousPage) {
          window.location.href = previousPage;
          localStorage.removeItem('previousPage');
        } else {
          window.location.href = '{% url "index" %}';
        }
      } else {
        alert('Credenciales incorrectas');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error al iniciar sesión');
    });
});