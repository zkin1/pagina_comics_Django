function formatPrice(price) {
  return new Intl.NumberFormat('es-CL', { 
      style: 'currency', 
      currency: 'CLP', 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
  }).format(price);
}

let comics = [];
const comicsContainer = $('#comics-list');

// Función para renderizar los cómics
function renderComics(comicData) {
comicsContainer.empty();

comicData.forEach((comic, index) => {
  const comicImageUrl = `/static/img/${comic.foto}`;

  const comicCard = `
    <div class="col-md-4 mb-4">
      <div class="card">
        <img src="${comicImageUrl}" class="card-img-top" alt="${comic.nombre}">
        <div class="card-body">
          <h5 class="card-title">${comic.nombre}</h5>
          <p class="card-text">Precio: ${formatPrice(comic.precio)}</p>
          <button type="button" class="btn btn-primary view-details" data-comic-id="${comic.id}">Ver más</button>
        </div>
      </div>
    </div>
  `;
  comicsContainer.append(comicCard);
});

comics = comicData;

// Agregar evento para ver detalles
$('.view-details').on('click', function() {
  const comicId = $(this).data('comic-id');
  showComicDetails(comicId);
});
}

// Función para mostrar detalles del cómic
function showComicDetails(comicId) {
const comic = comics.find(c => c.id === comicId);
if (comic) {
  const comicImageUrl = comic.foto
  $('#comicModalLabel').text(comic.nombre);
  $('#comicModalBody').html(`
    <div class="row">
      <div class="col-md-4">
        <img src="${comicImageUrl}" class="img-fluid" alt="${comic.nombre}">
      </div>
      <div class="col-md-8">
        <p><strong>Descripción:</strong> ${comic.descripcion}</p>
        <p><strong>Precio:</strong> ${formatPrice(comic.precio)}</p>
        <p><strong>Stock:</strong> ${comic.stock}</p>
      </div>
    </div>
  `);
  $('#addToCartBtn').data('comic-id', comic.id);
  $('#comicModal').modal('show');
}
}

// Función para agregar un producto al carrito
function addToCart(comicId, quantity = 1) {
fetch('/check-login-status/')
  .then(response => response.json())
  .then(data => {
    if (data.is_authenticated) {
      const comic = comics.find(c => c.id === comicId);
      if (comic) {
        addToCartRequest(comic, quantity);
      }
    } else {
      Swal.fire({
        title: 'Inicio de sesión requerido',
        text: 'Debes iniciar sesión para agregar productos al carrito',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Ir a iniciar sesión',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/login/';
        }
      });
    }
  })
  .catch(error => {
    console.error('Error al verificar el estado de login:', error);
    Swal.fire('Error', 'Hubo un problema al verificar tu sesión', 'error');
  });
}

function addToCartRequest(comic, quantity) {
fetch('/carro/add_item/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRFToken': getCookie('csrftoken')
  },
  body: JSON.stringify({ comicName: comic.nombre, quantity: quantity })
})
.then(response => {
  if (!response.ok) {
    return response.text().then(text => {
      throw new Error(`Error: ${response.status} ${response.statusText} - ${text}`);
    });
  }
  return response.json();
})
.then(data => {
  if (data.success) {
    updateCartItemCount(data.total_items);
    Swal.fire({
      title: '¡Producto agregado al carrito!',
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'Ir al carrito',
      cancelButtonText: 'Seguir comprando',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = '/carro/';
      }
    });
  } else {
    Swal.fire('Error', data.error, 'error');
  }
})
.catch(error => {
  console.error('Error al agregar el producto al carrito:', error);
  Swal.fire('Error', 'Hubo un problema al agregar el producto al carrito', 'error');
});
}

// Actualiza el conteo de artículos en el carrito
function updateCartItemCount() {
fetch('/carro/count/')
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Error al obtener el conteo de artículos del carrito');
    }
  })
  .then(data => {
    const cartItemCountElement = $('#cartItemCount');
    if (cartItemCountElement.length) {
      cartItemCountElement.text(data.count);
    }
  })
  .catch(error => {
    console.error('Error al actualizar el conteo de artículos del carrito:', error);
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

// Obtener los cómics de Django
function fetchComics() {
fetch("/productos/get_comics/")
  .then(response => {
    if (!response.ok) {
      throw new Error('Error al obtener los cómics');
    }
    return response.json();
  })
  .then(data => {
    console.log('Datos recibidos:', data);  // Para depuración
    renderComics(data);
  })
  .catch(error => {
    console.error('Error al obtener los cómics:', error);
  });
}

// Función para ir al carrito
function goToCart() {
window.location.href = '/carro/';
}

// Llamar a la función para obtener los cómics cuando se carga la página
$(document).ready(function() {
fetchComics();

// Agregar evento al botón del carrito si existe
const cartButton = $('#cartButton');
if (cartButton.length) {
  cartButton.on('click', goToCart);
}

// Actualizar el conteo de artículos en el carrito cuando se carga la página
updateCartItemCount();

// Agregar evento al botón de agregar al carrito en el modal
$('#addToCartBtn').on('click', function() {
  const comicId = $(this).data('comic-id');
  addToCart(comicId, 1);
});
});