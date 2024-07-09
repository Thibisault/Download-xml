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

function getRandomTypTiers() {
  const typTiersValues = ['01', '02', '03', '04', '05', '06', '07'];
  return typTiersValues[Math.floor(Math.random() * typTiersValues.length)];
}

export function generateXML(IdPost: string, CodCol: string, CodBud: string, idPceStart: number, fileCounter: number): { nomFic: string, xmlContent: string, currentIdPce: number } {
  const nbrePce = Math.floor(Math.random() * 9) + 1;
  let currentIdPce = idPceStart;

  const TypFic = 'TIPIHOP';
  const Exer = new Date().getFullYear().toString();
  const NomFic = `SL1V_${TypFic}_${IdPost}_${CodCol}_${CodBud}_${Exer}_${fileCounter.toString().padStart(3, '0')}.xml`;

  const xml = create({ version: '1.0', encoding: 'ISO-8859-15' })
    .ele('n:PES_Retour', {
      'xmlns:n': 'http://www.minefi.gouv.fr/cp/helios/pes_v2/Rev0/retour',
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      'xsi:schemaLocation': 'http://www.minefi.gouv.fr/cp/helios/pes_v2/Rev0/retour /opt/tx5115/users/ediprod/messages/XML/PES_V2/Externe/Schemas_PES/PES_V2/Rev0/PES_V2_TIPI_RECETTE_Autonome.xsd'
    })
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
      .ele('LibellePoste').att('V', 'CHAMBERY ETS HOSPITALIERS').up() // Element facultatif pour validation xsd
      .ele('IdColl').att('V', getRandomNumber(14)).up() // Element facultatif pour validation xsd
      .ele('FinJur').att('V', getRandomNumber(9)).up()  // Element facultatif pour validation xsd
      .ele('CodCol').att('V', CodCol).up()
      .ele('CodBud').att('V', CodBud).up()  // Element facultatif pour validation xsd
      .ele('LibelleColBud').att('V', 'CHG BOURG ST MAURICE').up()  // Element facultatif pour validation xsd
    .up()
    .ele('PES_TIPI_Recette')
      .ele('Bordereau')
        .ele('BlocBordereau')
          .ele('Exer').att('V', Exer).up()
          .ele('IdBord').att('V', getRandomNumber(7)).up()
          .ele('TypBord').att('V', '01').up()
          .ele('NbrePce').att('V', nbrePce.toString()).up()
        .up();

  for (let i = 0; i < nbrePce; i++) {
    const piece = xml.ele('Piece');
    piece.ele('BlocPiece')
      .ele('IdPce').att('V', (currentIdPce++).toString()).up()
      .ele('TypPce').att('V', '01').up()
      .ele('NatPce').att('V', '01').up()
      .ele('CatPce').att('V', '1').up()
      .ele('DebFact').att('V', getRandomDate()).up()  // Element facultatif pour validation xsd
      .ele('FinFact').att('V', getRandomDate()).up()  // Element facultatif pour validation xsd
      .ele('EtatPce').att('V', '02').up()
      .ele('DtePcePec').att('V', getRandomDate()).up()
    .up();

    const ligneDePiece = piece.ele('LigneDePiece');
    ligneDePiece.ele('BlocLignePiece')
      .ele('InfoLignePiece')
        .ele('IdLigne').att('V', '1').up()
        .ele('ObjLignePce').att('V', getRandomString(50)).up() // Element facultatif pour validation xsd
        .ele('Nature').att('V', getRandomNumber(6)).up()
        .ele('MtTTC').att('V', getRandomNumber(3) + '.' + getRandomNumber(2)).up()
        .ele('CodEtGeo').att('V', getRandomNumber(2)).up() // Element facultatif pour validation xsd
      .up()
    .up();

    for (let k = 0; k < 2; k++) {
      const tiers = ligneDePiece.ele('Tiers')
        .ele('InfoTiers')
          .ele('DteMalade').att('V', getRandomDate()).up() // Element facultatif pour validation xsd
          .ele('RefTiers').att('V', getRandomNumber(12)).up() // Element facultatif pour validation xsd
          .ele('CatTiers').att('V', '01').up()
          .ele('TypTiers').att('V', getRandomTypTiers()).up() // Element facultatif pour validation xsd
          .ele('Civilite').att('V', getRandomString(3)).up() // Element facultatif pour validation xsd
          .ele('Nom').att('V', getRandomString(10)).up()
          .ele('Prenom').att('V', getRandomString(10)).up() // Element facultatif pour validation xsd
        .up()
        .ele('Adresse')
          .ele('Adr1').att('V', getRandomString(20)).up() // Element facultatif pour validation xsd
          .ele('CP').att('V', getRandomNumber(5)).up()
          .ele('Ville').att('V', getRandomString(15)).up()
        .up()
      .up();
    }
  }

  const xmlContent = xml.end({ prettyPrint: true });
  return { nomFic: NomFic, xmlContent, currentIdPce };
}
