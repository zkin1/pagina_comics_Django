let comics = [];
let cartItems = [];
const comicsContainer = $('#comics-list');

// Función para renderizar los cómics
function renderComics(comicData) {
  comicsContainer.empty();

  comicData.forEach((comic, index) => {
    // Ajustar la URL de la imagen
    const comicImageUrl = `/static/img/${comic.foto}`;

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
                  <button type="button" class="btn btn-success add-to-cart" data-name="${comic.nombre}">Agregar al carrito</button>
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


// Función para agregar un producto al carro
function addToCart(comic) {
  const loggedInUser = localStorage.getItem('loggedInUser');

  if (!loggedInUser) {
    alert('Debes iniciar sesión para agregar productos al carro');
    window.location.href = '{% url "login" %}';
    return;
  } else {
    const existingItem = cartItems.find(item => item.nombre === comic.nombre);

    if (existingItem) {
      existingItem.quantity++;
      existingItem.subtotal = existingItem.precio * existingItem.quantity;
    } else {
      const newItem = {
        nombre: comic.nombre,
        precio: comic.precio,
        foto: comic.foto,
        quantity: 1,
        subtotal: comic.precio
      };
      cartItems.push(newItem);
    }

    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCartItemCount();

    $('#addToCartModal').modal('show');
  }
}

// Evento para agregar un producto al carro
comicsContainer.on('click', '.add-to-cart', function() {
  const loggedInUser = localStorage.getItem('loggedInUser');

  if (!loggedInUser) {
    alert('Debes iniciar sesión para agregar productos al carro');
    window.location.href = '{% url "login" %}';
    return;
  }

  const comicName = $(this).data('name');
  if (comicName) {
    const comic = comics.find(comic => comic.nombre === comicName);
    if (comic) {
      addToCart(comic);
    } else {
      console.error('Comic not found with name:', comicName);
    }
  } else {
    console.error('Invalid comic name');
  }
});

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

// Llamar a la función para obtener los cómics cuando se carga la página
$(document).ready(function() {
  fetchComics();
});