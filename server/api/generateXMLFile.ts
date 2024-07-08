import { generateXML as generateXMLHop } from '../data/template-facture/hop-template';
import { generateXML as generateXMLRol } from '../data/template-facture/rol-template';
import { generateXML as generateXMLRec } from '../data/template-facture/rec-template';
import { mockDataHop } from '../data/mock-data-hop';
import { mockDataRol } from '../data/mock-data-rol';
import { mockDataRec } from '../data/mock-data-rec';
import { mockIdPceData } from '../data/mock-idpce';
import {mockNumdetteData} from '../data/mock-numdette';
const generateFiles = (type: string , idPostsArray: any[] | null, numIdPostInt: number | null , numFilesPerIdPostInt: number ) => {
  let generateXML;
  let mockData;
  let mockIncrementValue;

  switch (type) {
    case 'hop':
      generateXML = generateXMLHop;
      mockData = mockDataHop;
      mockIncrementValue = mockIdPceData;
      break;
    case 'rol':
      generateXML = generateXMLRol;
      mockData = mockDataRol;
      mockIncrementValue = mockNumdetteData;
      break;
    case 'rec':
      generateXML = generateXMLRec;
      mockData = mockDataRec;
      mockIncrementValue = mockIdPceData;
      break;
    default:
      throw new Error('Invalid type');
  }

  const lastIdPce = parseInt(mockIncrementValue[mockIncrementValue.length - 1].idPce, 10);
  let currentIdPce = lastIdPce + 1;
  let fileCounter = 0;
  let totalFilesGenerated = 0;
  let files: { nomFic: string; content: string; }[] = [];
  let codColError = false;
  let alertMessageIdPost = [];
  let alertMessageCodCol: string[] = [];
  let alertMessageRecapNbreFacturesDownload = [];

  const processPosts = (posts: any[], numFilesPerPost: number) => {
    posts.forEach((idPostData: { IdPost: any; CodCol: any; }) => {
      const { IdPost, CodCol } = idPostData;
      const availableCodCols = CodCol.length;

      if (numFilesPerPost > availableCodCols && !codColError) {
        alertMessageCodCol.push(`Vous avez demandé ${numFilesPerPost} factures par collectivité, il n'y a pas assez de code collectivité pour certains postes comptables.`);
        codColError = true;
      }

      const selectedCodCols = CodCol.slice(0, Math.min(numFilesPerPost, availableCodCols));

      selectedCodCols.forEach((CodCol: string) => {
        const { nomFic, xmlContent, currentIdPce: newCurrentIdPce } = generateXML(IdPost, CodCol, currentIdPce, fileCounter);
        currentIdPce = newCurrentIdPce;
        fileCounter += 1;
        files.push({ nomFic, content: xmlContent });
        totalFilesGenerated += 1;
      });
    });
  };

  if (idPostsArray) {
    const totalFilesRequested = idPostsArray.length * numFilesPerIdPostInt;
    const selectedIdPosts = idPostsArray.map((IdPost: string) => mockData.find(item => item.IdPost === IdPost)).filter(Boolean);

    selectedIdPosts.forEach((idPostData: { IdPost: any; }) => {
      if (!idPostData) {
        alertMessageIdPost.push(`Le poste comptable ${idPostData.IdPost} n'a pas été trouvé.`);
      }
    });

    processPosts(selectedIdPosts, numFilesPerIdPostInt);

    alertMessageRecapNbreFacturesDownload.push(`${totalFilesGenerated} / ${totalFilesRequested} factures téléchargées pour le type ${type}.`);
  } else {
    const availableIdPosts = mockData.length;
    if (numIdPostInt > availableIdPosts) {
      alertMessageIdPost.push(`Vous avez demandé ${numIdPostInt} collectivités, mais nous n'en avons trouvé que ${availableIdPosts}.`);
    }

    const selectedIdPosts = mockData.slice(0, Math.min(numIdPostInt, availableIdPosts));
    const totalFilesRequested = numIdPostInt * numFilesPerIdPostInt;

    processPosts(selectedIdPosts, numFilesPerIdPostInt);

    alertMessageRecapNbreFacturesDownload.push(`${totalFilesGenerated} / ${totalFilesRequested} factures téléchargées pour le type ${type}.`);
  }

  return { files, alerts: { idPost: alertMessageIdPost, codCol: alertMessageCodCol, recap: alertMessageRecapNbreFacturesDownload } };
};

export default generateFiles;
