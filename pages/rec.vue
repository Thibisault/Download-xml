<template>
  <div class="mgmt-global-container">
    <div class="mgmt-container">
      <div class="mgmt-nav">
        <router-link to="/" :class="{ active: $route.path === '/' }">hop</router-link>
        <router-link to="/rec" :class="{ active: $route.path === '/rec' }">rec</router-link>
        <router-link to="/rol">rol</router-link>
      </div>
      <h1 class="mgmt-heading">Gestion des fichiers XML 'Rec'</h1>
      <input type="text" v-model="search" placeholder="Rechercher des fichiers XML..." class="mgmt-search-input"/>
      <hr class="mgmt-divider"/>

      <!-- Formulaire de création -->
      <form v-if="!isEditing" @submit.prevent="handleCreate" class="mgmt-form">
        <h2>Enveloppe - Paramètres</h2>
        <div class="mgmt-input-group">
          <input class="mgmt-input" v-model="form.Enveloppe.Parametres.Version" placeholder="Version" />
          <input class="mgmt-input" v-model="form.Enveloppe.Parametres.TypFic" placeholder="TypFic" />
          <input class="mgmt-input" v-model="form.Enveloppe.Parametres.NomFic" placeholder="NomFic" />
        </div>
        <button type="button" @click="toggleFields" class="mgmt-button toggle">
          {{ showAllFields ? 'Cacher les champs supplémentaires' : 'Montrer les champs supplémentaires' }}
        </button>
        <div v-if="showAllFields">
          <h2>En-tête PES</h2>
          <div v-for="(value, key) in form.EnTetePES" :key="key" class="mgmt-input-group">
            <label :for="key" class="mgmt-label">{{ key }}</label>
            <input v-model="form.EnTetePES[key]" :id="key" class="mgmt-input"/>
          </div>

          <h2>Bloc Bordereau</h2>
          <div v-for="(value, key) in form.Bordereau.BlocBordereau" :key="key" class="mgmt-input-group">
            <label :for="key" class="mgmt-label">{{ key }}</label>
            <input v-model="form.Bordereau.BlocBordereau[key]" :id="key" type="number" class="mgmt-input"/>
          </div>

          <h2>Pièces</h2>
          <div v-for="(piece, index) in form.Bordereau.Pieces" :key="index" class="piece">
            <h3>Pièce {{ index + 1 }}</h3>
            <div v-for="(value, key) in piece.BlocPiece" :key="key" class="mgmt-input-group">
              <label :for="'piece' + index + key" class="mgmt-label">{{ key }}</label>
              <input v-model="piece.BlocPiece[key]" :id="'piece' + index + key" class="mgmt-input"/>
            </div>
            <h4>Ligne de Pièce</h4>
            <div v-for="(line, lineIndex) in piece.LigneDePiece" :key="lineIndex" class="line">
              <div v-for="(value, key) in line.BlocLignePiece.InfoLignePiece" :key="key" class="mgmt-input-group">
                <label :for="'line' + index + key" class="mgmt-label">{{ key }}</label>
                <input v-model="line.BlocLignePiece.InfoLignePiece[key]" :id="'line' + index + key" class="mgmt-input"/>
              </div>
              <h5>Tiers</h5>
              <div v-for="(tier, tierIndex) in line.Tiers" :key="tierIndex" class="tier">
                <div v-for="(value, key) in tier.InfoTiers" :key="key" class="mgmt-input-group">
                  <label :for="'tier' + index + key" class="mgmt-label">{{ key }}</label>
                  <input v-model="tier.InfoTiers[key]" :id="'tier' + index + key" class="mgmt-input"/>
                </div>
                <div v-for="(value, key) in tier.Adresse" :key="key" class="mgmt-input-group">
                  <label :for="'address' + index + key" class="mgmt-label">{{ key }}</label>
                  <input v-model="tier.Adresse[key]" :id="'address' + index + key" class="mgmt-input"/>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button type="submit" class="mgmt-button create">Créer</button>
      </form>
      <hr class="mgmt-divider"/>

      <!-- Liste des fichiers XML existants -->
      <div class="mgmt-user-list">
        <div v-for="file in filteredXmlFiles" :key="file" class="mgmt-user-item">
          <template v-if="isEditing && editingFile === file">
            <!-- Formulaire de mise à jour -->
            <form @submit.prevent="handleUpdate" class="mgmt-form-update">
              <h2>Enveloppe - Paramètres</h2>
              <div class="mgmt-input-group">
                <input class="mgmt-input" v-model="form.Enveloppe.Parametres.Version" placeholder="Version" />
                <input class="mgmt-input" v-model="form.Enveloppe.Parametres.TypFic" placeholder="TypFic" />
                <input class="mgmt-input" v-model="form.Enveloppe.Parametres.NomFic" placeholder="NomFic" />
              </div>
              <button type="button" @click="toggleFields" class="mgmt-button toggle">
                {{ showAllFields ? 'Cacher les champs supplémentaires' : 'Montrer les champs supplémentaires' }}
              </button>
              <div v-if="showAllFields">
                <h2>En-tête PES</h2>
                <div v-for="(value, key) in form.EnTetePES" :key="key" class="mgmt-input-group">
                  <label :for="key" class="mgmt-label">{{ key }}</label>
                  <input v-model="form.EnTetePES[key]" :id="key" class="mgmt-input"/>
                </div>

                <h2>Bloc Bordereau</h2>
                <div v-for="(value, key) in form.Bordereau.BlocBordereau" :key="key" class="mgmt-input-group">
                  <label :for="key" class="mgmt-label">{{ key }}</label>
                  <input v-model="form.Bordereau.BlocBordereau[key]" :id="key" type="number" class="mgmt-input"/>
                </div>

                <h2>Pièces</h2>
                <div v-for="(piece, index) in form.Bordereau.Pieces" :key="index" class="piece">
                  <h3>Pièce {{ index + 1 }}</h3>
                  <div v-for="(value, key) in piece.BlocPiece" :key="key" class="mgmt-input-group">
                    <label :for="'piece' + index + key" class="mgmt-label">{{ key }}</label>
                    <input v-model="piece.BlocPiece[key]" :id="'piece' + index + key" class="mgmt-input"/>
                  </div>
                  <h4>Ligne de Pièce</h4>
                  <div v-for="(line, lineIndex) in piece.LigneDePiece" :key="lineIndex" class="line">
                    <div v-for="(value, key) in line.BlocLignePiece.InfoLignePiece" :key="key" class="mgmt-input-group">
                      <label :for="'line' + index + key" class="mgmt-label">{{ key }}</label>
                      <input v-model="line.BlocLignePiece.InfoLignePiece[key]" :id="'line' + index + key" class="mgmt-input"/>
                    </div>
                    <h5>Tiers</h5>
                    <div v-for="(tier, tierIndex) in line.Tiers" :key="tierIndex" class="tier">
                      <div v-for="(value, key) in tier.InfoTiers" :key="key" class="mgmt-input-group">
                        <label :for="'tier' + index + key" class="mgmt-label">{{ key }}</label>
                        <input v-model="tier.InfoTiers[key]" :id="'tier' + index + key" class="mgmt-input"/>
                      </div>
                      <div v-for="(value, key) in tier.Adresse" :key="key" class="mgmt-input-group">
                        <label :for="'address' + index + key" class="mgmt-label">{{ key }}</label>
                        <input v-model="tier.Adresse[key]" :id="'address' + index + key" class="mgmt-input"/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button type="submit" class="mgmt-button update">Mettre à jour</button>
              <button @click="cancelUpdate" class="mgmt-form-update-cancel">Annuler</button>
            </form>
          </template>
          <template v-else>
            <p>{{ file }}</p>
            <div class="mgmt-actions">
              <button @click="editFile(file)" class="mgmt-button edit">Editer</button>
              <button @click="deleteFile(file)" class="mgmt-button delete">Supprimer</button>
              <button @click="downloadFile(file)" class="mgmt-button download">Télécharger</button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import xml2js from 'xml2js';

export default {
  setup() {
    const form = ref({
      Enveloppe: {
        Parametres: {
          Version: '2',
          TypFic: 'TIPIREC',
          NomFic: 'TIPIREC_076029_638_00_2023_167.xml'
        }
      },
      EnTetePES: {
        DteStr: '2023-06-19',
        IdPost: '076029',
        LibellePoste: 'MONTVILLE',
        IdColl: '21760136800012',
        CodCol: '638',
        CodBud: '00',
        LibelleColBud: 'BRACHY'
      },
      Bordereau: {
        BlocBordereau: {
          Exer: '2023',
          IdBord: '30',
          TypBord: '01',
          NbrePce: 1 
        },
        Pieces: [
          {
            BlocPiece: {
              IdPce: '259',
              TypPce: '01',
              NatPce: '01',
              CatPce: '1',
              EtatPce: '02',
              DtePcePec: '2023-06-16'
            },
            LigneDePiece: [
              {
                BlocLignePiece: {
                  InfoLignePiece: {
                    IdLigne: '1',
                    ObjLignePce: 'Objet',
                    Nature: '752',
                    MtTTC: '481.69'
                  }
                },
                Tiers: [
                  {
                    InfoTiers: {
                      RefTiers: '310104426498',
                      CatTiers: '01',
                      TypTiers: '01',
                      Civilite: 'MME',
                      Nom: 'COINTRE',
                      Prenom: 'CINDY'
                    },
                    Adresse: {
                      Adr1: '53 ROUTE DE LA MER',
                      CP: '76730',
                      Ville: 'BRACHY'
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    });
    const xmlFiles = ref([]);
    const isEditing = ref(false);
    const editingFile = ref('');
    const showAllFields = ref(false);
    const search = ref('');

    const loadXmlFiles = async () => {
      try {
        const response = await fetch('/api/list', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ filename: 'rec' })
        });

        if (!response.ok) throw new Error('Erreur lors du chargement des fichiers XML');
        const data = await response.json();
        xmlFiles.value = data.files;
      } catch (error) {
        console.error(error);
      }
    };

    onMounted(loadXmlFiles);

    const filteredXmlFiles = computed(() => {
      return xmlFiles.value.filter(file =>
        file.toLowerCase().includes(search.value.toLowerCase())
      );
    });

    const handleCreate = async () => {
      try {
        const builder = new xml2js.Builder();
        const pieces = Array.from({ length: form.value.Bordereau.BlocBordereau.NbrePce }, () => form.value.Bordereau.Pieces[0]);
        const data = {
          'n:PES_Retour': {
            $: {
              'xmlns:n': 'http://www.minefi.gouv.fr/cp/helios/pes_v2/Rev0/retour',
              'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
              'xsi:schemaLocation': 'http://www.minefi.gouv.fr/cp/helios/pes_v2/Rev0/retour /opt/tx5115/users/ediprod/messages/XML/PES_V2/Externe/Schemas_PES/PES_V2/Rev0/PES_V2_TIPI_RECETTE_Autonome.xsd'
            },
            Enveloppe: {
              Parametres: [
                {
                  Version: [{ $: { V: form.value.Enveloppe.Parametres.Version } }],
                  TypFic: [{ $: { V: form.value.Enveloppe.Parametres.TypFic } }],
                  NomFic: [{ $: { V: form.value.Enveloppe.Parametres.NomFic } }]
                }
              ]
            },
            EnTetePES: [
              {
                DteStr: [{ $: { V: form.value.EnTetePES.DteStr } }],
                IdPost: [{ $: { V: form.value.EnTetePES.IdPost } }],
                LibellePoste: [{ $: { V: form.value.EnTetePES.LibellePoste } }],
                IdColl: [{ $: { V: form.value.EnTetePES.IdColl } }],
                CodCol: [{ $: { V: form.value.EnTetePES.CodCol } }],
                CodBud: [{ $: { V: form.value.EnTetePES.CodBud } }],
                LibelleColBud: [{ $: { V: form.value.EnTetePES.LibelleColBud } }]
              }
            ],
            PES_TIPI_Recette: [
              {
                Bordereau: [
                  {
                    BlocBordereau: [
                      {
                        Exer: [{ $: { V: form.value.Bordereau.BlocBordereau.Exer } }],
                        IdBord: [{ $: { V: form.value.Bordereau.BlocBordereau.IdBord } }],
                        TypBord: [{ $: { V: form.value.Bordereau.BlocBordereau.TypBord } }],
                        NbrePce: [{ $: { V: form.value.Bordereau.BlocBordereau.NbrePce } }]
                      }
                    ],
                    Piece: pieces.map(piece => ({
                      BlocPiece: [
                        {
                          IdPce: [{ $: { V: piece.BlocPiece.IdPce } }],
                          TypPce: [{ $: { V: piece.BlocPiece.TypPce } }],
                          NatPce: [{ $: { V: piece.BlocPiece.NatPce } }],
                          CatPce: [{ $: { V: piece.BlocPiece.CatPce } }],
                          EtatPce: [{ $: { V: piece.BlocPiece.EtatPce } }],
                          DtePcePec: [{ $: { V: piece.BlocPiece.DtePcePec } }]
                        }
                      ],
                      LigneDePiece: piece.LigneDePiece.map(line => ({
                        BlocLignePiece: [
                          {
                            InfoLignePiece: [
                              {
                                IdLigne: [{ $: { V: line.BlocLignePiece.InfoLignePiece.IdLigne } }],
                                ObjLignePce: [{ $: { V: line.BlocLignePiece.InfoLignePiece.ObjLignePce } }],
                                Nature: [{ $: { V: line.BlocLignePiece.InfoLignePiece.Nature } }],
                                MtTTC: [{ $: { V: line.BlocLignePiece.InfoLignePiece.MtTTC } }]
                              }
                            ]
                          }
                        ],
                        Tiers: line.Tiers.map(tier => ({
                          InfoTiers: [
                            {
                              RefTiers: [{ $: { V: tier.InfoTiers.RefTiers } }],
                              CatTiers: [{ $: { V: tier.InfoTiers.CatTiers } }],
                              TypTiers: [{ $: { V: tier.InfoTiers.TypTiers } }],
                              Civilite: [{ $: { V: tier.InfoTiers.Civilite } }],
                              Nom: [{ $: { V: tier.InfoTiers.Nom } }],
                              Prenom: [{ $: { V: tier.InfoTiers.Prenom } }]
                            }
                          ],
                          Adresse: [
                            {
                              Adr1: [{ $: { V: tier.Adresse.Adr1 } }],
                              CP: [{ $: { V: tier.Adresse.CP } }],
                              Ville: [{ $: { V: tier.Adresse.Ville } }]
                            }
                          ]
                        }))
                      }))
                    }))
                  }
                ]
              }
            ]
          }
        };

        await fetch('/api/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ filename: `rec_${Date.now()}`, data })
        });

        loadXmlFiles();
        cancelUpdate();
      } catch (error) {
        console.error('Erreur lors de la création du fichier XML:', error);
      }
    };

    const editFile = async (filename) => {
      try {
        const response = await fetch(`/api/read/${filename}`);
        if (!response.ok) throw new Error('Erreur lors de la récupération du fichier XML');
        const data = await response.json();
        const jsonData = await xml2js.parseStringPromise(data.data);

        form.value = {
          Enveloppe: {
            Parametres: {
              Version: jsonData['n:PES_Retour'].Enveloppe[0].Parametres[0].Version[0].$.V,
              TypFic: jsonData['n:PES_Retour'].Enveloppe[0].Parametres[0].TypFic[0].$.V,
              NomFic: jsonData['n:PES_Retour'].Enveloppe[0].Parametres[0].NomFic[0].$.V
            }
          },
          EnTetePES: {
            DteStr: jsonData['n:PES_Retour'].EnTetePES[0].DteStr[0].$.V,
            IdPost: jsonData['n:PES_Retour'].EnTetePES[0].IdPost[0].$.V,
            LibellePoste: jsonData['n:PES_Retour'].EnTetePES[0].LibellePoste[0].$.V,
            IdColl: jsonData['n:PES_Retour'].EnTetePES[0].IdColl[0].$.V,
            CodCol: jsonData['n:PES_Retour'].EnTetePES[0].CodCol[0].$.V,
            CodBud: jsonData['n:PES_Retour'].EnTetePES[0].CodBud[0].$.V,
            LibelleColBud: jsonData['n:PES_Retour'].EnTetePES[0].LibelleColBud[0].$.V
          },
          Bordereau: {
            BlocBordereau: {
              Exer: jsonData['n:PES_Retour'].PES_TIPI_Recette[0].Bordereau[0].BlocBordereau[0].Exer[0].$.V,
              IdBord: jsonData['n:PES_Retour'].PES_TIPI_Recette[0].Bordereau[0].BlocBordereau[0].IdBord[0].$.V,
              TypBord: jsonData['n:PES_Retour'].PES_TIPI_Recette[0].Bordereau[0].BlocBordereau[0].TypBord[0].$.V,
              NbrePce: Number(jsonData['n:PES_Retour'].PES_TIPI_Recette[0].Bordereau[0].BlocBordereau[0].NbrePce[0].$.V)
            },
            Pieces: jsonData['n:PES_Retour'].PES_TIPI_Recette[0].Bordereau[0].Piece.map(piece => ({
              BlocPiece: {
                IdPce: piece.BlocPiece[0].IdPce[0].$.V,
                TypPce: piece.BlocPiece[0].TypPce[0].$.V,
                NatPce: piece.BlocPiece[0].NatPce[0].$.V,
                CatPce: piece.BlocPiece[0].CatPce[0].$.V,
                EtatPce: piece.BlocPiece[0].EtatPce[0].$.V,
                DtePcePec: piece.BlocPiece[0].DtePcePec[0].$.V
              },
              LigneDePiece: piece.LigneDePiece.map(line => ({
                BlocLignePiece: {
                  InfoLignePiece: {
                    IdLigne: line.BlocLignePiece[0].InfoLignePiece[0].IdLigne[0].$.V,
                    ObjLignePce: line.BlocLignePiece[0].InfoLignePiece[0].ObjLignePce[0].$.V,
                    Nature: line.BlocLignePiece[0].InfoLignePiece[0].Nature[0].$.V,
                    MtTTC: line.BlocLignePiece[0].InfoLignePiece[0].MtTTC[0].$.V
                  }
                },
                Tiers: line.Tiers.map(tier => ({
                  InfoTiers: {
                    RefTiers: tier.InfoTiers[0].RefTiers[0].$.V,
                    CatTiers: tier.InfoTiers[0].CatTiers[0].$.V,
                    TypTiers: tier.InfoTiers[0].TypTiers[0].$.V,
                    Civilite: tier.InfoTiers[0].Civilite[0].$.V,
                    Nom: tier.InfoTiers[0].Nom[0].$.V,
                    Prenom: tier.InfoTiers[0].Prenom[0].$.V
                  },
                  Adresse: {
                    Adr1: tier.Adresse[0].Adr1[0].$.V,
                    CP: tier.Adresse[0].CP[0].$.V,
                    Ville: tier.Adresse[0].Ville[0].$.V
                  }
                }))
              }))
            }))
          }
        };

        isEditing.value = true;
        editingFile.value = filename;
      } catch (error) {
        console.error('Erreur lors de l\'édition du fichier XML:', error);
      }
    };

    const handleUpdate = async () => {
      try {
        const updatedFields = {
          'n:PES_Retour': {
            Enveloppe: {
              Parametres: [
                {
                  Version: [{ $: { V: form.value.Enveloppe.Parametres.Version } }],
                  TypFic: [{ $: { V: form.value.Enveloppe.Parametres.TypFic } }],
                  NomFic: [{ $: { V: form.value.Enveloppe.Parametres.NomFic } }]
                }
              ]
            },
            EnTetePES: [
              {
                DteStr: [{ $: { V: form.value.EnTetePES.DteStr } }],
                IdPost: [{ $: { V: form.value.EnTetePES.IdPost } }],
                LibellePoste: [{ $: { V: form.value.EnTetePES.LibellePoste } }],
                IdColl: [{ $: { V: form.value.EnTetePES.IdColl } }],
                CodCol: [{ $: { V: form.value.EnTetePES.CodCol } }],
                CodBud: [{ $: { V: form.value.EnTetePES.CodBud } }],
                LibelleColBud: [{ $: { V: form.value.EnTetePES.LibelleColBud } }]
              }
            ],
            PES_TIPI_Recette: [
              {
                Bordereau: [
                  {
                    BlocBordereau: [
                      {
                        Exer: [{ $: { V: form.value.Bordereau.BlocBordereau.Exer } }],
                        IdBord: [{ $: { V: form.value.Bordereau.BlocBordereau.IdBord } }],
                        TypBord: [{ $: { V: form.value.Bordereau.BlocBordereau.TypBord } }],
                        NbrePce: [{ $: { V: form.value.Bordereau.BlocBordereau.NbrePce } }]
                      }
                    ],
                    Piece: form.value.Bordereau.Pieces.map(piece => ({
                      BlocPiece: [
                        {
                          IdPce: [{ $: { V: piece.BlocPiece.IdPce } }],
                          TypPce: [{ $: { V: piece.BlocPiece.TypPce } }],
                          NatPce: [{ $: { V: piece.BlocPiece.NatPce } }],
                          CatPce: [{ $: { V: piece.BlocPiece.CatPce } }],
                          EtatPce: [{ $: { V: piece.BlocPiece.EtatPce } }],
                          DtePcePec: [{ $: { V: piece.BlocPiece.DtePcePec } }]
                        }
                      ],
                      LigneDePiece: piece.LigneDePiece.map(line => ({
                        BlocLignePiece: [
                          {
                            InfoLignePiece: [
                              {
                                IdLigne: [{ $: { V: line.BlocLignePiece.InfoLignePiece.IdLigne } }],
                                ObjLignePce: [{ $: { V: line.BlocLignePiece.InfoLignePiece.ObjLignePce } }],
                                Nature: [{ $: { V: line.BlocLignePiece.InfoLignePiece.Nature } }],
                                MtTTC: [{ $: { V: line.BlocLignePiece.InfoLignePiece.MtTTC } }]
                              }
                            ]
                          }
                        ],
                        Tiers: line.Tiers.map(tier => ({
                          InfoTiers: [
                            {
                              RefTiers: [{ $: { V: tier.InfoTiers.RefTiers } }],
                              CatTiers: [{ $: { V: tier.InfoTiers.CatTiers } }],
                              TypTiers: [{ $: { V: tier.InfoTiers.TypTiers } }],
                              Civilite: [{ $: { V: tier.InfoTiers.Civilite } }],
                              Nom: [{ $: { V: tier.InfoTiers.Nom } }],
                              Prenom: [{ $: { V: tier.InfoTiers.Prenom } }]
                            }
                          ],
                          Adresse: [
                            {
                              Adr1: [{ $: { V: tier.Adresse.Adr1 } }],
                              CP: [{ $: { V: tier.Adresse.CP } }],
                              Ville: [{ $: { V: tier.Adresse.Ville } }]
                            }
                          ]
                        }))
                      }))
                    }))
                  }
                ]
              }
            ]
          }
        };

        await fetch('/api/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ filename: editingFile.value, data: updatedFields })
        });

        loadXmlFiles();
        isEditing.value = false;
        cancelUpdate();
      } catch (error) {
        console.error('Erreur lors de la mise à jour du fichier XML:', error);
      }
    };

    const deleteFile = async (filename) => {
      try {
        await fetch(`/api/delete/${filename}`, { method: 'DELETE' });
        loadXmlFiles();
      } catch (error) {
        console.error('Erreur lors de la suppression du fichier XML:', error);
      }
    };

    const downloadFile = async (filename) => {
      try {
        const response = await fetch(`/api/download/${filename}`);
        if (!response.ok) throw new Error('Erreur lors du téléchargement du fichier XML');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${filename}.xml`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        console.error('Erreur lors du téléchargement du fichier XML:', error);
      }
    };

    const toggleFields = () => {
      showAllFields.value = !showAllFields.value;
    };

    const cancelUpdate = () => {
      isEditing.value = false;
      editingFile.value = '';
      form.value = {
        Enveloppe: {
          Parametres: {
            Version: '2',
            TypFic: 'TIPIREC',
            NomFic: 'TIPIREC_076029_638_00_2023_167.xml'
          }
        },
        EnTetePES: {
          DteStr: '2023-06-19',
          IdPost: '076029',
          LibellePoste: 'MONTVILLE',
          IdColl: '21760136800012',
          CodCol: '638',
          CodBud: '00',
          LibelleColBud: 'BRACHY'
        },
        Bordereau: {
          BlocBordereau: {
            Exer: '2023',
            IdBord: '30',
            TypBord: '01',
            NbrePce: 1 
          },
          Pieces: [
            {
              BlocPiece: {
                IdPce: '259',
                TypPce: '01',
                NatPce: '01',
                CatPce: '1',
                EtatPce: '02',
                DtePcePec: '2023-06-16'
              },
              LigneDePiece: [
                {
                  BlocLignePiece: {
                    InfoLignePiece: {
                      IdLigne: '1',
                      ObjLignePce: 'Objet',
                      Nature: '752',
                      MtTTC: '481.69'
                    }
                  },
                  Tiers: [
                    {
                      InfoTiers: {
                        RefTiers: '310104426498',
                        CatTiers: '01',
                        TypTiers: '01',
                        Civilite: 'MME',
                        Nom: 'COINTRE',
                        Prenom: 'CINDY'
                      },
                      Adresse: {
                        Adr1: '53 ROUTE DE LA MER',
                        CP: '76730',
                        Ville: 'BRACHY'
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      };
      if(showAllFields.value == true){
          toggleFields();
        }
    };

    return {
      form,
      xmlFiles,
      isEditing,
      editingFile,
      showAllFields,
      search,
      loadXmlFiles,
      handleCreate,
      editFile,
      handleUpdate,
      deleteFile,
      downloadFile,
      toggleFields,
      cancelUpdate,
      filteredXmlFiles
    };
  }
};
</script>
