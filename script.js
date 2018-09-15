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
        btnEstado: $('#detalleTarea .btnEstado'),
        btnEditar: $('#detalleTarea .btnEditar'),
        formEditar: $('#detalleTarea .formEditar'),
        btnCerrar: $('#detalleTarea .formEditar btnCerrar'),
        btnAceptar: $('#detalleTarea .formEditar btnAceptar')
    };
    const textoEditando = $('#editando');
    const cancelarEditar = $('#cancelarEditar');
    const btnSubmit = $('#btnSubmit');
    const advertencia_titulo = $('#advertencia_titulo');
    const advertencia_descripcion = $('#advertencia_descripcion');
    const titulo = $('#titulo');
    const descripcion = $('#descripcion');
    var tareaActual = {};
    var trActual = {}; // Guarda el <tr> asociado a la tarea seleccionada
    var editando = false;

    /** 2. Carga inicial */
    cargarTareas();
    function cargarTareas() {
        tBody.html("");
        $.get( APIURL + '/tareas', function(data, textStatus, jqXHR) {
            data.forEach( function(element) {
                appendTarea(element);
            });
        }).fail(handleError);
    }

    /** 3. Mostrar detalle y cambiar estado */
    tBody.on('click', 'a', function(e){
        e.preventDefault();
        setEditando(false);
        trActual = $(this).parents('tr');
        clearActive();
        trActual.addClass('table-secondary');
        var id = $(this).attr('data-id');
        $.get( APIURL + '/tareas/' + id, function(data, textStatus, jqXHR) {
            tareaActual = data;
            renderActual();
        }).fail(handleError);  
    });

    detalleTarea.btnEstado.click(function(e){
        tareaActual.estado++;
        editarTarea(tareaActual);
    });

    /** 4. Formulario muestra si faltan caracteres al ingresar datos tanto en titulo como en descripcion */
    titulo.keydown(function () {  
        check_titulo();  
    }); 
    descripcion.keydown(function () {   
        check_descripcion();  
    });

    /** 5. Crear nueva tarea (o editar) */
    $('#registro_form').submit(function(event){
        event.preventDefault();
        var data = {};
        $(this).find('[name]').each(function(value){
            var name = $(this).attr('name');
            var value =  $(this).val();
            data[name] = value;
        });
        if (check_descripcion() || check_titulo()){
            alert("Ingrese los campos solicitados correctamente.");
            return;
        }
        if( editando ) {
            data['id'] = tareaActual.id;
            data['estado'] = tareaActual.estado;
            editarTarea(data);
            setEditando(false);
        } else { 
            data['estado'] = 0;
            var url = APIURL + '/tareas/';
            var method = 'POST';
            $.ajax({                        
                method: method,                 
                url: url,                    
                data: data,
                success: function(data)            
                {
                    appendTarea(data);        
                }
            });
        }
    });

    /** 6. Buscador por titulo */
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

    /** 7. Editar */
    detalleTarea.btnEditar.click(function(e){
        setEditando(true);
    });
    cancelarEditar.click(function(e){
        e.preventDefault();
        setEditando(false);
    });
    

    /* Funciones */
    function editarTarea(newData){
        var url =  APIURL + '/tareas/' + newData.id + '/';
        $.ajax({   
            method: 'PUT', 
            url: url,
            data: newData,
            success: function(data) {
                tareaActual = data;
                renderActual();
                trActual.children('.estado').text(tareaActual.nombre_estado);
                trActual.children('.tituloTarea').children('a').text(tareaActual.titulo);
            }
        });
    }

    function renderActual(){
        console.log(tareaActual);
        detalleTarea.root.show();
        detalleTarea.titulo.text(tareaActual.titulo);
        detalleTarea.descripcion.text(tareaActual.descripcion);
        if (tareaActual.estado < 2){
            detalleTarea.btnEstado.show();
            detalleTarea.btnEstado.text('Pasar a estado ' + estados[tareaActual.estado+1]);
        } else {
            detalleTarea.btnEstado.hide();
        }
    }
    
    function setEditando(value){
        editando = value;
        if(editando) {
            titulo.val(tareaActual.titulo);
            descripcion.val(tareaActual.descripcion);
            textoEditando.text('Editando '+tareaActual.id).show();
            // textoEditando.show();
            cancelarEditar.show();
            btnSubmit.text('Editar tarea');
            location.href='#editando';
        } else {
            titulo.val('');
            descripcion.val('');
            cancelarEditar.hide();
            textoEditando.hide();
            btnSubmit.text('Crear tarea');
            location.href='#';
        }
    }
    function clearActive(){
        tBody.children('.table-secondary').each(function(){
            $(this).toggleClass('table-secondary');
        });
    }

    /** Agrega una tarea a la tabla */
    function appendTarea(tarea) { 
        var tRow = '';
        tRow += '<tr>';
        tRow += '<th scope="row">' + tarea.id + '</th>';
        tRow += '<td class="tituloTarea"><a href="#" data-id="' + tarea.id + '">' + tarea.titulo + '</a></td>';
        tRow += '<td class="estado">' + tarea.nombre_estado + '</td>';
        tRow += '</tr>';
        tBody.append( $( tRow ) );
    }

    function handleError(x) {
        console.log("Error en la llamada Ajax :(");
        console.log(x);
    }

    /**funciones check se reutilizan para verificar formulario */
    function check_titulo(){
        var largo_titulo = titulo.val().length; 
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
    
});





