import { defineEventHandler } from 'h3';
import xmlService from '../services/xmlService';

export default defineEventHandler(async (event) => {
  const { filename } = event.context.params || {};

  if (!filename) {
    return { status: 400, message: 'Nom de fichier manquant' };
  }

  try {
    await xmlService.deleteXml(filename);
    return { status: 200, message: 'Fichier supprimé avec succès' };
  } catch (error) {
    return { status: 500, message: 'Erreur lors de la suppression du fichier' };
  }
});
