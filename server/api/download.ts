import { defineEventHandler } from 'h3';
import xmlService from '../services/xmlService';

export default defineEventHandler(async (event) => {
  const { filename } = event.context.params || {};

  if (!filename) {
    return { status: 400, message: 'Nom de fichier manquant' };
  }

  try {
    const data = await xmlService.downloadXml(filename);
    event.node.res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    event.node.res.setHeader('Content-Type', 'application/xml');
    event.node.res.end(data);
  } catch (error) {
    return { status: 500, message: 'Erreur lors du téléchargement du fichier' };
  }
});
