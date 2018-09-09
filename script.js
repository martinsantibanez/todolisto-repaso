// Usando jQuery
$().ready(function() {
    const APIURL = 'http://localhost:8000';
    cargarTareas();
    function cargarTareas() {
        // Haciendo llamada Ajax al backend
        console.log("Iniciando llamada Ajax");
        $.get( APIURL + '/tareas', function(data, textStatus, jqXHR) {
            data.forEach( element => {
                console.log(element);
                appendTarea(element);
            });         
            console.log("Ajax exitoso!");
            // console.log(data);
        }).fail(function(x) {
            console.log("Error en la llamada Ajax :(");
            console.log(x);
        });
    }

    function appendTarea( tarea ) { 
        var tRow = '';
        tRow += '<tr>';
        tRow += '<th scope="row">' + tarea.id + '</th>';
        tRow += '<td><a href="#' + tarea.id + '">' + tarea.titulo + '</a></td>';
        tRow += '<td>' + tarea.nombre_estado + '</td>';
        tRow += '</tr>';
        $('#tareas tbody').append( $( tRow ) );
    }
});