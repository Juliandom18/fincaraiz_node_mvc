//toma el usuario que esta autenticado y el usuario que creo la propiedad
const esVendedor = (usuarioId, propiedadUsuarioId) => {
    return usuarioId === propiedadUsuarioId //Si esto es igual, indica que es el vendedor
}

const formatearFecha = fecha => {
    const nuevaFecha = new Date(fecha).toISOString().slice(0, 10)

    const opciones = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }
    
    return new Date(nuevaFecha).toLocaleDateString('es-ES', opciones)
}
export {
    esVendedor,
    formatearFecha
}