document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('envioForm');
    if (!form) {
        console.error('El formulario de envío no se encontró');
        return;
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(form);

        // Obtener los datos del carrito de la sesión
        const cartItems = JSON.parse(sessionStorage.getItem('cart') || '[]');
        console.log('Items del carrito obtenidos de la sesión:', cartItems);
        
        // Añadir los items del carrito al formData
        formData.append('cart_items', JSON.stringify(cartItems));

        // Mostrar los datos del formulario en la consola para depuración
        console.log('Datos del formulario antes de enviar:', Object.fromEntries(formData.entries()));
        console.log('Items del carrito antes de enviar:', cartItems);

        // Verificar si el carrito está vacío
        if (cartItems.length === 0) {
            console.error('El carrito está vacío.');
            mostrarNotificacion("El carrito está vacío. Por favor, añada items al carrito antes de enviar.");
            return; // Detener el envío si el carrito está vacío
        }

        const url = form.dataset.url;
        if (!url) {
            console.error('URL de envío no definida');
            return;
        }

        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        console.log('CSRF Token:', csrfToken);

        fetch(url, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': csrfToken
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    console.error('Error al recibir respuesta:', errorData);
                    throw new Error(`HTTP error! status: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                mostrarNotificacion("¡Su pedido ha sido enviado! Le hemos enviado un correo con los detalles. El pago se realizará al recibir el producto.");
                // Limpiar el carrito después de un pedido exitoso
                sessionStorage.removeItem('cart');
                // Actualizar el contador de items en el carrito
                updateCartItemCount();
            } else {
                console.error('Error al crear pedido:', data.error);
                mostrarNotificacion("Hubo un error al procesar su pedido. Por favor, inténtelo de nuevo.");
            }
        })
        .catch(error => {
            console.error('Error:', error.message);
            mostrarNotificacion("Hubo un error al procesar su pedido. Por favor, inténtelo de nuevo.");
        });
    });

    function mostrarNotificacion(mensaje) {
        const notificacion = document.createElement('div');
        notificacion.classList.add('notificacion');
        notificacion.textContent = mensaje;
        document.body.appendChild(notificacion);
    
        setTimeout(() => {
            notificacion.remove(); // Elimina la notificación
            window.location.href = "/"; // Redirige a index
        }, 10000); // 10 segundos (10000 milisegundos)
    }
});