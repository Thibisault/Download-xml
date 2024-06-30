<template>
    <!-- Conteneur principal de la vue -->
    <div class="mgmt-global-container">
      <!-- Barre de navigation -->
      <div class="mgmt-nav">
        <!-- Liens de navigation avec NuxtLink -->
        <NuxtLink to="/" :class="{ active: $route.path === '/' }">Hop</NuxtLink>
        <NuxtLink to="/rec">Rec</NuxtLink>
        <NuxtLink to="/rol">Rol</NuxtLink>
      </div>
      <!-- Conteneur principal du contenu -->
      <div class="mgmt-container">
        <!-- Titre principal de la page -->
        <h1 class="mgmt-heading">Créer une facture 'Hop'</h1>
        <!-- Barre de séparation -->
        <hr class="mgmt-divider"/>
        <!-- Formulaire principal -->
        <form @submit.prevent="handleMultipleDownloads" class="mgmt-form">
          <div class="_mgmt-popup-banner">
            <!-- Groupe d'entrée pour IdPost -->
            <div class="mgmt-input-group" @mouseenter="addHighlight" @mouseleave="removeHighlight">
              <label for="IdPost" class="mgmt-label">IdPost</label>
              <input v-model="form.EnTetePES.IdPost" id="IdPost" class="mgmt-input" type="number" />
            </div>
            <!-- Groupe d'entrée pour IdColl -->
            <div class="mgmt-input-group" @mouseenter="addHighlight" @mouseleave="removeHighlight">
              <label for="IdColl" class="mgmt-label">IdColl</label>
              <input v-model="form.EnTetePES.IdColl" id="IdColl" class="mgmt-input" type="number" />
            </div>
            <!-- Groupe d'entrée pour CodCol -->
            <div class="mgmt-input-group" @mouseenter="addHighlight" @mouseleave="removeHighlight">
              <label for="CodCol" class="mgmt-label">CodCol</label>
              <input v-model="form.EnTetePES.CodCol" id="CodCol" class="mgmt-input" type="number" />
            </div>
            <!-- Groupe d'entrée pour MtTTC -->
            <div class="mgmt-input-group" @mouseenter="addHighlight" @mouseleave="removeHighlight">
              <label for="MtTTC" class="mgmt-label">MtTTC</label>
              <input v-model.number="form.Bordereau.Pieces[0].LigneDePiece[0].BlocLignePiece.InfoLignePiece.MtTTC" id="MtTTC" class="mgmt-input" type="number" step="any" />
            </div>
          </div>
          <!-- Bouton pour afficher/masquer les champs supplémentaires -->
          <button type="button" @click="toggleFields" class="mgmt-button toggle">
            {{ showAllFields ? 'Cacher les champs supplémentaires' : 'Montrer les champs supplémentaires' }}
          </button>
          <div v-if="showAllFields">
            <!-- Section Enveloppe - Paramètres -->
            <div class="mgmt-popup-banner mgmt-popup-banner-1">
              <h2>Enveloppe - Paramètres</h2>
              <hr class="mgmt-divider-little"/>
              <!-- Boucle à travers les paramètres de l'enveloppe -->
              <div v-for="(value, key) in form.Enveloppe.Parametres" :key="key" class="mgmt-input-group">
                <label :for="key" class="mgmt-label">
                  {{ key }}
                  <!-- Icône d'information pour NomFic -->
                  <span v-if="key === 'NomFic'" class="info-icon">ℹ️
                    <span class="info-popup">Modifier le numéro 000 pour commencer la génération du nom de fichier à partir de ce numéro</span>
                  </span>
                </label>
                <div class="input-container">
                  <!-- Champs de saisie verrouillables -->
                  <input 
                    v-if="['Version', 'TypFic', 'NomFic'].includes(key)" 
                    v-model="form.Enveloppe.Parametres[key]" 
                    :id="key" 
                    class="mgmt-input-lock" 
                    :class="{ 'disabled-input': disabledFields[key] }" 
                    :disabled="disabledFields[key]" 
                    :type="getInputType(key)"
                    :pattern="getPattern(key) || null"
                    :maxlength="getMaxlength(key) || null"
                  />
                  <!-- Champs de saisie standards (Donc tout les champs qui ne sont pas défini dans les champs de saisie vérrouillable)-->
                  <input 
                    v-else 
                    v-model="form.Enveloppe.Parametres[key]" 
                    :id="key" 
                    class="mgmt-input-lock" 
                    :type="getInputType(key)"
                    :pattern="getPattern(key) || null"
                    :maxlength="getMaxlength(key) || null"
                  />
                  <!-- Bouton pour verrouiller/déverrouiller les champs spécifiques -->
                  <button v-if="['Version', 'TypFic', 'NomFic'].includes(key)" type="button" @click="toggleField(key)" class="toggle-button">
                    <img :src="disabledFields[key] ? lockRed : lockGreen " :alt="disabledFields[key] ? 'Activer' : 'Désactiver'" class="lock-icon"/>
                  </button>
                </div>
              </div>
            </div>
  
            <!-- Section En-tête PES -->
            <div class="mgmt-popup-banner mgmt-popup-banner-2">
              <h2>En-tête PES</h2>
              <hr class="mgmt-divider-little"/>
              <!-- Boucle à travers les champs de l'en-tête PES -->
              <div v-for="(value, key) in form.EnTetePES" :key="key" class="mgmt-input-group">
                <label :for="key" class="mgmt-label">{{ key }}</label>
                <input 
                  v-model="form.EnTetePES[key]" 
                  :id="key" 
                  class="mgmt-input"
                  :type="getInputType(key)"
                  :pattern="getPattern(key) || null"
                  :maxlength="getMaxlength(key) || null"
                />
              </div>
            </div>
  
            <!-- Section Bloc Bordereau -->
            <div class="mgmt-popup-banner mgmt-popup-banner-3">
              <h2>Bloc Bordereau</h2>
              <hr class="mgmt-divider-little"/>
              <!-- Boucle à travers les champs du bloc bordereau -->
              <div v-for="(value, key) in form.Bordereau.BlocBordereau" :key="key" class="mgmt-input-group">
                <label :for="key" class="mgmt-label">
                  {{ key }}
                  <!-- Icône d'information pour NbrePce -->
                  <span v-if="key === 'NbrePce'" class="info-icon">ℹ️
                    <span class="info-popup">Augmenter le nombre de pièces va dupliquer la première pièce</span>
                  </span>
                </label>
                <input 
                  v-model="form.Bordereau.BlocBordereau[key]" 
                  :id="key" 
                  class="mgmt-input"
                  :type="getInputType(key)"
                  :pattern="getPattern(key) || null"
                  :min="getMin(key) || null"
                  :maxlength="getMaxlength(key) || null"
                  @input="handleInputNbrePce($event, key)"
                />
              </div>
            </div>
  
            <!-- Section Pièces -->
            <div class="mgmt-popup-banner mgmt-popup-banner-4">
              <div class="piece-plus-bouton">
                <h2>Pièces</h2>
                <hr class="mgmt-divider"/>
                <!-- Bouton pour afficher/masquer toutes les pièces -->
                <button type="button" @click="togglePieces" class="mgmt-button toggle">
                  {{ showPieces ? 'Cacher toutes les pièces' : 'Montrer toutes les pièces' }}
                </button>
              </div>
              <!-- Groupe d'entrée pour IdPce de la première pièce -->
              <div class="mgmt-input-group">
                <label for="IdPcePiece1" class="mgmt-label">
                  IdPce 
                  <!-- Icône d'information pour IdPce -->
                  <span class="info-icon">ℹ️
                    <span class="info-popup">Modifier l'IdPce de la pièce 1 <br>
                      et incrémenter de +1 <br>
                      les IdPce <br>
                      des pièces suivantes</span>
                  </span>
                </label>
                <div class="input-container">
                  <input 
                    v-model="form.Bordereau.Pieces[0].BlocPiece.IdPce" 
                    id="IdPcePiece1" 
                    class="mgmt-input-lock"
                    :type="getInputType('IdPce')"
                  />
                </div>
              </div>
  
              <div v-if="showPieces">
                <hr class="mgmt-divider"/>
                <!-- Boucle à travers les pièces -->
                <div v-for="(piece, index) in form.Bordereau.Pieces" :key="index" class="piece-container">
                  <div class="piece-title">
                    <h3>Pièce {{ index + 1 }}</h3>
                    <!-- Bouton pour afficher/masquer une pièce spécifique -->
                    <button type="button" @click="togglePiece(index)" class="mgmt-button toggle">
                      {{ showPiece[index] ? 'Cacher' : 'Montrer' }}
                    </button>
                  </div>
                  <div v-if="showPiece[index]">
                    <hr class="mgmt-divider-little"/>
                    <h4>BlocPiece</h4>
                    <hr class="mgmt-divider-little"/>
                    <!-- Boucle à travers les champs du BlocPiece -->
                    <div v-for="(value, key) in piece.BlocPiece" :key="key" class="mgmt-input-group">
                      <label :for="'piece' + index + key" class="mgmt-label">
                        {{ key }}
                        <!-- Icône d'information pour IdPce de la première pièce -->
                        <span v-if="key === 'IdPce' && index === 0" class="info-icon">ℹ️
                          <span class="info-popup"> Modifier cet IdPce va incrémenter de +1 tous les IdPce des pièces suivantes <br>
                            à partir de ce champ</span>
                        </span>
                      </label>
                      <div class="input-container">
                        <input 
                          v-model="piece.BlocPiece[key]" 
                          :id="'piece' + index + key" 
                          class="mgmt-input-lock"
                          :class="{ 'disabled-input': key === 'IdPce' && disabledFields.IdPce[index] }"
                          :disabled="key === 'IdPce' && disabledFields.IdPce[index]"
                          :type="getInputType(key)"
                          :pattern="getPattern(key) || null"
                          :maxlength="getMaxlength(key) || null"
                        />
                        <!-- Bouton pour verrouiller/déverrouiller le champ IdPce des pièces autres que la première -->
                        <button v-if="key === 'IdPce' && index > 0" type="button" @click="togglePieceField(index)" class="toggle-button">
                          <img :src="disabledFields.IdPce[index] ? lockRed : lockGreen" :alt="disabledFields.IdPce[index] ? 'Activer' : 'Désactiver'" class="lock-icon"/>
                        </button>
                      </div>
                    </div>
  
                    <!-- Boucle à travers les lignes de pièce -->
                    <div v-for="(line, lineIndex) in piece.LigneDePiece" :key="lineIndex" class="line">
                      <hr class="mgmt-divider-little"/>
                      <h4>Ligne de Pièce</h4>
                      <hr class="mgmt-divider-little"/>
                      <!-- Boucle à travers les champs InfoLignePiece -->
                      <div v-for="(value, key) in line.BlocLignePiece.InfoLignePiece" :key="key" class="mgmt-input-group">
                        <label :for="'line' + index + key" class="mgmt-label">{{ key }}</label>
                        <input 
                          v-model="line.BlocLignePiece.InfoLignePiece[key]" 
                          :id="'line' + index + key" 
                          class="mgmt-input"
                          :type="getInputType(key)"
                          :pattern="getPattern(key) || null"
                          :maxlength="getMaxlength(key) || null"
                          :step="getStep(key) || null"
                        />
                      </div>
                      
                      <hr class="mgmt-divider-little"/>
                      <h5>Tiers</h5>
                      <hr class="mgmt-divider-little"/>
                      <!-- Boucle à travers les tiers de chaque ligne de pièce -->
                      <div v-for="(tier, tierIndex) in line.Tiers" :key="tierIndex" class="tier">
                        <div v-for="(value, key) in tier.InfoTiers" :key="key" class="mgmt-input-group">
                          <label :for="'tier' + index + key" class="mgmt-label">{{ key }}</label>
                          <div v-if="key === 'Civilite'">
                            <select v-model="tier.InfoTiers[key]" :id="'tier' + index + key" class="mgmt-input">
                              <option value="MME">MME</option>
                              <option value="MR">MR</option>
                            </select>
                          </div>
                          <div v-else>
                            <input 
                              v-model="tier.InfoTiers[key]" 
                              :id="'tier' + index + key" 
                              class="mgmt-input"
                              :type="getInputType(key)"
                              :pattern="getPattern(key) || null"
                              :maxlength="getMaxlength(key) || null"
                            />
                          </div>
                        </div>
                        <!-- Boucle à travers les adresses de chaque tiers -->
                        <div v-for="(value, key) in tier.Adresse" :key="key" class="mgmt-input-group">
                          <label :for="'address' + index + key" class="mgmt-label">{{ key }}</label>
                          <input 
                            v-model="tier.Adresse[key]" 
                            :id="'address' + index + key" 
                            class="mgmt-input"
                            :type="getInputType(key)"
                            :pattern="getPattern(key) || null"  
                            :maxlength="getMaxlength(key) || null"
                          />
                        </div>
                      <hr class="mgmt-divider"/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Bouton pour télécharger -->
          <button type="button" @click="openDownloadPopup" class="mgmt-button create">Télécharger</button>
        </form>
      </div>
  
      <!-- Popup pour le téléchargement multiple -->
      <div v-if="showDownloadPopup" class="download-popup">
        <div class="popup-content">
          <div class="mgmt-popup-banner">
            <h2>Choisissez le nombre de fichiers à télécharger</h2>
            <input type="number" v-model="downloadCount" min="1" class="popup-input" />
            <div class="popup-actions">
              <button @click="handleMultipleDownloads" class="mgmt-button confirm">Télécharger</button>
              <button @click="showDownloadPopup = false" class="mgmt-button cancel">Annuler</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts" setup>
  import xml2js from 'xml2js';
  import { ref, computed, onMounted, watch } from 'vue';
  import JSZip from 'jszip';
  import { saveAs } from 'file-saver';
  import lockRed from '~/assets/lock-red.png';
  import lockGreen from '~/assets/lock-green.png';
  import { constraints } from '~/model/hop-model/hop-contrainte';
  import type { Form } from '~/model/hop-model/hop-data';
  
  const param =  {
        Version: '2',
        TypFic: 'TIPIHOP',
        NomFic: 'TIPIHOP_073037_816_00_2023_000',
      };
      const EnTetePES =  {
      DteStr: '2023-06-14',
      IdPost: '073037',
      LibellePoste: 'CHAMBERY ETS HOSPITALIERS',
      IdColl: '26730006900015',
      FinJur: '730780525',
      CodCol: '816',
      CodBud: '00',
      LibelleColBud: 'CHG BOURG ST MAURICE'
    };
    const blocBordereau = {
        Exer: '2023',
        Banane : 'Banane',
        IdBord: '1000115',
        TypBord: '01',
        NbrePce: 1 
      }; 
    const tiers = [
                {
                  InfoTiers: {
                    DteMalade: '1986-03-28',
                    RefTiers: '170040922304',
                    CatTiers: '01',
                    TypTiers: '01',
                    Civilite: 'MME',
                    Nom: 'HENDRICKX',
                    Prenom: 'STEPHANIE'
                  },
                  Adresse: {
                    Adr1: '17 RUE MARGUERITE YOURCENAR',
                    Adr2: '18 RUE MARGUERITE YOURCENAR',
                    Adr3: '19 RUE MARGUERITE YOURCENAR',
                    CP: '95820',
                    Ville: 'BRUYERES SUR OISE'
                  }
                }
              ]
  // Modèle de données principal pour le formulaire
  const form = ref<Form>({
    Enveloppe: {
      Parametres:param
    },
    EnTetePES:EnTetePES,
    Bordereau: {
      BlocBordereau: blocBordereau,
      Pieces: [
        {
          BlocPiece: {
            IdPce: '2662897',
            TypPce: '01',
            NatPce: '01',
            CatPce: '1',
            DebFact: '2023-03-01',
            FinFact: '2023-03-01',
            EtatPce: '02',
            DtePcePec: '2023-06-13'
          },
          LigneDePiece: [
            {
              BlocLignePiece: { 
                InfoLignePiece: {
                  IdLigne: '1',
                  ObjLignePce: 'SIPHON HENDRICKX SCOTT - Consultation du 01/03/2023',
                  Nature: '732424',
                  MtTTC: '19.61',
                  CodEtGeo: '75' 
                }
              },
              Tiers:tiers
            }
          ]
        }
      ]
    }
  });
  
  
  // État pour afficher/masquer toutes les sections de champs supplémentaires
  const showAllFields = ref(false);
  // État pour afficher/masquer toutes les pièces
  const showPieces = ref(false);
  // État pour afficher/masquer chaque pièce individuellement
  const showPiece = ref([false]);
  
  // États des champs verrouillables
  const disabledFields = ref({
    Version: true,
    TypFic: true,
    NomFic: true,
    IdPce: form.value.Bordereau.Pieces.map((_, index) => index > 0)
  });
  
  // Affichage/Masquage des sections de champs supplémentaires
  const toggleFields = () => {
    showAllFields.value = !showAllFields.value;
    if (showPieces.value) {
      showPieces.value = !showPieces.value;
    }
  };
  
  // Affichage/Masquage de toutes les pièces
  const togglePieces = () => {
    showPieces.value = !showPieces.value;
    if (!showPieces.value) {
      showPiece.value = form.value.Bordereau.Pieces.map(() => false);
    }
  };
  
  // Affichage/Masquage d'une pièce spécifique
  const togglePiece = (index: number) => {
    showPiece.value[index] = !showPiece.value[index];
  };
  
  // Verrouillage/Déverrouillage d'un champ spécifique
  const toggleField = (field: string) => {
    disabledFields.value[field] = !disabledFields.value[field];
  };
  
  // Verrouillage/Déverrouillage du champ IdPce d'une pièce spécifique
  const togglePieceField = (index: number) => {
    disabledFields.value.IdPce[index] = !disabledFields.value.IdPce[index];
  };
  
  // Récupère le type d'entrée pour un champ donné
  const getInputType = (key: string) => {
    return constraints[key] ? constraints[key].type || 'text' : 'text';
  };
  
  // Récupère le pattern pour un champ donné
  const getPattern = (key: string) => {
    return constraints[key] ? constraints[key].pattern || '' : '';
  };
  
  // Récupère la longueur maximale pour un champ donné
  const getMaxlength = (key: string) => {
    return constraints[key] ? constraints[key].maxlength || '' : '';
  };
  
  // Récupère le step pour un champ donné
  const getStep = (key: string) => {
    return constraints[key] ? constraints[key].step || '' : '';
  };
  
  // Récupère la valeur minimale pour un champ donné
  const getMin = (key: string) => {
    return constraints[key] ? constraints[key].min || '' : '';
  };
  
  // Met à jour les IdPce des pièces lorsque le premier IdPce change
  const updatePieceIds = () => {
    form.value.Bordereau.Pieces.forEach((piece, index) => {
      if (index > 0) {
        piece.BlocPiece.IdPce = (
          parseInt(form.value.Bordereau.Pieces[index - 1].BlocPiece.IdPce, 10) + 1
        ).toString();
      }
    });
  };
  
  // Gestion de l'entrée du nombre de pièces
  const handleInputNbrePce = (event: Event, key: string) => {
    if (key === 'NbrePce') {
      let value = (event.target as HTMLInputElement).value;
      if (parseInt(value, 10) < 1) {
        value = '1';
      } else {
        value = value.replace(/[^0-9]/g, '');
      }
  
      (event.target as HTMLInputElement).value = value || '1';
      form.value.Bordereau.BlocBordereau.NbrePce = parseInt(value);
      const n = form.value.Bordereau.BlocBordereau.NbrePce;
      const pieces = form.value.Bordereau.Pieces;
      if (pieces.length < n) {
        for (let i = pieces.length; i < n; i++) {
          const newPiece = JSON.parse(JSON.stringify(pieces[0]));
          newPiece.BlocPiece.IdPce = (
            parseInt(pieces[i - 1].BlocPiece.IdPce, 10) + 1
          ).toString();
          pieces.push(newPiece);
          showPiece.value.push(false);
          disabledFields.value.IdPce.push(true);
        }
      } else {
        pieces.length = n;
        showPiece.value.length = n;
        disabledFields.value.IdPce.length = n;
      }
    }
  };
  
  // Watcher pour mettre à jour les IdPce lorsque le premier IdPce change
  watch(
    () => form.value.Bordereau.Pieces[0].BlocPiece.IdPce,
    () => {
      updatePieceIds();
    }
  );
  
  // Watcher pour mettre à jour le NomFic lorsque les paramètres pertinents changent
  watch(
    () => [
      form.value.Enveloppe.Parametres.TypFic,
      form.value.EnTetePES.IdPost,
      form.value.EnTetePES.CodCol,
      form.value.EnTetePES.CodBud,
      form.value.Bordereau.BlocBordereau.Exer
    ],
    () => {
      updateNomFic();
    }
  );
  
  // État de la popup de téléchargement
  const showDownloadPopup = ref(false);
  // Nombre de fichiers à télécharger
  const downloadCount = ref(1);
  
  // Ouvre la popup de téléchargement
  const openDownloadPopup = () => {
    showDownloadPopup.value = true;
  };
  
  // Génère les données d'une pièce pour le fichier XML
  const generatePieceData = (piece: Piece, index: number) => {
    return {
      BlocPiece: [
        {
          IdPce: [{ $: { V: piece.BlocPiece.IdPce } }],
          TypPce: [{ $: { V: piece.BlocPiece.TypPce } }],
          NatPce: [{ $: { V: piece.BlocPiece.NatPce } }],
          CatPce: [{ $: { V: piece.BlocPiece.CatPce } }],
          DebFact: [{ $: { V: piece.BlocPiece.DebFact } }],
          FinFact: [{ $: { V: piece.BlocPiece.FinFact } }],
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
                MtTTC: [{ $: { V: line.BlocLignePiece.InfoLignePiece.MtTTC } }],
                CodEtGeo: [{ $: { V: line.BlocLignePiece.InfoLignePiece.CodEtGeo } }]
              }
            ]
          }
        ],
        Tiers: line.Tiers.map(tier => ({
          InfoTiers: [
            {
              DteMalade: [{ $: { V: tier.InfoTiers.DteMalade } }],
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
              Adr2: [{ $: { V: tier.Adresse.Adr2 } }],
              Adr3: [{ $: { V: tier.Adresse.Adr3 } }],
              CP: [{ $: { V: tier.Adresse.CP } }],
              Ville: [{ $: { V: tier.Adresse.Ville } }]
            }
          ]
        }))
      }))
    };
  };
  
  // Génère le contenu du fichier texte avec les Id des pièces
  const generateTextFileContent = () => {
    return form.value.Bordereau.Pieces.map((piece, index) => {
      return `Pièce ${index + 1} : ${piece.BlocPiece.IdPce}_${form.value.EnTetePES.CodBud}\n`;
    }).join('\n\n');
  };
  
  // Gestion du téléchargement multiple des fichiers XML
  const handleMultipleDownloads = async () => {
    try {
      const builder = new xml2js.Builder();
      const zip = new JSZip();
  
      let currentCount = parseInt(form.value.Enveloppe.Parametres.NomFic.split('_').pop().split('.').shift(), 10);
  
      for (let i = 0; i < downloadCount.value; i++) {
        const pieces = form.value.Bordereau.Pieces.map(generatePieceData);
  
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
                FinJur: [{ $: { V: form.value.EnTetePES.FinJur } }],
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
                    Piece: pieces
                  }
                ]
              }
            ]
          }
        };
  
        const countString = String(currentCount++).padStart(3, '0');
        const xml = builder.buildObject(data);
        const filename = `${form.value.Enveloppe.Parametres.TypFic}_${form.value.EnTetePES.IdPost}_${form.value.EnTetePES.CodCol}_${form.value.EnTetePES.CodBud}_${form.value.Bordereau.BlocBordereau.Exer}_${countString}.xml`;
        zip.file(filename, xml);
      }
  
      const textContent = generateTextFileContent();
      zip.file('all_code_piece.txt', textContent);
  
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `hop_files_${form.value.Bordereau.BlocBordereau.Exer}_${form.value.Bordereau.Pieces[0].BlocPiece.IdPce}_${form.value.Bordereau.Pieces[0].LigneDePiece[0].BlocLignePiece.InfoLignePiece.IdLigne}.zip`);        
      showDownloadPopup.value = false;
    } catch (error) {
      console.error('Erreur lors de la création du fichier XML:', error);
    }
  };
  
  // Met à jour le NomFic en fonction des autres champs
  function updateNomFic() {
      const { TypFic } = form.value.Enveloppe.Parametres;
      const { IdPost, CodCol, CodBud } = form.value.EnTetePES;
      const { Exer } = form.value.Bordereau.BlocBordereau;
      form.value.Enveloppe.Parametres.NomFic = `${TypFic}_${IdPost}_${CodCol}_${CodBud}_${Exer}_000`;
    };
  // Ajoute la classe de surbrillance
  function addHighlight(event: Event) {
    (event.currentTarget as HTMLElement).classList.add('highlight');
  };
  // Supprime la classe de surbrillance
  function removeHighlight(event: Event) {
    (event.currentTarget as HTMLElement).classList.remove('highlight');
  };
  </script>
  
  <style scoped>
  /* Styles */ /* Dernière mise à jours */
  </style>
  