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
        <img src="http://localhost:3000${item.foto}" alt="${item.nombre}" width="50">
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
  cartItemCountElement.textContent = cartItems.length;
}

// Función para calcular el total del carro
function calculateCartTotal(cartItems) {
    const total = cartItems.reduce((acc, item) => {
      if (typeof item.subtotal === 'number') {
        return acc + item.subtotal;
      } else {
        return acc;
      }
    }, 0);
    cartTotalElement.textContent = `$${total.toFixed(2)}`;
  }

function updateCartItemQuantity(index, quantity) {
  console.log('Actualizando cantidad del elemento del carro:', index, quantity);
  const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  cartItems[index].quantity = quantity;
  cartItems[index].subtotal = cartItems[index].precio * quantity;
  localStorage.setItem('cartItems', JSON.stringify(cartItems));
  console.log('Datos del carro actualizados en el almacenamiento local:', cartItems);
  renderCartItems(cartItems);
  calculateCartTotal(cartItems);
}

function removeCartItem(index) {
  console.log('Eliminando elemento del carro:', index);
  const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  cartItems.splice(index, 1);
  localStorage.setItem('cartItems', JSON.stringify(cartItems));
  console.log('Datos del carro actualizados en el almacenamiento local:', cartItems);
  renderCartItems(cartItems);
  calculateCartTotal(cartItems);
}

function updateCartItemCount() {
  const cartItemCountElement = document.getElementById('cartItemCount');
  cartItemCountElement.textContent = cartItems.length;
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



// Obtener los elementos del carro del almacenamiento local al cargar la página
const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
renderCartItems(cartItems);
calculateCartTotal(cartItems);