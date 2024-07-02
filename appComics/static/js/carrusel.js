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
                // ... (código igual al original) ...
            });

            // Generar elementos del carrusel
            productos.forEach((producto, index) => {
                const comicImageUrl = `/static${producto.foto}`;

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
                                <img src="/static${comic.foto}" class="img-fluid" alt="${comic.nombre}">
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
        const comicName = $(this).data('name');
        addToCart(comicName);
    });
}