// Usando jQuery
$().ready(function() {
    // alert("Documento listo!");
    console.log("Listo!");

    // Actualizamos el texto del elemento con id 'frase'
    $('#frase').text("Hola!");

    // Haciendo llamada Ajax al backend
    console.log("Iniciando llamada Ajax");
    $.get('http://localhost:8000/tareas', function(data, textStatus, jqXHR) {
    /** Caso exitoso
    El m�todo .get solo permite manejar el caso exitoso.
    Para manejar errores hay que usar $.ajax
    Ver documentaci�n... http://api.jquery.com/jquery.ajax/ **/                

        console.log("Ajax exitoso!");
        console.log(data);

    }).fail(function(x) {
        console.log("Error en la llamada Ajax :(");
        console.log(x);
    });
});