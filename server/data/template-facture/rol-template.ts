import * as xmlbuilder from 'xmlbuilder';

function getRandomString(length: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getRandomNumber(length: number) {
  const chars = '0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getRandomDate() {
  const start = new Date(2000, 0, 1);
  const end = new Date();
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

export function generateXML(IdPost: string, CodCol: string, numDetteStart: number, fileCounter: number): { nomFic: string, xmlContent: string, currentNumDette: number } {
  const idRol = Math.floor(Math.random() * 9) + 1;
  let currentNumDette = numDetteStart;

  const TypFic = 'TIPIROL';
  const Exer = new Date().getFullYear().toString();
  const NomFic = `${TypFic}_${IdPost}_${CodCol}_${Exer}_${fileCounter.toString().padStart(3, '0')}.xml`;

  const xml = xmlbuilder.create('n:PES_Retour', {
    version: '1.0',
    encoding: 'ISO-8859-15',
    xmlns: {
      n: 'http://www.minefi.gouv.fr/cp/helios/pes_v2/Rev0/retour',
      xsi: 'http://www.w3.org/2001/XMLSchema-instance'
    }
  })
  .att('xsi:schemaLocation', 'http://www.minefi.gouv.fr/cp/helios/pes_v2/Rev0/retour /opt/tx5115/users/ediprod/messages/XML/PES_V2/Externe/Schemas_PES/PES_V2/Rev0/PES_V2_TIPI_ROLE_Autonome.xsd')
  .ele('Enveloppe')
    .ele('Parametres')
      .ele('Version', { V: '2' }).up()
      .ele('TypFic', { V: TypFic }).up()
      .ele('NomFic', { V: NomFic }).up()
    .up()
  .up()
  .ele('EnTetePES')
    .ele('DteStr', { V: getRandomDate() }).up()
    .ele('IdPost', { V: IdPost }).up()
    .ele('CodCol', { V: CodCol }).up()
    .ele('CodBud', { V: '00' }).up()
  .up()
  .ele('PES_TIPI_Role')
    .ele('Role')
      .ele('BlocRole')
        .ele('Exer', { V: Exer }).up()
        .ele('IdRol', { V: idRol.toString() }).up()
        .ele('TypRol', { V: '01' }).up()
        .ele('DteAsp', { V: getRandomDate() }).up()
      .up();

  for (let i = 0; i < idRol; i++) {
    const article = xml.ele('Article');
    const blocArticle = article.ele('BlocArticle')
      .ele('InfoArticle')
        .ele('IdPce', { V: (23070000 + i + 1).toString() }).up()
        .ele('NumDette', { V: (currentNumDette++).toString() }).up()
        .ele('Per', { V: '1' }).up()
        .ele('EtatPce', { V: '02' }).up()
        .ele('DtePcePec', { V: getRandomDate() }).up()
        .ele('CodProdLoc', { V: '83' }).up()
        .ele('ObjPce', { V: 'Facture Cantine Juillet 2023' }).up()
        .ele('MtTTC', { V: (Math.random() * 50).toFixed(2) }).up()
      .up()
    .up();

    const tiers = article.ele('Tiers')
      .ele('InfoTiers')
        .ele('RefTiers', { V: getRandomNumber(12) }).up()
        .ele('CatTiers', { V: '01' }).up()
        .ele('Civilite', { V: 'MME' }).up()
        .ele('Nom', { V: getRandomString(10) }).up()
        .ele('Prenom', { V: getRandomString(10) }).up()
      .up()
      .ele('Adresse')
        .ele('Adr1', { V: getRandomString(20) }).up()
        .ele('CP', { V: getRandomNumber(5) }).up()
        .ele('Ville', { V: getRandomString(15) }).up()
      .up()
    .up();
  }

  const xmlContent = xml.end({ pretty: true });
  return { nomFic: NomFic, xmlContent, currentNumDette };
}
