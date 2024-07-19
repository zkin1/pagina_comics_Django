$(document).ready(function() {
    // Setup CSRF token for AJAX requests
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
            }
        }
    });

    function updateComicRow(comic) {
        var row = $(`#comicsTableBody tr[data-id="${comic.id}"]`);
        var rowHtml = `
            <td>${comic.id}</td>
            <td>${comic.nombre}</td>
            <td>$${comic.precio}</td>
            <td>${comic.stock}</td>
            <td>
                <button class="btn btn-info btn-sm view-comic" data-id="${comic.id}">Ver</button>
                <button class="btn btn-warning btn-sm edit-comic" data-id="${comic.id}">Editar</button>
                <button class="btn btn-danger btn-sm delete-comic" data-id="${comic.id}">Eliminar</button>
            </td>
        `;
        if (row.length) {
            row.html(rowHtml);
        } else {
            $('#comicsTableBody').append(`<tr data-id="${comic.id}">${rowHtml}</tr>`);
        }
    }

    $('#comicModal').on('show.bs.modal', function(event) {
        var button = $(event.relatedTarget);
        var modal = $(this);
        modal.find('form')[0].reset();
        $('#previewImage').attr('src', '');

        if (button.hasClass('edit-comic')) {
            var comicId = button.data('id');
            $.get(`/get_comic_details/${comicId}/`, function(data) {
                $('#comicId').val(data.id);
                $('#nombre').val(data.nombre);
                $('#descripcion').val(data.descripcion);
                $('#precio').val(data.precio);
                $('#stock').val(data.stock);
                if (data.foto) {
                    $('#previewImage').attr('src', '/static' + data.foto);
                }
                modal.find('.modal-title').text('Editar Cómic');
            });
        } else {
            $('#comicId').val('');
            modal.find('.modal-title').text('Crear Nuevo Cómic');
        }
    });

    $('#saveComic').click(function() {
        var formData = new FormData();
        formData.append('csrfmiddlewaretoken', $('input[name="csrfmiddlewaretoken"]').val());
        formData.append('comicId', $('#comicId').val());
        formData.append('nombre', $('#nombre').val());
        formData.append('descripcion', $('#descripcion').val());
        formData.append('precio', $('#precio').val());
        formData.append('stock', $('#stock').val());
        formData.append('foto', $('#foto')[0].files[0]);
      
        $.ajax({
          url: '/create_comic/',
          type: 'POST',
          data: formData,
          processData: false,
          contentType: false,
          success: function(response) {
            // Manejo de la respuesta exitosa
          },
          error: function(xhr, status, error) {
            console.error('Error:', error);
          }
        });
      });
      
    
    
    

    $(document).on('click', '.delete-comic', function() {
        var comicId = $(this).data('id');
        if (confirm('¿Estás seguro de que quieres eliminar este cómic?')) {
            $.ajax({
                url: `/delete_comic/${comicId}/`,
                type: 'POST',
                success: function(data) {
                    if (data.success) {
                        $(`#comicsTableBody tr[data-id="${comicId}"]`).remove();
                        alert('Cómic eliminado exitosamente');
                    } else {
                        alert('Error al eliminar el cómic');
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error:', xhr.responseText);
                    alert('Error al eliminar el cómic: ' + error);
                }
            });
        }
    });

    $(document).on('click', '.view-comic', function() {
        var comicId = $(this).data('id');
        $.get('/get_comic_details/' + comicId + '/', function(data) {
            var detailsHtml = `
                <p><strong>Nombre:</strong> ${data.nombre}</p>
                <p><strong>Descripción:</strong> ${data.descripcion}</p>
                <p><strong>Precio:</strong> $${data.precio}</p>
                <p><strong>Stock:</strong> ${data.stock}</p>
                <img src="/static${data.foto}" alt="${data.nombre}" style="max-width: 100%;">
            `;
            $('#viewComicDetails').html(detailsHtml);
            $('#viewComicModal').modal('show');
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error("Error al obtener detalles del cómic:", textStatus, errorThrown);
        });
    });
});
