let comics = [];
const comicsContainer = $('#comics-list');

// Función para renderizar los cómics
function renderComics(comicData) {
  comicsContainer.empty();

  comicData.forEach((comic, index) => {
    // Ajustar la URL de la imagen
    const comicImageUrl = `/static${comic.foto}`;

    const comicCard = `
      <div class="col-md-4 mb-4">
        <div class="card">
          <img src="${comicImageUrl}" class="card-img-top" alt="${comic.nombre}">
          <div class="card-body">
            <h5 class="card-title">${comic.nombre}</h5>
            <p class="card-text">Precio: $${comic.precio}</p>
            <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#comicModal${index}">Ver más</button>
          </div>
        </div>
      </div>
      <!-- Modal -->
      <div class="modal fade" id="comicModal${index}" tabindex="-1" role="dialog" aria-labelledby="comicModalLabel${index}" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="comicModalLabel${index}">${comic.nombre}</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="row">
                <div class="col-md-4">
                  <img src="${comicImageUrl}" class="img-fluid" alt="${comic.nombre}">
                </div>
                <div class="col-md-8">
                  <p><strong>Descripción:</strong> ${comic.descripcion}</p>
                  <p><strong>Precio:</strong> $${comic.precio}</p>
                  <p><strong>Stock:</strong> ${comic.stock}</p>
                  <button type="button" class="btn btn-success add-to-cart" data-comic-id="${comic.id}">Agregar al carrito</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    comicsContainer.append(comicCard);
  });

  comics = comicData;

  const urlParams = new URLSearchParams(window.location.search);
  const comicName = urlParams.get('comic');
  if (comicName) {
    const decodedComicName = decodeURIComponent(comicName);
    const comic = comics.find(comic => comic.nombre === decodedComicName);
    if (comic) {
      const index = comics.indexOf(comic);
      $(`#comicModal${index}`).modal('show');
    }
  }
}

// Función para agregar un producto al carrito
function addToCart(comicName, quantity) {
  const comic = comics.find(comic => comic.nombre === comicName);
  
  if (comic) {
    fetch('/carro/add_item/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
      body: JSON.stringify({ comicName: comicName, quantity: quantity })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        updateCartItemCount();
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
  } else {
    Swal.fire('Error', 'Producto no encontrado', 'error');
  }
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

// Evento para agregar un producto al carrito
comicsContainer.on('click', '.add-to-cart', function() {
  const comicModal = $(this).closest('.modal');
  const comicName = comicModal.find('.modal-title').text();
  const quantity = 1; // Puedes ajustar la cantidad según tus necesidades
  if (comicName) {
    addToCart(comicName, quantity);
  } else {
    console.error('Invalid comic name');
  }
});

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
});