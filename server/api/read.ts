import { defineEventHandler } from 'h3';
import xmlService from '../services/xmlService';

export default defineEventHandler(async (event) => {
  const { filename } = event.context.params || {};

  if (!filename) {
    return { status: 400, message: 'Nom de fichier manquant' };
  }

  try {
    const data = await xmlService.readXml(filename);
    return { status: 200, data };
  } catch (error) {
    return { status: 500, message: 'Erreur lors de la lecture du fichier' };
  }
});
