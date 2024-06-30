import { defineEventHandler, readBody } from 'h3';
import xmlService from '../services/xmlService';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  try {
    await xmlService.updateXml(body.filename, body.data);
    return { status: 200, message: 'Fichier mis à jour avec succès' };
  } catch (error) {
    return { status: 500, message: 'Erreur lors de la mise à jour du fichier' };
  }
});
