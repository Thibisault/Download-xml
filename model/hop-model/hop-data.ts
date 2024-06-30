//path : model/hop-model/hop-data.ts
export interface Parametres {
    Version: string;
    TypFic: string;
    NomFic: string;
    Banane: string;
  }
  
  export interface Enveloppe {
    Parametres: Parametres;
  }
  
  export interface EnTetePES {
    DteStr: string;
    IdPost: string;
    LibellePoste: string;
    IdColl: string;
    FinJur: string;
    CodCol: string;
    CodBud: string;
    LibelleColBud: string;
  }
  
  export interface BlocBordereau {
    Exer: string;
    IdBord: string;
    TypBord: string;
    NbrePce: number;
  }
  

  
  export interface InfoLignePiece {
    IdLigne: string;
    ObjLignePce: string;
    Nature: string;
    MtTTC: string;
    CodEtGeo: string;
  }

  export interface Adresse {
    Adr1: string;
    Adr2: string;
    Adr3: string;
    CP: string;
    Ville: string;
  }
  
  export interface InfoTiers {
    DteMalade: string;
    RefTiers: string;
    CatTiers: string;
    TypTiers: string;
    Civilite: string;
    Nom: string;
    Prenom: string;
  }

  export interface Tiers {
    InfoTiers: InfoTiers;
    Adresse: Adresse;
  }
  
  export interface LigneDePiece {
    Tiers : Tiers;
    BlocLignePiece: {
      InfoLignePiece: InfoLignePiece;
    };
  }
  
  export interface BlocPiece {
    IdPce: string;
    TypPce: string;
    NatPce: string;
    CatPce: string;
    DebFact: string;
    FinFact: string;
    EtatPce: string;
    DtePcePec: string;
  }

  export interface Piece {
    BlocPiece: BlocPiece;
    LigneDePiece: LigneDePiece[];
  }
  
  export interface Bordereau {
    BlocBordereau: BlocBordereau;
    Pieces: Piece[];
  }
  
  export interface Form {
    Enveloppe: Enveloppe;
    EnTetePES: EnTetePES;
    Bordereau: Bordereau;
  }
  