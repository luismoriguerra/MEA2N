Responses

200 success
201 success nuevo recurso creado
204 success no hay contenido para responder
400 bad request - solicitud no se puedo evaluar
401 unauthorized - usuario no autenticado para este recurso
404 not found - recurso no existe
422 unprocessable entity - errores de validacion
429 limite de uso excedido intente mas tarde
500 error de servidor
503 servicio no disponible

#### Responses

{
    code: "",
    message: "",
    description: "",
    results: {
    // results could be a entity object or a object wich has a list and count as property        
        list: []
        count: ""
    }
}

// I dont feel good about to use "Results" in plural due that sometimes we only need one row,
// but I guess results could be the row when is only one


// Examples and formats we have been using so far XD 
Lists

res.json({ results: {list:rows[0], count: rows[1][0].COUNTER}});

res.status(200)
.send({code: 200, message: 'Su clave actual no coincide'});


res
.status(201) // new resource was created
.json({results:{code:1, message: 'ok', data: req.body}});



# error
 res.status(401)
 .json({results: {code:'error', message: 'Acción prohibida'}});



res.status(500)
.send({code: 500, message: 'Internal Server Error', dev: err});