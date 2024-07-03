document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('envioForm');
    if (!form) {
        console.error('El formulario de envío no se encontró');
        return;
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(form);
        const url = form.dataset.url;
        if (!url) {
            console.error('URL de envío no definida');
            return;
        }

        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
        if (!csrfToken) {
            console.error('Token CSRF no encontrado');
            return;
        }

        fetch(url, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                console.log('Pedido creado con éxito:', data.pedido_id);
            } else {
                console.error('Error al crear pedido:', data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error.message);
        });
    });
});