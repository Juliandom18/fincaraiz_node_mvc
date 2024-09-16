/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/mapaInicio.js":
/*!******************************!*\
  !*** ./src/js/mapaInicio.js ***!
  \******************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n// import { categoria } from \"../../controller/appController\";\r\n\r\n(function(){\r\n\r\n    const lat = 4.8367424;\r\n    const lng = -75.6808774;\r\n    const mapa = L.map('mapa-inicio').setView([lat, lng ], 13);\r\n\r\n    //Se crea la varible para los marcadores.\r\n    let markers = new L.FeatureGroup().addTo(mapa)\r\n\r\n    let propiedades = [];\r\n\r\n    //filtros, reciben de la funcion filtrarPropiedades los arrelos\r\n    const  filtros = {\r\n        categoria: '',\r\n        precio: ''\r\n    }\r\n    //Para hacer los filtro en las propiedades  desplegables\r\n    const categoriasSelect = document.querySelector('#categorias');\r\n    const preciosSelect = document.querySelector('#precios');\r\n    \r\n    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' , {\r\n        attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors'\r\n    }).addTo(mapa);\r\n\r\n    //filtrando categorias y precios\r\n    categoriasSelect.addEventListener('change', e => {\r\n        filtros.categoria = +e.target.value\r\n        filtrarPropiedades();\r\n    })\r\n\r\n    preciosSelect.addEventListener('change', e => {\r\n        filtros.precio = +e.target.value //+e permite convertir los string por defecto a numero\r\n        filtrarPropiedades();\r\n    }) \r\n\r\n\r\n    const obtenerPropiedades = async () => {\r\n        try{\r\n            const url = '/api/propiedades'\r\n            const respuesta = await fetch(url)//Se conecta a la BD\r\n            propiedades = await respuesta.json()\r\n            mostrarPropiedades(propiedades) //Se le pasa el resultado de la consulta\r\n        }catch (error) {\r\n            console.log(error)\r\n        }\r\n    }\r\n\r\n    const mostrarPropiedades = propiedades => {\r\n\r\n\r\n        //Limpiar los markers previos\r\n        markers.clearLayers()\r\n\r\n        propiedades.forEach(propiedad => {\r\n            //agregar los pines\r\n            const marker = new L.marker([propiedad?.lat, propiedad?.lng ], {\r\n                autoPan: true //darle click en el marker\r\n            })\r\n            .addTo(mapa)\r\n            .bindPopup(`\r\n                <p class=\"text-white-600 font-bold\">${propiedad.categoria.nombre}</p>\r\n                <h1 class=\"text-xl font-extrabold uppercase my-2\">${propiedad?.titulo}</h1>\r\n                <img src=\"/uploads/${propiedad?.imagen}\" alt=\"Imagen de la propiedad ${propiedad.titulo}\">\r\n                <p class=\"text-gray-600 font-bold\">${propiedad.precio.nombre}</p>\r\n                <a href=\"/propiedad/${propiedad.id}\" class=\"bg-green-600 block p-2 text-center font-bold\r\n                uppercase\">Ver Propiedad</a>\r\n            `)\r\n            markers.addLayer(marker)\r\n        })\r\n    }\r\n\r\n    //Filtrando de acuerdo  a la selección del usuario\r\n    const filtrarPropiedades = () => {\r\n        const resultado = propiedades.filter( filtrarCategoria ).filter( filtrarPrecio )//arrray  metodo que no se pueden utilizar objetos solo arreglos, se filtra tanto por categoria como por precio\r\n        mostrarPropiedades(resultado)\r\n    }\r\n\r\n    const filtrarCategoria = propiedad => filtros.categoria ? propiedad.categoriaId === filtros.categoria : propiedad\r\n\r\n    const filtrarPrecio = propiedad => filtros.precio ? propiedad.precioId === filtros.precio : propiedad\r\n\r\n\r\n    obtenerPropiedades();\r\n})()\r\n\n\n//# sourceURL=webpack://afincaraiz/./src/js/mapaInicio.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/js/mapaInicio.js"](0, __webpack_exports__, __webpack_require__);
/******/ 	
/******/ })()
;