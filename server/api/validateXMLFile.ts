import libxmljs from 'libxmljs2';
import fs from 'fs';
import path from 'path';
import { QueryValue } from 'ufo';

const xsdPaths: { [key: string]: string } = {
  hop: path.resolve(process.cwd(), 'server/data/xsd-facture/PES_V2/Rev0/PES_V2_TIPI_RECETTE_Autonome.xsd'),
  rol: path.resolve(process.cwd(), 'server/data/xsd-facture/PES_V2/Rev0/PES_V2_TIPI_ROLE_Autonome.xsd'), // Mettre le vrai chemin pour le xsd rol
  rec: path.resolve(process.cwd(), 'server/data/xsd-facture/PES_V2/Rev0/PES_V2_TIPI_RECETTE_Autonome.xsd') // Mettre le vrai chemin pour le xsd rec
};

const validateXML = (type: string, xmlContent: string) => {
  const xsdPath = xsdPaths[type];
  let xsdDoc;
  try {
    xsdDoc = libxmljs.parseXml(fs.readFileSync(xsdPath, 'utf8'), { baseUrl: 'server/data/xsd-facture/PES_V2/Rev0/' });
  } catch (error : any) {
    throw new Error(`Failed to read or parse XSD file: ${(error).message}`);
  }

  const xmlDoc = libxmljs.parseXml(xmlContent);
  const isValid = xmlDoc.validate(xsdDoc);
  if (!isValid) {
    const validationErrors = xmlDoc.validationErrors;
    throw new Error(`XML validation échoué: ${validationErrors.map(err => err.message).join(', ')}`);
  }
  return xmlDoc;
};

export default validateXML;
