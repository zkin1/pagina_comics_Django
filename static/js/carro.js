// Obtener referencias a los elementos del DOM
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const cartItemCountElement = document.getElementById('cartItemCount');

// Función para renderizar los elementos del carro
function renderCartItems(cartItems) {
  console.log('Renderizando elementos del carro:', cartItems);
  cartItemsContainer.innerHTML = '';

  cartItems.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <img src="${item.foto}" alt="${item.nombre}" width="50">
        ${item.nombre}
      </td>
      <td>$${item.precio}</td>
      <td>
        <input type="number" class="form-control quantity" value="${item.quantity}" min="1" data-index="${index}">
      </td>
      <td>$${item.subtotal.toFixed(2)}</td>
      <td>
        <button type="button" class="btn btn-danger btn-sm remove-item" data-index="${index}">X</button>
      </td>
    `;
    cartItemsContainer.appendChild(row);
  });

  // Actualizar el contador de elementos en el carro
  updateCartItemCount();
}

// Función para calcular el total del carro
function calculateCartTotal(cartItems) {
  const total = cartItems.reduce((acc, item) => acc + item.subtotal, 0);
  cartTotalElement.textContent = `$${total.toFixed(2)}`;
}

function updateCartItemQuantity(index, quantity) {
  console.log('Actualizando cantidad del elemento del carro:', index, quantity);
  
  fetch('/carro/update_quantity/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    },
    body: JSON.stringify({ index: index, quantity: quantity })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      renderCartItems(data.cart_items);
      calculateCartTotal(data.cart_items);
    } else {
      console.error('Error al actualizar la cantidad:', data.error);
    }
  })
  .catch(error => console.error('Error:', error));
}

function removeCartItem(index) {
  console.log('Eliminando elemento del carro:', index);
  
  fetch('/carro/remove_item/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    },
    body: JSON.stringify({ index: index })
  })
  .then(response => response.json())
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
  fetch('/carro/get_item_count/')
    .then(response => response.json())
    .then(data => {
      cartItemCountElement.textContent = data.count;
    })
    .catch(error => console.error('Error:', error));
}

cartItemsContainer.addEventListener('change', (event) => {
  if (event.target.classList.contains('quantity')) {
    const index = parseInt(event.target.dataset.index);
    const quantity = parseInt(event.target.value);
    updateCartItemQuantity(index, quantity);
  }
});

cartItemsContainer.addEventListener('click', (event) => {
  if (event.target.classList.contains('remove-item')) {
    const index = parseInt(event.target.dataset.index);
    removeCartItem(index);
  }
});

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
  fetch('/carro/get_items/')
    .then(response => response.json())
    .then(data => {
      renderCartItems(data.cart_items);
      calculateCartTotal(data.cart_items);
    })
    .catch(error => console.error('Error:', error));
}

// Cargar los elementos del carro al iniciar la página
document.addEventListener('DOMContentLoaded', loadCartItems);