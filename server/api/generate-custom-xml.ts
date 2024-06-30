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
  //rol: path.resolve(process.cwd(), 'server/data/xsd-facture/PES_V2/NS_ROL/r0/PES_RECETTE_ROL.xsd'), // Mettre le vrai chemin pour le xsd rol
  //rec: path.resolve(process.cwd(), 'server/data/xsd-facture/PES_V2/NS_REC/r0/PES_RECETTE_REC.xsd') // Mettre le vrai chemin pour le xsd rec
};

export default defineEventHandler(async (event) => {
  const { numIdPost, numFilesPerIdPost, type } = getQuery(event) as { numIdPost: string; numFilesPerIdPost: string; type: string; };
  const numIdPostInt = parseInt(numIdPost, 10);
  const numFilesPerIdPostInt = parseInt(numFilesPerIdPost, 10);

  const zip = new JSZip();
  let alertMessageIdPost: string[] = [];
  let alertMessageCodCol: string[] = [];
  let alertMessageRecapNbreFacturesDownload: string[] = [];

  let generateXML: (IdPost: string, CodCol: string, idPceStart: number, fileCounter: number) => { nomFic: string; xmlContent: string; currentIdPce: number; };
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
      //xsdPath = xsdPaths.rol;
      break;
    case 'rec':
      generateXML = generateXMLRec;
      mockData = mockDataRec;
      //xsdPath = xsdPaths.rec;
      break;
    default:
      throw new Error('Invalid type');
  }

  availableIdPosts = mockData.length;
  if (numIdPostInt > availableIdPosts) {
    alertMessageIdPost.push(`Vous avez demandé ${numIdPostInt} collectivités, mais nous n'en avons trouvé que ${availableIdPosts}.`);
  }

  const selectedIdPosts = mockData.slice(0, Math.min(numIdPostInt, availableIdPosts));
  const lastIdPce = parseInt(mockIdPceData[mockIdPceData.length - 1].idPce, 10);
  let currentIdPce = lastIdPce + 1;
  let fileCounter = 0;
  let totalFilesGenerated = 0;
  let totalFilesRequested = numIdPostInt * numFilesPerIdPostInt;
  let files: { nomFic: string; content: string; }[] = [];
  let codColError = false;

  let xsdDoc;
  try {
    // console.log(`Reading XSD from: ${xsdPath}`);
    // const xsdContent = fs.readFileSync(xsdPath, 'utf8');
    // console.log(`XSD Content: ${xsdContent}`);
    // xsdDoc = libxmljs.parseXml(xsdContent);
  } catch (error) {
    throw new Error(`Failed to read or parse XSD file: ${(error as Error).message}`);
  }

  selectedIdPosts.forEach((idPostData: { IdPost: string; CodCol: string[]; }) => {
    const { IdPost, CodCol } = idPostData;
    const availableCodCols = CodCol.length;

    if (numFilesPerIdPostInt > availableCodCols && !codColError) {
      alertMessageCodCol.push(`Vous avez demandé ${numFilesPerIdPostInt} factures par collectivité, il n'y a pas assez de code collectivité pour certaines collectivités.`);
      codColError = true;
    }

    const selectedCodCols = CodCol.slice(0, Math.min(numFilesPerIdPostInt, availableCodCols));

    selectedCodCols.forEach((CodCol: string) => {
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

  files.forEach(file => {
    zip.file(file.nomFic, file.content, { compression: 'STORE' });
  });

  alertMessageRecapNbreFacturesDownload.push(`${totalFilesGenerated} / ${totalFilesRequested} factures téléchargées pour le type ${type}.`);

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
