// Usando jQuery
$(document).ready(function() {
    // Variables globales
    const APIURL = 'http://localhost:8000';
    const estados = ['Creada', 'En Proceso', 'Terminada']; // Por simplicidad, deberia ser desde la tabla estados
    // Es mejor hacer todo esto solo una vez, cada $ cuesta tiempo:
    const tBody = $('#tareas > tbody');
    // Objeto para que sea mas bonito
    const detalleTarea = {
        root: $('#detalleTarea'),
        titulo: $('#detalleTarea .titulo'),
        descripcion: $('#detalleTarea .descripcion'),
        boton: $('#detalleTarea .btn')
    };
    var trActual = {};

    // Carga inicial
    cargarTareas();
    function cargarTareas() {
        tBody.html("");
        $.get( APIURL + '/tareas', function(data, textStatus, jqXHR) {
            data.forEach( function(element) {
                appendTarea(element);
            });
        }).fail(handleError);
    }
    /** Buscador por titulo */
    $('#buscador').keyup(function(){
        var input;
        input=$('#buscador').val().toLowerCase();
        $.each($('#tareas tbody tr'), function() {
            if($(this).text().toLowerCase().indexOf(input) === -1)
                $(this).hide();
            else
                $(this).show();       
        });
    });
    
    /** Saca la clase correspondiente a la fila seleccionada, para poder seleccionar otra  */
    function clearActive(){
        tBody.children('.table-secondary').each(function(){
            $(this).toggleClass('table-secondary');
        });
    }
    //  
    tBody.on('click', 'a', function(e){
        e.preventDefault();
        trActual = $(this).parents('tr');
        clearActive();
        trActual.addClass('table-secondary');
        var id = $(this).attr('data-id');
        $.get( APIURL + '/tareas/' + id, function(data, textStatus, jqXHR) {
            tareaActual = data;
            renderActual();
        }).fail(handleError);
        
    });

    function renderActual(){
        console.log(tareaActual);
        detalleTarea.root.show();
        detalleTarea.titulo.text(tareaActual.titulo);
        detalleTarea.descripcion.text(tareaActual.descripcion);
        if (tareaActual.estado < 2){
            detalleTarea.boton.show();
            detalleTarea.boton.text('Pasar a estado ' + estados[tareaActual.estado+1]);
        } else {
            detalleTarea.boton.hide();
        }
    }

    detalleTarea.boton.click(function(e){
        tareaActual.estado++;
        var url =  APIURL + '/tareas/' + tareaActual.id + '/';
        $.ajax({   
            method: 'PUT', 
            url: url,
            data: tareaActual,
            success: function(data) {
                tareaActual = data;
                renderActual();
                trActual.children('.estado').text(tareaActual.nombre_estado);
                // $('th:contains('+tareaActual.id+')').siblings('.estado').text(tareaActual.nombre_estado);
            }
        });
    });
    
    /** Reutilizable al agregar tareas */
    function appendTarea(tarea) { 
        var tRow = '';
        tRow += '<tr>';
        tRow += '<th scope="row">' + tarea.id + '</th>';
        tRow += '<td><a href="#" data-id="' + tarea.id + '">' + tarea.titulo + '</a></td>';
        tRow += '<td class="estado">' + tarea.nombre_estado + '</td>';
        tRow += '</tr>';
        tBody.append( $( tRow ) );
    }

    /** Se usa varias veces */
    function handleError(x) {
        console.log("Error en la llamada Ajax :(");
        console.log(x);
    }

    /** Formulario muestra si faltan caracteres al ingresar datos tanto en titulo como en descripcion */ 
    const advertencia_titulo = $('#advertencia_titulo');
    const advertencia_descripcion = $('#advertencia_descripcion');
    const titulo = $('#titulo');
    const descripcion = $('#descripcion');

    /* Ocultar advertencias y monitorear keys */
    advertencia_titulo.hide();
    advertencia_descripcion.hide();
	titulo.keydown(function () {   
        check_titulo();  
	}); 
    descripcion.keydown(function () {   
        check_descripcion();  
    }); 
    /**funciones check se reutilizan para verificar formulario */
    function check_titulo(){
        var largo_titulo= titulo.val().length; 
        if(largo_titulo<5){
            advertencia_titulo.html("El título debe tener largo mayor a 5 caracteres");
            advertencia_titulo.show();
            titulo.addClass('is-invalid');
            return true;
        } else {
            advertencia_titulo.hide(); 
            titulo.removeClass('is-invalid');
            return false;
        }
    }
    
    function check_descripcion(){
        var largo_descripcion = descripcion.val().length; 
        if(largo_descripcion < 10){
            advertencia_descripcion.html("La descripción debe tener largo mayor a 10 caracteres");
            advertencia_descripcion.show();
            descripcion.addClass('is-invalid');
            return true;
        } else {
            advertencia_descripcion.hide(); 
            descripcion.removeClass('is-invalid');
            return false;
        }
    };
    
    /**Intento de envio de formulario con ajax */
    $('#registro_form').submit(function(event){
        event.preventDefault();
        var url = APIURL + '/tareas/';
        var data = {};
        $(this).find('[name]').each(function(value){
            var name = $(this).attr('name');
            var value =  $(this).val();
            data[name] = value;
            data['estado'] = 0;
        });
        if (check_descripcion() || check_titulo()){
            alert("Ingrese los campos solicitados correctamente.");
            return;
        }
        $.ajax({                        
            method: 'POST',                 
            url: url,                    
            data: data,
            success: function(data)            
            {
                appendTarea(data);        
            }
        });
    });
});





