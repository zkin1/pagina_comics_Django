document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('register-form');

  if (registerForm) {
      registerForm.addEventListener('submit', function(event) {
          event.preventDefault();

          // Obtener los valores de los campos
          const username = document.getElementById('username').value;
          const email = document.getElementById('email').value;
          const password1 = document.getElementById('password1').value;
          const password2 = document.getElementById('password2').value;

          const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]');

          if (!csrftoken) {
              console.error('No se encontró el token CSRF');
              return;
          }

          // Validar que las contraseñas coincidan
          if (password1 !== password2) {
              alert('Las contraseñas no coinciden');
              return;
          }

          // Enviar los datos al servidor utilizando Django
          fetch('/register/', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'X-CSRFToken': csrftoken.value
              },
              body: JSON.stringify({
                  username: username,
                  email: email,
                  password1: password1,
                  password2: password2
              })
          })
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  alert('Registro exitoso');
                  window.location.href = '/';  // Redirige a la página principal
              } else {
                  let errorMessage = 'Error al registrar:';
                  const errors = JSON.parse(data.errors);
                  for (let field in errors) {
                      errorMessage += `\n${field}: ${errors[field][0].message}`;
                  }
                  alert(errorMessage);
              }
          })
          .catch(error => {
              console.error('Error:', error);
              alert('Error al registrar el usuario');
          });
      });
  } else {
      console.error('No se encontró el formulario de registro');
  }
});