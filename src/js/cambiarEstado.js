(function(){
    const cambiarEstadoBotones = document.querySelectorAll('.cambiarestado')
    //Tomando el token para enviarlo
    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content')
    //Se hace iteración sobre cada botón.
    cambiarEstadoBotones.forEach(boton => {
        boton.addEventListener('click', cambiarEstadoPropiedad);
    })

    //se reciben los eventos
    async function cambiarEstadoPropiedad(e) {

        //Se extrae propiedadId y se renombra con id
        const {propiedadId: id} = e.target.dataset;

        try {
            const url = `/propiedades/cambiarestado/${id}`;

            const respuesta = await fetch(url, {
                method: 'PUT',
                headers: {
                    'CSRF-token': token //Se envia el token a la url

                }
            })

            const {resultado} = await respuesta.json()

            //Si todo está bien, con el target identica el elemento sobre el cual estoy haciendo click
            if(resultado) {
                if(e.target.classList.contains('bg-yellow-100')) {
                    e.target.classList.add('bg-green-100' ,  'text-green-800')
                    e.target.classList.remove('bg-yellow-100' , 'text-yellow-800')
                    e.target.textContent = 'Publicado'
                }else{
                    e.target.classList.remove('bg-green-100' , 'text-green-800')
                    e.target.classList.add('bg-yellow-100' , 'text-yellow-800')
                    e.target.textContent = 'No Publicado'
                }
            }
        } catch (error) {
            console.log(error)
        }
    }
})();