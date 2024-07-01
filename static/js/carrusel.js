document.addEventListener('DOMContentLoaded', function() {
  const carouselProductos = document.getElementById('carouselProductos');
  const carouselInner = carouselProductos.querySelector('.carousel-inner');
  const carouselIndicators = carouselProductos.querySelector('.carousel-indicators');

  fetch('http://localhost:3000/api/comics')
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
      });

      // Generar los elementos del carrusel
      productos.forEach((producto, index) => {
        const carouselItem = document.createElement('div');
        carouselItem.classList.add('carousel-item');
        if (index === 0) {
          carouselItem.classList.add('active');
        }
        carouselItem.innerHTML = `
          <a href="productos.html?comic=${encodeURIComponent(producto.nombre)}">
            <img src="http://localhost:3000${producto.foto}" alt="${producto.nombre}">
            <div class="carousel-caption">
              <h3>${producto.nombre}</h3>
            </div>
          </a>
        `;
        carouselInner.appendChild(carouselItem);
      });
    })
    .catch(error => {
      console.error('Error al obtener los productos:', error);
    });
});