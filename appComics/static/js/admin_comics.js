$(document).ready(function() {
    // Crear nuevo cómic
    $('#createComicModal').on('show.bs.modal', function() {
        $('#comicForm')[0].reset();
        $('#comicId').val('');
    });

    // Ver detalles del cómic
    $('.view-comic').click(function() {
        var comicId = $(this).data('id');
        $.get('/get_comic_details/' + comicId + '/', function(data) {
            $('#viewComicDetails').html(data);
            $('#viewComicModal').modal('show');
        });
    });

    // Editar cómic
    $('.edit-comic').click(function() {
        var comicId = $(this).data('id');
        $.get('/get_comic_details/' + comicId + '/', function(data) {
            $('#comicId').val(data.id);
            $('#nombre').val(data.nombre);
            $('#descripcion').val(data.descripcion);
            $('#precio').val(data.precio);
            $('#stock').val(data.stock);
            $('#comicModal').modal('show');
        });
    });

    // Guardar cómic (crear o actualizar)
    $('#saveComic').click(function() {
        var formData = new FormData($('#comicForm')[0]);
        var comicId = $('#comicId').val();
        var url = comicId ? '/update_comic/' + comicId + '/' : '/create_comic/';
        
        $.ajax({
            url: url,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    alert('Cómic guardado exitosamente');
                    location.reload();
                } else {
                    alert('Error al guardar el cómic');
                }
            }
        });
    });

    // Eliminar cómic
    $('.delete-comic').click(function() {
        var comicId = $(this).data('id');
        if (confirm('¿Estás seguro de que quieres eliminar este cómic?')) {
            $.post('/delete_comic/' + comicId + '/', function(data) {
                if (data.success) {
                    alert('Cómic eliminado exitosamente');
                    location.reload();
                } else {
                    alert('Error al eliminar el cómic');
                }
            });
        }
    });
});