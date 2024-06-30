import { defineEventHandler, getQuery, sendStream } from 'h3';
import JSZip from 'jszip';
import { generateXML as generateXMLHop } from '../data/template-facture/hop-template';
import { generateXML as generateXMLRol } from '../data/template-facture/rol-template';
import { generateXML as generateXMLRec } from '../data/template-facture/rec-template';
import { mockDataHop } from '../data/mock-data-hop';
import { mockDataRol } from '../data/mock-data-rol';
import { mockDataRec } from '../data/mock-data-rec';
import { mockIdPceData } from '../data/mock-idpce';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import libxmljs from 'libxmljs2';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Définir les chemins XSD pour chaque type de fichier
const xsdPaths = {
  hop: path.resolve(process.cwd(), 'server/data/xsd-facture/PES_V2/NS_TIPIRECETTE/r0/PES_RECETTE_TIPI.xsd'),
  rol: path.resolve(process.cwd(), 'server/data/xsd-facture/PES_V2/...'), // Mettre le vrai chemin pour le xsd rol
  rec: path.resolve(process.cwd(), 'server/data/xsd-facture/PES_V2/...') // Mettre le vrai chemin pour le xsd rec
};

export default defineEventHandler(async (event) => {
const { numIdPost, numFilesPerIdPost, numFilesPerPostComptable, type, idPosts } = getQuery(event);
const numIdPostInt = numIdPost ? parseInt(String(numIdPost), 10) : null;
const numFilesPerIdPostInt = numFilesPerIdPost ? parseInt(String(numFilesPerIdPost), 10) : null;
const numFilesPerPostComptableInt = numFilesPerPostComptable ? parseInt(String(numFilesPerPostComptable), 10) : null;
const idPostsArray = idPosts ? String(idPosts).split(',') : null;

  const zip = new JSZip();
  let alertMessageIdPost: string[] = [];
  let alertMessageCodCol: string[] = [];
  let alertMessageRecapNbreFacturesDownload: string[] = [];

  let generateXML;
  let mockData;
  let availableIdPosts;
  let xsdPath;

  switch (type) {
    case 'hop':
      generateXML = generateXMLHop;
      mockData = mockDataHop;
      xsdPath = xsdPaths.hop;
      break;
    case 'rol':
      generateXML = generateXMLRol;
      mockData = mockDataRol;
      xsdPath = xsdPaths.rol;
      break;
    case 'rec':
      generateXML = generateXMLRec;
      mockData = mockDataRec;
      xsdPath = xsdPaths.rec;
      break;
    default:
      throw new Error('Invalid type');
  }

  const lastIdPce = parseInt(mockIdPceData[mockIdPceData.length - 1].idPce, 10);
  let currentIdPce = lastIdPce + 1;
  let fileCounter = 0;
  let totalFilesGenerated = 0;
  let files: { nomFic: string; content: string; }[] = [];
  let codColError = false;

  // let xsdDoc;
  // try {
  //   xsdDoc = libxmljs.parseXml(fs.readFileSync(xsdPath, 'utf8'));
  // } catch (error) {
  //   throw new Error(`Failed to read or parse XSD file: ${(error as Error).message}`);
  // }

  if (idPostsArray) {
    // Mode personnalisé
    const totalFilesRequested = idPostsArray.length * numFilesPerPostComptableInt;

    idPostsArray.forEach((IdPost) => {
      const idPostData = mockData.find(item => item.IdPost === IdPost);
      if (!idPostData) { 
        alertMessageIdPost.push(`Le poste comptable ${IdPost} n'a pas été trouvé.`);
        return;
      } 

      const { CodCol } = idPostData;
      const availableCodCols = CodCol.length;

      if (numFilesPerPostComptableInt > availableCodCols && !codColError) {
        alertMessageCodCol.push(`Vous avez demandé ${numFilesPerPostComptableInt} factures par collectivité, il n'y a pas assez de code collectivité pour certaines collectivités.`);
        codColError = true;
      }

      const selectedCodCols = CodCol.slice(0, Math.min(numFilesPerPostComptableInt, availableCodCols));

      selectedCodCols.forEach((CodCol) => {
        const { nomFic, xmlContent, currentIdPce: newCurrentIdPce } = generateXML(IdPost, CodCol, currentIdPce, fileCounter);
        const xmlDoc = libxmljs.parseXml(xmlContent);

        // const isValid = xmlDoc.validate(xsdDoc);
        // if (!isValid) {
        //   throw new Error(`XML validation failed for ${nomFic}: ${xmlDoc.validationErrors.map(error => error.message).join(', ')}`);
        // }

        currentIdPce = newCurrentIdPce;
        fileCounter += 1;
        files.push({ nomFic, content: xmlContent });
        totalFilesGenerated += 1;
      });
    });

    alertMessageRecapNbreFacturesDownload.push(`${totalFilesGenerated} / ${totalFilesRequested} factures téléchargées pour le type ${type}.`);
  } else {
    // Mode standard
    availableIdPosts = mockData.length;
    if (numIdPostInt > availableIdPosts) {
      alertMessageIdPost.push(`Vous avez demandé ${numIdPostInt} collectivités, mais nous n'en avons trouvé que ${availableIdPosts}.`);
    }

    const selectedIdPosts = mockData.slice(0, Math.min(numIdPostInt, availableIdPosts));
    const totalFilesRequested = numIdPostInt * numFilesPerIdPostInt;

    selectedIdPosts.forEach((idPostData) => {
      const { IdPost, CodCol } = idPostData;
      const availableCodCols = CodCol.length;

      if (numFilesPerIdPostInt > availableCodCols && !codColError) {
        alertMessageCodCol.push(`Vous avez demandé ${numFilesPerIdPostInt} factures par collectivité, il n'y a pas assez de code collectivité pour certaines collectivités.`);
        codColError = true;
      }

      const selectedCodCols = CodCol.slice(0, Math.min(numFilesPerIdPostInt, availableCodCols));

      selectedCodCols.forEach((CodCol) => {
        const { nomFic, xmlContent, currentIdPce: newCurrentIdPce } = generateXML(IdPost, CodCol, currentIdPce, fileCounter);
        const xmlDoc = libxmljs.parseXml(xmlContent);

        // const isValid = xmlDoc.validate(xsdDoc);
        // if (!isValid) {
        //   throw new Error(`XML validation failed for ${nomFic}: ${xmlDoc.validationErrors.map(error => error.message).join(', ')}`);
        // }

        currentIdPce = newCurrentIdPce;
        fileCounter += 1;
        files.push({ nomFic, content: xmlContent });
        totalFilesGenerated += 1;
      });
    });

    alertMessageRecapNbreFacturesDownload.push(`${totalFilesGenerated} / ${totalFilesRequested} factures téléchargées pour le type ${type}.`);
  }

  files.forEach(file => {
    zip.file(file.nomFic, file.content, { compression: 'STORE' });
  });

  const content = await zip.generateAsync({ type: 'nodebuffer' });

  const stream = new Readable();
  stream.push(content);
  stream.push(null);

  const alerts = {
    idPost: alertMessageIdPost,
    codCol: alertMessageCodCol,
    recap: alertMessageRecapNbreFacturesDownload
  };

  event.node.res.setHeader('Content-Disposition', 'attachment; filename="generated_files.zip"');
  event.node.res.setHeader('Content-Type', 'application/zip');
  event.node.res.setHeader('X-Alerts', JSON.stringify(alerts));

  return sendStream(event, stream);
});
