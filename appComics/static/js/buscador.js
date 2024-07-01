function filterComics(comics, searchTerm) {
  return comics.filter(comic => {
    const name = comic.nombre.toLowerCase();
    const description = comic.descripcion.toLowerCase();
    const term = searchTerm.toLowerCase();
    return name.includes(term) || description.includes(term);
  });
}

let comics = []; // Declarar la variable 'comics' fuera de la función de renderizado

// Función para renderizar los cómics
function renderComics(comicData, filteredComics, searchTerm) {
  const filteredComicsContainer = $('#filtered-comics-list');
  const allComicsContainer = $('#all-comics-list');

  filteredComicsContainer.empty();
  allComicsContainer.empty();

  const comicsToRender = searchTerm ? filteredComics : comicData;

  comicsToRender.forEach((comic, index) => {
    const comicCard = `
      <div class="col-md-4 mb-4">
        <div class="card">
          <img src="http://localhost:3000${comic.foto}" class="card-img-top" alt="${comic.nombre}">
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
                  <img src="http://localhost:3000${comic.foto}" class="img-fluid" alt="${comic.nombre}">
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

    if (searchTerm) {
      filteredComicsContainer.append(comicCard);
    } else {
      allComicsContainer.append(comicCard);
    }
  });

  comics = comicData; // Asignar los datos de los cómics a la variable 'comics'
}

// Función para agregar un producto al carro
function addToCart(comic) {
  const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
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
      subtotal: comic.precio // Asegurarse de que subtotal sea un número
    };
    cartItems.push(newItem);
  }

  localStorage.setItem('cartItems', JSON.stringify(cartItems));

  // Mostrar el modal de confirmación
  $('#addToCartModal').modal('show');
}

// Evento para agregar un producto al carro
$('#all-comics-list, #filtered-comics-list').on('click', '.add-to-cart', function() {
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

// Agregar un event listener para el botón de búsqueda
$('#search-btn').on('click', function() {
  const searchTerm = $('#search-input').val().trim();
  fetch('http://localhost:3000/api/comics')
    .then(response => response.json())
    .then(comics => {
      const filteredComics = filterComics(comics, searchTerm);
      renderComics(comics, filteredComics, searchTerm);
    })
    .catch(error => console.error('Error al obtener los cómics:', error));
});