document.addEventListener('DOMContentLoaded', function() {
  const carouselProductos = document.getElementById('carouselProductos');
  const carouselInner = carouselProductos.querySelector('.carousel-inner');
  const carouselIndicators = carouselProductos.querySelector('.carousel-indicators');
  const getComicsUrl = document.querySelector('meta[name="get-comics-url"]').getAttribute('content');
  
  fetch(getComicsUrl) // Usar la URL obtenida del meta tag
        .then(response => response.json())
        .then(data => {
            const productos = data;
          // Generar los indicadores del carrusel
          productos.forEach((producto, index) => {
              const indicator = document.createElement('li');
              indicator.setAttribute('data-target', '#carouselProductos');
              indicator.setAttribute('data-slide-to', index);
              if (index === 0) {
                  indicator.classList.add('active');
              }
              carouselIndicators.appendChild(indicator);
              $(carouselProductos).carousel();
          });

          // Generar los elementos del carrusel
          productos.forEach((producto, index) => {
              const comicImageUrl = `/static${producto.foto}`; // Construir la URL de la imagen

              const carouselItem = document.createElement('div');
              carouselItem.classList.add('carousel-item');
              if (index === 0) {
                  carouselItem.classList.add('active');
              }
              carouselItem.innerHTML = `
                  <a href="{% url 'productos' %}?comic=${encodeURIComponent(producto.nombre)}">
                      <img src="${comicImageUrl}" class="d-block w-100" alt="${producto.nombre}">
                      <div class="carousel-caption">
                          <h3>${producto.nombre}</h3>
                      </div>
                  </a>
              `;
              carouselInner.appendChild(carouselItem);
          });

          // Inicializar el carrusel de Bootstrap (si es necesario)
          $(carouselProductos).carousel(); 
      })
      .catch(error => {
          console.error('Error al obtener los productos:', error);
          // Manejar el error de alguna manera (mostrar un mensaje, etc.)
      });
});