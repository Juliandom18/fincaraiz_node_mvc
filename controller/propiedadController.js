import {unlink} from 'node:fs/promises'
import { param, validationResult } from 'express-validator'
//import Precio from '../models/Precio.js';
//import Categoria from '../models/Categoria.js';
import {Precio, Categoria, Propiedad, Mensaje, Usuario} from '../models/index.js'
import csurf from 'csurf'
import { esVendedor, formatearFecha } from '../helpers/index.js'


// import { WebpackOptionsApply } from 'webpack';

const admin = async (req, res) => {

    //Leer Query String
    const  {pagina: paginaActual } = req.query

    const expresion = /^[1-9]$/  //Expresion regular

    //Con test(), valida la variable que contenga el patron (0 ó 1)
    if(!expresion.test(paginaActual)){
        return res.redirect('/mispropiedades?pagina=1')
    }
    
    try{
        const {id} = req.usuario;
        //Limites y OffSet para el paginador
        const limit = 10
        const offset = ((paginaActual * limit) - limit)

        const [propiedades, total] = await Promise.all([
            Propiedad.findAll({
                limit,
                offset,
                where: {
                    usuarioId : id
                },
                include: [
                    {model: Categoria, as: 'categoria' },
                    {model: Precio, as: 'precio' },
                    {model: Mensaje, as: 'mensajes' },
                ],

            }),
            Propiedad.count({
                where: {
                    usuarioId: id
                }
            })
        ])
        console.log(total);

        res.render('propiedades/admin', {
            pagina: 'Mis propiedades',
            propiedades,
            csrfToken: req.csrfToken(),
            paginas: Math.ceil(total / limit),
            paginaActual: Number(paginaActual),
            total,
            offset,
            limit
        })
    }catch(error){
        console.log(error)
    }
}


    

//Formulario para crear una propiedad

const crear = async (req, res) =>{

    const [categorias, precios] = await Promise.all([ //se crea un arreglo, el promise.all ejecuta la consulta en simultaneo.
        Categoria.findAll(),  //retorna los valores al arreglo
        Precio.findAll()
    ])

    res.render('propiedades/crear', {
        pagina: 'Crear Propiedad',
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: {}  //se crea un objeto para que no nos marque error sin definir datos
    })
}

const guardar = async (req, res) => {
    
    // Validación
    let resultado = validationResult(req)

    if(!resultado.isEmpty()) {

        // Consultar Modelo de Precio y Categorias
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])

        return res.render('propiedades/crear', {
            pagina: 'Crear Propiedad',
            csrfToken: req.csrfToken(),
            categorias,
            precios, 
            errores: resultado.array(),
            datos: req.body
        })
    }
   // console.log(req.body);
   
   // Crear un Registro, se extraen los datos del request.body, se renombre el precioid por precio.

    const { titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio: precioId, categoria: categoriaId } = req.body

    const { id: usuarioId } = req.usuario
  
    try {
        const propiedadGuardada = await Propiedad.create({
            titulo,
            descripcion,
            habitaciones, 
            estacionamiento, 
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId,
            usuarioId,
            imagen: ''
        })

        const {id} = propiedadGuardada

        res.redirect(`/propiedades/agregarImagen/${id}`)

    } catch (error) {
        console.log(error)
    }
}

const agregaImagen = async (req, res) =>{
    const {id} = req.params  //se extrae el id del modelo propiedades

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)
    if(!propiedad) {
        return res.redirect('/mispropiedades')
    }

    // Validar que la propiedad no este publicada
    if(propiedad.publicado) {
        return res.redirect('/mispropiedades')
    }

    // Validar que la propiedad pertenece a quien visita esta página
    if( req.usuario.id.toString() !== propiedad.usuarioId.toString() ) {
        return res.redirect('/mispropiedades')
    }
    
    res.render('propiedades/agregarImagen', {
        pagina: `Agregar Imagen: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        propiedad
    })
}

const almacenarImagen = async (req, res, next) => {

    const {id} = req.params

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)
    if(!propiedad) {
        return res.redirect('/mispropiedades')
    }

    // Validar que la propiedad no este publicada
    if(propiedad.publicado) {
        return res.redirect('/mispropiedades')
    }

    // Validar que la propiedad pertenece a quien visita esta página
    if( req.usuario.id.toString() !== propiedad.usuarioId.toString() ) {
        return res.redirect('/mispropiedades')
    }

    try {
        // console.log(req.file)

        // Almacenar la imagen y publicar propiedad
        propiedad.imagen = req.file.filename
        propiedad.publicado = 1

        await propiedad.save()

        next()

    } catch (error) {
        console.log(error)
    }
}
const editar = async (req, res)=>{

    //Se esxtrae el id para la url
    const { id } = req.params;

    //Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    if(!propiedad){
        return res.redirect('/mispropiedades')
    }

    //Validar que el que visita la url es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mispropiedades')
    }

    //Consultar modelo categorías, precio
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    res.render('propiedades/editar', {
        pagina: `Editar Propiedad ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: propiedad //Se le pasa propiedad a datos,
    })
}

const guardarCambios = async (req, res) => {
    console.log('Guardando los cambios');

    //Verificar la validación

    let resultado = validationResult(req)

    if(!resultado.isEmpty()) {

        //Consultar Modelo de Precio y Categorías
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])

        return res.render('propiedades/editar' , {
            pagina: 'Editar Propiedad',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos:req.body
        })
    }

    //Se extrae el id para la url
    const { id } = req.params;

    //Validar que la propiedad Exista.
    const propiedad = await Propiedad.findByPk(id);

    if(!propiedad){
        return res.redirect('/mispropiedades')
    }

    //Validar, que el que visita la url es quien creo la propiedad.
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mispropiedades')
    }

    //Reescribir el objeto y actualizarlo en la BD
    //Se extraen los datos.
    //Crear un registro, se extraen los datos del request.body, se renombra el precioId por precio.

    const { titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio: precioId, categoria:categoriaId } = req.body

    //Para evitar usar el propiedad.body, el sequelize ya contiene este metodo set que reemplaza el body
    propiedad.set({
        titulo,
        descripcion,
        habitaciones, 
        estacionamiento, 
        wc,
        calle,
        lat,
        lng,
        precioId,
        categoriaId,
    })
    await propiedad.save(); //Se almacena el objeto en la BD
    res.redirect('/mispropiedades');
}

const eliminar = async (req, res) => {
    console.log('Eliminando...')

    //Se extrae el id para la url
    const { id } = req.params;

    //Validar que la propiedad Exista.
    const propiedad = await Propiedad.findByPk(id);

    if(!propiedad){
        return res.redirect('/mispropiedades')
    }

    //Validar, que el que visita la url es quien creo la propiedad.
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mispropiedades')
    }

    //Eliminar la imagen asociada
        await unlink(`public/uploads/${propiedad.imagen}`);
        console.log(`Se elimino una imagen...${propiedad.imagen}`)
    //Eliminar Propiedad
    propiedad.destroy(); //Elimina la propiedad
    res.redirect('/mispropiedades')
}

const mostrarPropiedad = async (req, res) => {
    // console.log("Mostrando propiedad")
    // res.send('Mostrando Propiedad')

    const { id } = req.params;
    //Comprobar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            {model: Precio, as: 'precio'},
            {model: Categoria, as: 'categoria'},
        ]
    })

    if(!propiedad || !propiedad.publicado) {
        return res.redirect('/404');
    }
    //redireccionamos a mostrar para visualizar los datos consultados
    res.render('propiedades/mostrar' , {
        propiedad,
        pagina: propiedad.titulo,
        csrfToken: req.csrfToken(),
        usuario: req.usuario,
        esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId )
                                //se usa el option and chame, para que tome un  valor
                                //sea que exista o no exista req.usuario?.
    })
}
const enviarMensaje = async (req, res) => {
    const {id} = req.params

    //comprobar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        include : [
            { model: Precio, as: 'precio'},
            { model: Categoria, as: 'categoria'},
        ]
    })

    if(!propiedad) {
        return res.redirect('/404')
    }

    //Renderizar los errores
        //Validación
    let resultado = validationResult(req)

    if(!resultado.isEmpty()) {
        return res.render('propiedades/mostrar' , {
            propiedad,
            pagina: propiedad.titulo,
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
            errores: resultado.array()
        })
    }
    const { mensaje } = req.body //Se extrae el mensaje
    const { id: propiedadId } = req.params //Se extrae de propiedades propiedadId
    const { id: usuarioId } = req.usuario //Se extrae de Usuario el usuarioId

    //Almacenar el mensaje, con los datos de la propiedad y del usuario
    await Mensaje.create({
        mensaje,
        propiedadId,
        usuarioId
    })

    res.redirect('/')
}






const verMensajes = async (req, res) => {
    
    const {id} = req.params //Se consulta a la BD

    //Validar que la propiedad exista, y se trae el modelo de los mensajes de Porpiedad
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            {model: Mensaje, as: 'mensaje',
                include: [ //Se hace el cruce (join) con mensaje para traer los usuarios que crearon el mensaje
                    {model: Usuario.scope('eliminarPassword'), as: 'usuario'}
                ]
            },
        ],
    })

    if(!propiedad) {
        return res.redirect('/mispropiedades')
    }

    //Revisar que quien visita la URL, es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString() ) {
        return res.redirect('/mispropiedades')
    }

    res.render('propiedades/mensajes' , {
        pagina: 'Mensajes',
        mensajes: propiedad.mensajes, //Pasamos mensajes a mensajes.pug
        formatearFecha
    })
}

const cambiarEstado = async (req, res) => {
    //Se extrae el id para la url
    const { id } = req.params;

    //Validar que la propiedad exista.
    const propiedad = await Propiedad.findByPk(id);

    if(!propiedad){
        return res.redirect('/mispropiedades')
    }

    //Validar, que el que visita la url es quien creo la propiedad.
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mispropiedades')
    }

    //Actualizar propiedad
    propiedad.publicado = !propiedad.publicado //si no está publicado se cambia el estado a publicado
    await propiedad.save()

    res.json({
        resultado: 'ok'  //Se envia el resultado a cambiarEstado.
    })
}

export {
    admin,
    crear,
    guardar,
    agregaImagen,
    almacenarImagen,
    editar,
    guardarCambios,
    eliminar,
    mostrarPropiedad,
    enviarMensaje,
    verMensajes,
    cambiarEstado
}