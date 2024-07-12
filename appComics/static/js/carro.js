document.addEventListener('DOMContentLoaded', () => {
  // Obtener referencias a los elementos del DOM
  const cartItemsContainer = document.getElementById('cartItems');
  const cartTotalElement = document.getElementById('cartTotal');
  const cartItemCountElement = document.getElementById('cartItemCount');
  const proceedToPaymentButton = document.getElementById('proceedToPaymentButton');
  const cartNavItem = document.getElementById('cartNavItem');

  // Función para verificar si el usuario está autenticado
  function checkUserAuthentication() {
    return fetch('/check_authentication/')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => data.is_authenticated)
      .catch(error => {
        console.error('Error checking user authentication:', error);
        return false;
      });
  }

  // Función para mostrar una alerta y redirigir al login
  function showLoginAlertAndRedirect() {
    return new Promise((resolve) => {
      alert('Debes iniciar sesión para acceder al carrito de compras');
      resolve({ isConfirmed: true });
    });
  }

  // Función para renderizar los elementos del carro
  function renderCartItems(cartItems) {
    if (cartItemsContainer) {
      cartItemsContainer.innerHTML = '';

      cartItems.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>
            <img src="/static${item.foto}" alt="${item.nombre}" width="50">
            ${item.nombre}
          </td>
          <td>$${item.precio}</td>
          <td>
            <input type="number" class="form-control quantity" value="${item.quantity}" min="1" max="${item.stock}" data-name="${item.nombre}">
          </td>
          <td>$${Math.round(item.subtotal)}</td>
          <td>
            <button type="button" class="btn btn-danger btn-sm remove-item" data-name="${item.nombre}">Eliminar</button>
          </td>
        `;
        cartItemsContainer.appendChild(row);
      });
    }

    updateCartItemCount();
  }

  // Función para calcular el total del carro
  function calculateCartTotal(cartItems) {
    const total = cartItems.reduce((acc, item) => acc + item.subtotal, 0);
    if (cartTotalElement) {
      cartTotalElement.textContent = `$${Math.round(total)}`;
    }
  }

  function updateCartItemQuantity(nombre, quantity) {
    fetch('/carro/update_quantity/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
      body: JSON.stringify({ nombre: nombre, quantity: quantity })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        renderCartItems(data.cart_items);
        calculateCartTotal(data.cart_items);
      } else {
        console.error('Error al actualizar la cantidad:', data.error);
        alert(data.error);
      }
    })
    .catch(error => console.error('Error:', error));
  }

  function removeCartItem(nombre) {
    fetch('/carro/remove_item/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
      body: JSON.stringify({ nombre: nombre })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        renderCartItems(data.cart_items);
        calculateCartTotal(data.cart_items);
      } else {
        console.error('Error al eliminar el elemento:', data.error);
      }
    })
    .catch(error => console.error('Error:', error));
  }

  function updateCartItemCount() {
    fetch('/carro/count/')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (cartItemCountElement) {
          cartItemCountElement.textContent = data.count;
        }
      })
      .catch(error => {
        console.error('Error updating cart item count:', error);
      });
  }

  // Función para obtener el token CSRF
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

  // Cargar los elementos del carro al iniciar la página
  function loadCartItems() {
    fetch("/carro/get_items/")
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.cart_items && Array.isArray(data.cart_items)) {
          renderCartItems(data.cart_items);
          calculateCartTotal(data.cart_items);
          sessionStorage.setItem('cart', JSON.stringify(data.cart_items));
        } else {
          console.error('Unexpected data format:', data);
          alert('Error al cargar los items del carrito. Por favor, intenta de nuevo.');
        }
      })
      .catch(error => {
        console.error('Error loading cart items:', error);
        alert('Error al cargar los items del carrito. Por favor, intenta de nuevo.');
      });
  }

  // Función para redirigir al formulario de envío
  function proceedToPayment() {
    window.location.href = '/envio/';
  }

  // Event listener para el clic en el carrito del nav
  if (cartNavItem) {
    cartNavItem.addEventListener('click', (event) => {
      event.preventDefault();
  
      checkUserAuthentication().then(isAuthenticated => {
        if (isAuthenticated) {
          window.location.href = '/carro/';
        } else {
          console.log('El usuario no está autenticado');
          showLoginAlertAndRedirect().then((result) => {
            if (result.isConfirmed) {
              window.location.href = '/login/';
            }
          });
        }
      });
    });
  }

  // Inicialización y event listeners
  if (cartItemsContainer) {
    loadCartItems();

    cartItemsContainer.addEventListener('change', (event) => {
      if (event.target.classList.contains('quantity')) {
        const nombre = event.target.dataset.name;
        const quantity = parseInt(event.target.value);
        updateCartItemQuantity(nombre, quantity);
      }
    });

    cartItemsContainer.addEventListener('click', (event) => {
      if (event.target.classList.contains('remove-item')) {
        const nombre = event.target.dataset.name;
        removeCartItem(nombre);
      }
    });

    if (proceedToPaymentButton) {
      proceedToPaymentButton.addEventListener('click', proceedToPayment);
    }
  }

  // Exportar funciones que podrían ser necesarias en otros scripts
  window.updateCartItemCount = updateCartItemCount;
  window.loadCartItems = loadCartItems;
});