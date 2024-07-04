let getComicsUrl;
let comics = []; // Declarar la variable 'comics' fuera de la función de renderizado

document.addEventListener('DOMContentLoaded', function () {
    // Obtener la URL de la vista desde el meta tag
    getComicsUrl = document.querySelector('meta[name="get-comics-url"]').getAttribute('content');

    function filterComics(comics, searchTerm) {
        return comics.filter(comic => {
            const name = comic.nombre.toLowerCase();
            const description = comic.descripcion.toLowerCase();
            const term = searchTerm.toLowerCase();
            return name.includes(term) || description.includes(term);
        });
    }

    // Función para renderizar los cómics
    function renderComics(comicData, filteredComics, searchTerm) {
        const filteredComicsContainer = $('#filtered-comics-list');
        const allComicsContainer = $('#all-comics-list');

        filteredComicsContainer.empty();
        allComicsContainer.empty();

        const comicsToRender = searchTerm ? filteredComics : comicData;

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

        // Manejar el evento de agregar al carrito
        $('.add-to-cart').on('click', function() {
            const comicName = $(this).data('name');
            const comic = comics.find(c => c.nombre === comicName);
            addToCart(comic, 1); // Puedes ajustar la cantidad aquí si es necesario
        });
    }

    // Función para agregar un producto al carrito
    function addToCart(comic, quantity = 1) {
        console.log('Agregando al carrito:', comic.nombre, quantity); // Añadir mensaje de depuración
        fetch('/carro/add_item/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ comicName: comic.nombre, quantity: quantity })
        })
        .then(response => {
            // Revisar si la respuesta no es JSON
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

    // Función para obtener la cookie CSRF
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Función para actualizar el contador de items en el carrito
    function updateCartItemCount(totalItems) {
        const cartItemCount = document.getElementById('cartItemCount');
        if (cartItemCount) {
            cartItemCount.textContent = totalItems;
        }
    }

    // Event listener para el botón de búsqueda
    $('#search-btn').on('click', function () {
        const searchTerm = $('#search-input').val().trim();
        fetch(getComicsUrl) // Usar la URL obtenida del meta tag
            .then(response => response.json())
            .then(comics => {
                const filteredComics = filterComics(comics, searchTerm);
                renderComics(comics, filteredComics, searchTerm);
            })
            .catch(error => console.error('Error al obtener los cómics:', error));
    });
});
