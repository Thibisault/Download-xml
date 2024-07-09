import { defineEventHandler, getQuery, sendStream } from 'h3';
import JSZip, { forEach } from 'jszip';
import { Readable } from 'stream';
import generateFiles from '../services/generateXMLFile';
import validateXML from '../services/validateXMLFile';

export default defineEventHandler(async (event) => {
  const { numIdPost, numFilesPerIdPost, type, idPosts } = getQuery(event);
  const numIdPostInt = numIdPost ? parseInt(String(numIdPost), 10) : null;
  const numFilesPerIdPostInt = numFilesPerIdPost ? parseInt(String(numFilesPerIdPost), 10) : null;
  const idPostsArray = idPosts ? String(idPosts).split(',') : null;

  const zip = new JSZip();
  let files;
  let alerts: { codCol: string[]; };
  let errorMessages : string = '';
  let numberErrorsForValidationXsdXml : number = 0;

  try {
    ({ files, alerts } = generateFiles(type, idPostsArray, numIdPostInt, numFilesPerIdPostInt));
    
    files.forEach(file => { 
      try {
        validateXML(type, file.content);
      } catch (validationError : any) {
        if (errorMessages.length === 0 || errorMessages === undefined || errorMessages === null) {
        errorMessages = validationError.message;
        }
        numberErrorsForValidationXsdXml += 1;
      }
      zip.file(file.nomFic, file.content, { compression: 'STORE' });
    });
  } catch (error : any) {
    throw new Error(`Erreur pendant la génération ou la validation: ${error.message}`);
  }
  alerts.codCol.push(errorMessages);
  if (alerts.codCol.length > 0) {
    alerts.codCol.push('Il y a ' + numberErrorsForValidationXsdXml + ' facture(s) qui n\'ont pas réussi la validation XML/XSD')
  }

  const content = await zip.generateAsync({ type: 'nodebuffer' });

  const stream = new Readable();
  stream.push(content);
  stream.push(null);

  event.node.res.setHeader('Content-Disposition', 'attachment; filename="generated_files.zip"');
  event.node.res.setHeader('Content-Type', 'application/zip');
  event.node.res.setHeader('X-Alerts', JSON.stringify(alerts));

  return sendStream(event, stream);
});
