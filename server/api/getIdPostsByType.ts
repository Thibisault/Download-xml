import { defineEventHandler, getQuery } from 'h3';
import { mockDataHop } from '../data/mock-data/mock-data-hop';
import { mockDataRol } from '../data/mock-data/mock-data-rol';
import { mockDataRec } from '../data/mock-data/mock-data-rec';

export default defineEventHandler(async (event) => {
  const { type } = getQuery(event);

  let data : Array<any> = [];
  switch (type) {
    case 'hop':
      data = mockDataHop;
      break;
    case 'rol':
      data = mockDataRol;
      break;
    case 'rec':
      data = mockDataRec;
      break;
    default:
      data = [];
  }

  return data;
});

// import { defineEventHandler, getQuery } from 'h3';
// import mysql, { QueryResult } from 'mysql2/promise';
// import {dbConfig} from '../config/db-config';

// async function queryDatabase(query: string) { // Fonction permettant de se connecter à la bdd avec les données reçus en paramètre (dbConfig)
//   const connection = await mysql.createConnection(dbConfig);
//   const [results] = await connection.execute(query);
//   await connection.end();
//   return results;
// }

// export default defineEventHandler(async (event) => {
//   const { type } = getQuery(event);

//   let data: QueryResult = []; // Pas sûr du type de data
//   try {
//     let query = '';
//     switch (type) {
//       case 'hop':
//         query = 'SELECT * FROM hop'; // Changer les requêtes pour qu'elles correspondent à la bdd
//         break;
//       case 'rol':
//         query = 'SELECT * FROM rol'; // Changer les requêtes pour qu'elles correspondent à la bdd
//         break;
//       case 'rec':
//         query = 'SELECT * FROM rec'; // Changer les requêtes pour qu'elles correspondent à la bdd
//         break;
//       default:
//         return { error: 'Type non valide' };
//     }

//     data = await queryDatabase(query);
//   } catch (error) {
//     return { error: 'Erreur lors de la récupération des données' };
//   }

//   return data;
// });
