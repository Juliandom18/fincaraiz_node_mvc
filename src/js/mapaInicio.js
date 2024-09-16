// import { categoria } from "../../controller/appController";

(function(){

    const lat = 4.8367424;
    const lng = -75.6808774;
    const mapa = L.map('mapa-inicio').setView([lat, lng ], 13);

    //Se crea la varible para los marcadores.
    let markers = new L.FeatureGroup().addTo(mapa)

    let propiedades = [];

    //filtros, reciben de la funcion filtrarPropiedades los arrelos
    const  filtros = {
        categoria: '',
        precio: ''
    }
    //Para hacer los filtro en las propiedades  desplegables
    const categoriasSelect = document.querySelector('#categorias');
    const preciosSelect = document.querySelector('#precios');
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' , {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    //filtrando categorias y precios
    categoriasSelect.addEventListener('change', e => {
        filtros.categoria = +e.target.value
        filtrarPropiedades();
    })

    preciosSelect.addEventListener('change', e => {
        filtros.precio = +e.target.value //+e permite convertir los string por defecto a numero
        filtrarPropiedades();
    }) 


    const obtenerPropiedades = async () => {
        try{
            const url = '/api/propiedades'
            const respuesta = await fetch(url)//Se conecta a la BD
            propiedades = await respuesta.json()
            mostrarPropiedades(propiedades) //Se le pasa el resultado de la consulta
        }catch (error) {
            console.log(error)
        }
    }

    const mostrarPropiedades = propiedades => {


        //Limpiar los markers previos
        markers.clearLayers()

        propiedades.forEach(propiedad => {
            //agregar los pines
            const marker = new L.marker([propiedad?.lat, propiedad?.lng ], {
                autoPan: true //darle click en el marker
            })
            .addTo(mapa)
            .bindPopup(`
                <p class="text-white-600 font-bold">${propiedad.categoria.nombre}</p>
                <h1 class="text-xl font-extrabold uppercase my-2">${propiedad?.titulo}</h1>
                <img src="/uploads/${propiedad?.imagen}" alt="Imagen de la propiedad ${propiedad.titulo}">
                <p class="text-gray-600 font-bold">${propiedad.precio.nombre}</p>
                <a href="/propiedad/${propiedad.id}" class="bg-green-600 block p-2 text-center font-bold
                uppercase">Ver Propiedad</a>
            `)
            markers.addLayer(marker)
        })
    }

    //Filtrando de acuerdo  a la selección del usuario
    const filtrarPropiedades = () => {
        const resultado = propiedades.filter( filtrarCategoria ).filter( filtrarPrecio )//arrray  metodo que no se pueden utilizar objetos solo arreglos, se filtra tanto por categoria como por precio
        mostrarPropiedades(resultado)
    }

    const filtrarCategoria = propiedad => filtros.categoria ? propiedad.categoriaId === filtros.categoria : propiedad

    const filtrarPrecio = propiedad => filtros.precio ? propiedad.precioId === filtros.precio : propiedad


    obtenerPropiedades();
})()
