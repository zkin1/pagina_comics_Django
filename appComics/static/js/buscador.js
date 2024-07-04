let getComicsUrl;
let comics = [];

document.addEventListener('DOMContentLoaded', function () {
    getComicsUrl = document.querySelector('meta[name="get-comics-url"]').getAttribute('content');

    function filterComics(comics, searchTerm) {
        return comics.filter(comic => {
            const name = comic.nombre.toLowerCase();
            const term = searchTerm.toLowerCase();
            return name.includes(term);
        });
    }

    function renderComics(comicData, searchTerm) {
        const filteredComicsContainer = $('#filtered-comics-list');
        filteredComicsContainer.empty();

        comicData.forEach((comic, index) => {
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

            filteredComicsContainer.append(comicCard);
        });

        $('.add-to-cart').on('click', function() {
            const comicName = $(this).data('name');
            const comic = comics.find(c => c.nombre === comicName);
            addToCart(comic, 1);
        });
    }

    function addToCart(comic, quantity = 1) {
        if (comic.stock <= 0) {
            Swal.fire('Sin stock', 'Lo sentimos, este cómic no tiene stock disponible', 'warning');
            return;
        }

        fetch('/check-login-status/')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.is_authenticated) {
                    addToCartRequest(comic, quantity);
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

    function updateCartItemCount(totalItems) {
        const cartItemCount = document.getElementById('cartItemCount');
        if (cartItemCount) {
            cartItemCount.textContent = totalItems;
        }
    }

    $('#search-btn').on('click', function () {
        const searchTerm = $('#search-input').val().trim();
        if (searchTerm) {
            fetch(getComicsUrl)
                .then(response => response.json())
                .then(allComics => {
                    comics = allComics; // Guardar todos los cómics
                    const filteredComics = filterComics(allComics, searchTerm);
                    renderComics(filteredComics, searchTerm);
                })
                .catch(error => console.error('Error al obtener los cómics:', error));
        } else {
            $('#filtered-comics-list').empty(); // Limpiar resultados si no hay término de búsqueda
        }
    });

    // Cargar el carrusel al inicio
    fetch(getComicsUrl)
        .then(response => response.json())
        .then(allComics => {
            comics = allComics; // Guardar todos los cómics
        })
        .catch(error => console.error('Error al obtener los cómics para el carrusel:', error));
});

function showComicModal(comic) {
    const modalId = 'comicModal';
    const modalHtml = `
        <div class="modal fade" id="${modalId}" tabindex="-1" role="dialog" aria-labelledby="${modalId}Label" aria-hidden="true">
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="${modalId}Label">${comic.nombre}</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-4">
                                <img src="/static${comic.foto}" class="img-fluid" alt="${comic.nombre}">
                            </div>
                            <div class="col-md-8">
                                <p><strong>Descripción:</strong> ${comic.descripcion}</p>
                                <p><strong>Precio:</strong> $${comic.precio}</p>
                                <p><strong>Stock:</strong> ${comic.stock}</p>
                                <button type="button" class="btn btn-success add-to-cart" data-comic='${JSON.stringify(comic)}'>Agregar al carrito</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const existingModal = document.getElementById(modalId);
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    $(`#${modalId}`).modal('show');

    $(`#${modalId} .add-to-cart`).on('click', function() {
        const comicData = JSON.parse($(this).attr('data-comic'));
        addToCart(comicData, 1);
    });
}