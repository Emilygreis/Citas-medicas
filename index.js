const express = require('express');
const app = express();
const { engine } = require('express-handlebars');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const chalk = require('chalk');

app.listen(3000, () => {
  console.log('El servidor está inicializado en el puerto 3000');
});

app.engine(
  "handlebars",
  engine({
    layoutsDir: __dirname + "/views",
    partialsDir: __dirname + "/views/componentes/",
  })
);

app.set("view engine", "handlebars");

app.get('/', async (req, res) => {
  try {
    const listado = await registrarPacientes();
    imprimirListado(listado);
    res.render("Inicio", {
      layout: "Inicio",
      listado: listado,
    });
  } catch (error) {
    console.error('Error en el endpoint /: ', error);
    res.status(500).send('Error al obtener el listado de pacientes');
  }
});

function imprimirListado(listado) {
  console.log('');
  listado.forEach((pacientes) => {
    console.log(chalk.blue.bgWhite(`${pacientes.titulo}:`));
    pacientes.lista.forEach((paciente) => {
      console.log(chalk.blue.bgWhite(`Nombre: ${paciente.nombre} - Apellido: ${paciente.apellido} - ID: ${paciente.id} - Timestamp: ${paciente.timestamp}`));
    }); 
    console.log('');
  })
}

async function registrarPacientes() {
  try {
    const response = await axios.get('https://randomuser.me/api/', {
      params: {
        results: 10
      }
    });

    const listadoHombres = [];
    const listadoMujeres = [];

    response.data.results.forEach(persona => {
      const objetoPersona = {
        nombre: persona.name.first,
        apellido: persona.name.last,
        id: uuidv4(),
        timestamp: moment().format("MMMM Do YYYY, h:mm:ss a")
      };

      if (persona.gender === 'male') {
        listadoHombres.push(objetoPersona);
      } else {
        listadoMujeres.push(objetoPersona);
      }
    });

    return [{titulo: "Mujeres", lista: listadoMujeres}, {titulo: "Hombres", lista: listadoHombres}];
  } catch (error) {
    console.error('Error al registrar pacientes: ', error);
    return [];
  }
}