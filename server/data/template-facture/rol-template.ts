import { create } from 'xmlbuilder2';

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

export function generateXML(IdPost: string, CodCol: string, idPceStart: number, fileCounter: number): { nomFic: string, xmlContent: string, currentIdPce: number } {
  const idRol = Math.floor(Math.random() * 9) + 1;
  let currentIdPce = idPceStart;

  const TypFic = 'TIPIROL';
  const Exer = new Date().getFullYear().toString();
  const NomFic = `${TypFic}_${IdPost}_${CodCol}_${Exer}_${fileCounter.toString().padStart(3, '0')}.xml`;

  const xml = create({ version: '1.0', encoding: 'ISO-8859-15' })
    .ele('n:PES_Retour')
      .att('xmlns:n', 'http://www.minefi.gouv.fr/cp/helios/pes_v2/Rev0/retour')
      .att('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
      .att('xsi:schemaLocation', 'http://www.minefi.gouv.fr/cp/helios/pes_v2/Rev0/retour /opt/tx5115/users/ediprod/messages/XML/PES_V2/Externe/Schemas_PES/PES_V2/Rev0/PES_V2_TIPI_ROLE_Autonome.xsd')
      .ele('Enveloppe')
        .ele('Parametres')
          .ele('Version').att('V', '2').up()
          .ele('TypFic').att('V', TypFic).up()
          .ele('NomFic').att('V', NomFic).up()
        .up()
      .up()
      .ele('EnTetePES')
        .ele('DteStr').att('V', getRandomDate()).up()
        .ele('IdPost').att('V', IdPost).up()
        .ele('CodCol').att('V', CodCol).up()
        .ele('CodBud').att('V', '00').up()
      .up()
      .ele('PES_TIPI_Role')
        .ele('Role')
          .ele('BlocRole')
            .ele('Exer').att('V', Exer).up()
            .ele('IdRol').att('V', idRol.toString()).up()
            .ele('TypRol').att('V', '01').up()
            .ele('DteAsp').att('V', getRandomDate()).up()
          .up();

  for (let i = 0; i < idRol; i++) {
    const article = xml.ele('Article');
    const blocArticle = article.ele('BlocArticle')
      .ele('InfoArticle')
        .ele('IdPce').att('V', (23070000 + i + 1).toString()).up()
        .ele('NumDette').att('V', (currentIdPce++).toString()).up()
        .ele('Per').att('V', '1').up()
        .ele('EtatPce').att('V', '02').up()
        .ele('DtePcePec').att('V', getRandomDate()).up()
        .ele('CodProdLoc').att('V', '83').up()
        .ele('ObjPce').att('V', 'Facture Cantine Juillet 2023').up()
        .ele('MtTTC').att('V', (Math.random() * 50).toFixed(2)).up()
      .up()
    .up();

    const tiers = article.ele('Tiers')
      .ele('InfoTiers')
        .ele('RefTiers').att('V', getRandomNumber(12)).up()
        .ele('CatTiers').att('V', '01').up()
        .ele('Civilite').att('V', 'MME').up()
        .ele('Nom').att('V', getRandomString(10)).up()
        .ele('Prenom').att('V', getRandomString(10)).up()
      .up()
      .ele('Adresse')
        .ele('Adr1').att('V', getRandomString(20)).up()
        .ele('CP').att('V', getRandomNumber(5)).up()
        .ele('Ville').att('V', getRandomString(15)).up()
      .up()
    .up();
  }

  const xmlContent = xml.end({ prettyPrint: true });
  return { nomFic: NomFic, xmlContent, currentIdPce };
}
