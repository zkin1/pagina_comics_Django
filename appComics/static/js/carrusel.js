document.addEventListener('DOMContentLoaded', function () {
    const carouselProductos = document.getElementById('carouselProductos');
    const carouselInner = carouselProductos.querySelector('.carousel-inner');
    const carouselIndicators = carouselProductos.querySelector('.carousel-indicators');
    const getComicsUrl = document.querySelector('meta[name="get-comics-url"]').getAttribute('content');

    fetch(getComicsUrl)
        .then(response => response.json())
        .then(data => {
            const productos = data;

            // Generar indicadores del carrusel
            productos.forEach((producto, index) => {
                const indicator = document.createElement('li');
                indicator.setAttribute('data-target', '#carouselProductos');
                indicator.setAttribute('data-slide-to', index);
                if (index === 0) {
                    indicator.classList.add('active');
                }
                carouselIndicators.appendChild(indicator);
            });

            // Generar elementos del carrusel
            productos.forEach((producto, index) => {
                const comicImageUrl = producto.foto

                const carouselItem = document.createElement('div');
                carouselItem.classList.add('carousel-item');
                if (index === 0) {
                    carouselItem.classList.add('active');
                }

                carouselItem.innerHTML = `
                    <img src="${comicImageUrl}" class="d-block w-100" alt="${producto.nombre}" data-comic='${JSON.stringify(producto)}'>
                    <div class="carousel-caption">
                        <h3>${producto.nombre}</h3>
                    </div>
                `;

                carouselInner.appendChild(carouselItem);
            });

            // Inicializar el carrusel de Bootstrap
            $(carouselProductos).carousel();

            // Manejar evento click en las imágenes del carrusel
            carouselInner.addEventListener('click', (event) => {
                if (event.target.tagName === 'IMG') {
                    const comicData = JSON.parse(event.target.getAttribute('data-comic'));
                    showComicModal(comicData);
                }
            });
        })
        .catch(error => {
            console.error('Error al obtener los productos:', error);
        });
});

// Función para mostrar el modal del cómic
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
                                <img src="${comic.foto}" class="img-fluid" alt="${comic.nombre}">
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

    // Remover modal existente si hay uno
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
        existingModal.remove();
    }

    // Añadir el nuevo modal al body
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Mostrar el modal
    $(`#${modalId}`).modal('show');

    // Manejar el evento de agregar al carrito
    $(`#${modalId} .add-to-cart`).on('click', function() {
        const comicData = JSON.parse($(this).attr('data-comic'));
        addToCart(comicData, 1);
    });
}

function addToCart(comic, quantity = 1) {
    fetch('/check-login-status/')  // Asegúrese de que esta URL coincida con la de su urls.py
        .then(response => response.json())
        .then(data => {
            if (data.is_authenticated) {
                // El usuario está autenticado, proceder a agregar al carrito
                addToCartRequest(comic, quantity);
            } else {
                // El usuario no está autenticado, mostrar mensaje
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
    // Este es su código actual para agregar al carrito
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
        console.log('Respuesta de add_item:', response);
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`Error: ${response.status} ${response.statusText} - ${text}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Datos de add_item:', data);
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