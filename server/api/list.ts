import { defineEventHandler, readBody } from 'h3';
import xmlService from '../services/xmlService';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const filename = body?.filename || ''; 

  try {
    const files = await xmlService.listXmlFiles(filename);
    return { status: 200, files };
  } catch (error) {
    return { status: 500, message: 'Erreur lors du chargement des fichiers XML' };
  }
});
