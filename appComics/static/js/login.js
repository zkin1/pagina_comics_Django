document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // Decide si enviar como JSON o como formulario
            const useJson = false;  // Cambia a true si prefieres usar JSON

            if (useJson) {
                fetch('/login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({ usuario: username, contraseña: password })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        localStorage.setItem('loggedInUser', data.username);
                        updateNavBar(data.username);
                        window.location.href = '/';
                    } else {
                        alert('Credenciales incorrectas');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error al iniciar sesión');
                });
            } else {
                loginForm.submit();  // Envía el formulario normalmente
            }
        });
    }

    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(event) {
            event.preventDefault();
            logout();
        });
    }

    checkLoginStatus();

    function updateNavBar(username) {
        const loginLink = document.getElementById('login-link');
        const registerLink = document.getElementById('registro-link');
        const userInfo = document.getElementById('user-info');
        const usernameDisplay = document.getElementById('username-display');
        const logoutLink = document.getElementById('logout-link');

        if (username) {
            loginLink.style.display = 'none';
            registerLink.style.display = 'none';
            userInfo.style.display = 'block';
            logoutLink.style.display = 'block';
            usernameDisplay.textContent = username;
        } else {
            loginLink.style.display = 'block';
            registerLink.style.display = 'block';
            userInfo.style.display = 'none';
            logoutLink.style.display = 'none';
            usernameDisplay.textContent = '';
        }
    }

    function checkLoginStatus() {
        fetch('/check-login-status/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(data => {
            if (data.is_authenticated) {
                updateNavBar(data.username);
            } else {
                updateNavBar(null);
            }
        })
        .catch(error => {
            console.error('Error al verificar el estado de inicio de sesión:', error);
            updateNavBar(null); // Asume que no está autenticado en caso de error
        });
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    function logout() {
        fetch('/logout/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => {
            if (response.ok) {
                console.log('Cerrando sesión, eliminando de localStorage');
                localStorage.removeItem('loggedInUser');
                updateNavBar(null);
                window.location.href = '/';
            } else {
                throw new Error('Error al cerrar sesión');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al cerrar sesión');
        });
    }
});