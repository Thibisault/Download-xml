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

export function generateXML(IdPost: string, CodCol: string, idPceStart: number, fileCounter: number): { nomFic: string, xmlContent: string, currentIdPce: number } {
  const nbrePce = Math.floor(Math.random() * 99) + 1;
  let currentIdPce = idPceStart;

  const TypFic = 'TIPIHOP';
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
  .att('xsi:schemaLocation', 'http://www.minefi.gouv.fr/cp/helios/pes_v2/Rev0/retour /opt/tx5115/users/ediprod/messages/XML/PES_V2/Externe/Schemas_PES/PES_V2/Rev0/PES_V2_TIPI_RECETTE_Autonome.xsd')
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
    .ele('LibellePoste', { V: 'CHAMBERY ETS HOSPITALIERS' }).up()
    .ele('IdColl', { V: getRandomNumber(14) }).up()
    .ele('FinJur', { V: getRandomNumber(9) }).up()
    .ele('CodCol', { V: CodCol }).up()
    .ele('CodBud', { V: '00' }).up()
    .ele('LibelleColBud', { V: 'CHG BOURG ST MAURICE' }).up()
  .up()
  .ele('PES_TIPI_Recette')
    .ele('Bordereau')
      .ele('BlocBordereau')
        .ele('Exer', { V: Exer }).up()
        .ele('IdBord', { V: getRandomNumber(7) }).up()
        .ele('TypBord', { V: '01' }).up()
        .ele('NbrePce', { V: nbrePce.toString() }).up()
      .up();

  for (let i = 0; i < nbrePce; i++) {
    const piece = xml.ele('Piece');
    const blocPiece = piece.ele('BlocPiece')
      .ele('IdPce', { V: (currentIdPce++).toString() }).up()
      .ele('TypPce', { V: '01' }).up()
      .ele('NatPce', { V: '01' }).up()
      .ele('CatPce', { V: '1' }).up()
      .ele('DebFact', { V: getRandomDate() }).up()
      .ele('FinFact', { V: getRandomDate() }).up()
      .ele('EtatPce', { V: '02' }).up()
      .ele('DtePcePec', { V: getRandomDate() }).up()
    .up();

    const ligneDePiece = piece.ele('LigneDePiece');
    const blocLignePiece = ligneDePiece.ele('BlocLignePiece')
      .ele('InfoLignePiece')
        .ele('IdLigne', { V: '1' }).up()
        .ele('ObjLignePce', { V: getRandomString(50) }).up()
        .ele('Nature', { V: getRandomNumber(6) }).up()
        .ele('MtTTC', { V: getRandomNumber(3) + '.' + getRandomNumber(2) }).up()
        .ele('CodEtGeo', { V: getRandomNumber(2) }).up()
      .up()
    .up();

    for (let k = 0; k < 2; k++) {
      const tiers = ligneDePiece.ele('Tiers')
        .ele('InfoTiers')
          .ele('DteMalade', { V: getRandomDate() }).up()
          .ele('RefTiers', { V: getRandomNumber(12) }).up()
          .ele('CatTiers', { V: '01' }).up()
          .ele('TypTiers', { V: getRandomNumber(2) }).up()
          .ele('Civilite', { V: getRandomString(3) }).up()
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
  }

  const xmlContent = xml.end({ pretty: true });
  return { nomFic: NomFic, xmlContent, currentIdPce }; 
}
