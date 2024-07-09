<template>
  <div class="container">
    <!-- Affichage de la page de base, elle contient les boutons de téléchargement et l'affichage des erreurs  -->
    <div v-if="showBasePage" class="main-content">
      <h1 class="heading">Télécharger Factures</h1>
      <hr class="divider"/>
      
         <!-- Affiche les messages d'erreurs sur la page de base -->
         <div v-if="alertMessages.length > 0 || alertRecapMessage" class="alert">
        <div v-if="alertRecapMessage">
          <p>{{ alertRecapMessage }}</p>
        </div>
        <div v-if="alertMessages.length > 0">
          <h2>Attention</h2>
          <div v-for="message in alertMessages" :key="message">
            <p>{{ message }}</p>
          </div>
        </div>
        <button @click="alertMessages = []; alertRecapMessage = ''" class="btn btn-confirm">OK</button>
      </div>

      <!-- Affiche les deux boutons de téléchargement sur la page de base -->
      <div class="button-container">
        <button @click="toggleShowDownloadPopup" class="btn btn-download">Télécharger Factures</button>
        <button @click="toggleShowTypeSelectionPopup" class="btn btn-customize">Personnalisation de la Facture</button>
      </div>
    </div>
<!-- ---------------------------------------------------------------------- -->

    <!-- Popup apparaissant après avoir cliqué sur le bouton 'Télécharger Factures' sur la page de base
    Cette popup sert à choisir le nombre de idPost et le nombre de codCol par idPost puis de télécharger ces factures -->
    <div v-if="showDownloadPopup" class="modal" ref="downloadPopup">
      <div class="modal-content">
        <img src="assets/back.png" @click="closeDownloadPopup" class="back-icon" />
        <h2>Choisissez les paramètres de téléchargement</h2> <br>
        <div class="input-group">
          <div>
            <input type="radio" id="hop" name="radio" v-model="selectedType" value="hop">
            <label for="hop">Hop</label>
          </div>
          <div>
            <input type="radio" id="rol" name="radio" v-model="selectedType" value="rol">
            <label for="rol">Rol</label>
          </div>
          <div>
            <input type="radio" id="rec" name="radio" v-model="selectedType" value="rec">
            <label for="rec">Rec</label>
          </div>
        </div>
        <div class="input-group">
          <label for="numIdPost">Nombre de poste comptable</label>
          <input id="numIdPost" v-model.number="numIdPost" type="number" min="1" class="input" />
        </div>
        <div class="input-group">
          <label for="numFilesPerIdPost">Nombre de factures par poste comptable</label>
          <input id="numFilesPerIdPost" v-model.number="numFilesPerIdPost" type="number" min="1" class="input" />
        </div>
        <div v-if="errorMessage" class="error-message">
          <p>{{ errorMessage }}</p>
        </div>
        <div class="actions">
          <button @click="downloadFiles" class="btn btn-confirm">Télécharger</button>
        </div>
      </div>
    </div>
<!-- ---------------------------------------------------------------------- -->

    <!-- Permet de sélectionner le type de facture et arriver sur le pop-up de saisie manuelle des postes comptables après sélection 
     Cette popup apparaît après avoir cliqué sur le bouton 'Personnalisation de la Facture' sur la page de base -->
    <div v-if="showTypeSelectionPopup" class="modal" ref="typeSelectionPopup">
      <div class="modal-content">
        <img src="assets/back.png" @click="closeTypeSelectionPopup" class="back-icon" />
        <h2>Choisir type facture</h2>
        <div class="input-group">
          <button @click="selectTypeAndContinue('hop')" class="btn btn-type">Hop</button>
          <button @click="selectTypeAndContinue('rol')" class="btn btn-type">Rol</button>
          <button @click="selectTypeAndContinue('rec')" class="btn btn-type">Rec</button>
        </div>
      </div>
    </div>
<!-- ---------------------------------------------------------------------- -->

    <!-- popup apparait après avoir choisi le type de facture et permet de saisir manuellement les postes comptables puis de choisir le nombre de factures à télécharger par postComptable
    Puis permet de télécharger la sélection personnalisée -->
    <div v-if="showCustomizePopup" class="modal" ref="customizePopup">
      <div class="modal-content">
        <img src="assets/back.png" @click="closeCustomizePopup" class="back-icon" />
        <h2>{{ customizeTitle }}</h2>
        <div class="popup-layout">
          <div>
            <div class="input-group">
              <label for="postComptable">Saisissez poste comptable</label>
              <input id="postComptable" v-model="postComptable" @input="validatePostComptable" autocomplete="off" type="text" list="data" class="input" :class="{'valid': isPostComptableValid, 'invalid': !isPostComptableValid}" />
              <datalist id="data">
                <option v-for="item in filteredMockData" :key="item.IdPost" :value="item.IdPost" />
              </datalist>
            </div>
            <div class="actions">
              <button @click="addPostComptable" :disabled="!isPostComptableValid" class="btn btn-confirm">Ajouter</button>
            </div>
          </div>
          <div class="added-posts" v-if="addedPostComptables.length > 0">
            <h3>Postes comptables</h3>
            <ul class="added-posts-list">
              <li v-for="post in addedPostComptables" :key="post" class="added-post-item">
                {{ post }}
                <img src="assets/clear.png" @click="removePostComptable(post)" class="remove-icon" />
              </li>
            </ul>
          </div>
        </div>
        <hr class="divider" />
        <div class="input-group" v-if="showHalfCustomizePopup">
          <label for="numFilesPerIdPost">Nombre de factures par poste comptable</label>
          <input id="numFilesPerIdPost" v-model.number="numFilesPerIdPost" type="number" min="1" class="input" />
        </div>
        <div class="actions">
          <button @click="downloadFiles" :disabled="addedPostComptables.length === 0" class="btn btn-confirm" v-if="showHalfCustomizePopup">Télécharger</button>
        </div>
      </div>
    </div>
  </div>
</template>
<!-- ---------------------------------------------------------------------- -->

<script setup>

const showBasePage = ref(true); // Référence pour montrer ou cacher la page de base
const showDownloadPopup = ref(false); // Référence pour montrer ou cacher le pop-up de téléchargement 
const showHalfCustomizePopup = ref(false); // Référence pour montrer ou cacher la partie de la popup de saisie manuelle des postes comptables 
const showCustomizePopup = ref(false); // Référence pour montrer ou cacher le pop-up de saisie manuelle des postes comptables 
const showNumberOfFilesPopup = ref(false); // Référence pour montrer ou cacher le pop-up de sélection du nombre de factures par idPost
const showTypeSelectionPopup = ref(false); // Référence pour montrer ou cacher le pop-up de sélection du type de facture
const numIdPost = ref(1); // Nombre d'idPost
const numFilesPerIdPost = ref(1); // Nombre de factures par idPost
const alertMessages = ref([]); // Messages d'alerte pour les idPost et codCol
const alertRecapMessage = ref(''); // Message d'alerte pour le récapitulatif
const postComptable = ref(''); // Poste comptable saisi manuellement
const addedPostComptables = ref([]); // Liste des postes comptables ajoutés
const isPostComptableValid = ref(false); // Vérifie si le poste comptable saisi est valide
const downloadPopup = ref(null); // Référence pour le pop-up de téléchargement
const customizePopup = ref(null); // Référence pour le pop-up de saisie manuelle des postes comptables
const typeSelectionPopup = ref(null); // Référence pour le pop-up de sélection du type de facture
const selectedType = ref(''); // Variable pour stocker le type de facture sélectionné
const errorMessage = ref(''); // Variable pour stocker le message d'erreur
const mockDataCache = ref([]); // Cache pour les données récupérées de l'API


const loadMockData = async (type) => { // Fonction pour charger les postes comptables (idPost) en fonction du type de facture sélectionné (Utilisé pour la facture personnalisée)
  try {
    const response = await fetch(`/api/getIdPostsByType?type=${type}`);
    if (!response.ok) {
      throw new Error('La réponse du réseau n\'était pas correcte');
    } 
    mockDataCache.value = await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
  }
};

const validatePostComptable = () => { // Vérifie si le poste comptable saisi est valide (et donc présent dans la liste récupérée de la base de données) (Utilisé pour la facture personnalisée)
  isPostComptableValid.value = mockDataCache.value.some(item => item.IdPost === postComptable.value) && !addedPostComptables.value.includes(postComptable.value);
};

const filteredMockData = computed(() => { // Filtre les données pour afficher uniquement les postes comptables non ajoutés dans la liste des suggestions (Utilisé pour la facture personnalisée).
  return mockDataCache.value.filter(item => !addedPostComptables.value.includes(item.IdPost));
});

const addPostComptable = () => { // Fonction pour ajouter un poste comptable à la liste des postes ajoutés (Utilisé pour la facture personnalisée)
  if (isPostComptableValid.value) {
    addedPostComptables.value.push(postComptable.value);
    postComptable.value = '';
    isPostComptableValid.value = false;
    if (!showHalfCustomizePopup.value) {
      showHalfCustomizePopup.value = true;
    }
  }
};

const removePostComptable = (post) => { // Fonction pour supprimer un poste comptable de la liste des postes ajoutés (Utilisé pour la facture personnalisée)
  addedPostComptables.value = addedPostComptables.value.filter(item => item !== post);
  if (addedPostComptables.value.length < 1) {
    showHalfCustomizePopup.value = false;
  }
  validatePostComptable(); 
};

const resetCustomization = () => { // Réinitialise les valeurs des variables utilisées pour la facture personnalisée (Réinitialise la liste des postes ajoutés, et le nombre de factures par idPosts) (Factures personnalisées)
  addedPostComptables.value = [];
  postComptable.value = '';
  isPostComptableValid.value = false;
  showHalfCustomizePopup.value = false;
};

const toggleShowDownloadPopup = () => {
  errorMessage.value = ''; // Réinitialise le message d'erreur
  showBasePage.value = !showBasePage.value;
  showDownloadPopup.value = !showDownloadPopup.value;
};

const toggleShowCustomizePopup = () => { // Fonction pour montrer ou cacher le pop-up de saisie manuelle des postes comptables (Factures personnalisées)
  showBasePage.value = !showBasePage.value;
  showCustomizePopup.value = !showCustomizePopup.value;
};

const toggleShowTypeSelectionPopup = () => { // Fonction pour montrer ou cacher le pop-up de sélection du type de facture
  showBasePage.value = !showBasePage.value;
  showTypeSelectionPopup.value = !showTypeSelectionPopup.value;
};

const handleKeyDown = (event) => { // Fonction pour gérer l'événement de la touche 'Échapper' (fermer les popups et revenir sur la page de base)
  if (event.key === 'Escape') {
    showDownloadPopup.value = false;
    showCustomizePopup.value = false;
    showNumberOfFilesPopup.value = false;
    showTypeSelectionPopup.value = false;
    showBasePage.value = true;
    resetCustomization();
  }
};

onMounted(() => { // Ajoute un écouteur d'événement pour la touche 'Échapper' pour fermer les popups
  document.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => { // Supprime l'écouteur d'événement pour la touche 'Échapper' lors de la destruction du composant
  document.removeEventListener('keydown', handleKeyDown);
});

const downloadFiles = async () => { // Fonction pour télécharger les fichiers en fonction des paramètres sélectionnés (Factures personnalisées et factures standard)
  if (!selectedType.value) {
    errorMessage.value = 'Vous devez sélectionner un type de facture.';
    return;
  }
  const params = new URLSearchParams({
    numIdPost: numIdPost.value,
    numFilesPerIdPost: numFilesPerIdPost.value,
    type: selectedType.value,
    idPosts: addedPostComptables.value || ''
  });
  try {
    const response = await fetch(`/api/downloadXMLFile?${params}`, {
      method: 'GET'
    });
    if (!response.ok) {
      throw new Error(`La réponse du serveur n'est pas "ok": ${response.statusText}`);
    }
    const blob = await response.blob();
    const alertsHeader = response.headers.get('X-Alerts');
    const alerts = alertsHeader ? JSON.parse(alertsHeader) : null;
    if (alerts) {
      handleAlerts(alerts);
    }
    downloadZip(blob);
    closeDownloadPopup();
    showCustomizePopup.value = false;
  } catch (error) {
    console.error('Il y a une erreur lors de l\'opération fetch:', error);
    errorMessage.value = 'Une erreur est survenue lors du téléchargement des fichiers.';
  }
};

const handleAlerts = (alerts) => { // Fonction pour gérer les alertes reçues du serveur
  if (!alerts) return;
  alertMessages.value = alerts.idPost || [];
  alertRecapMessage.value = alerts.recap?.join(' ') || '';
  if (alerts.codCol && alerts.codCol.length > 0) {
    alertMessages.value.push(...alerts.codCol);
  }
};

const downloadZip = (blobContent) => { // Fonction pour télécharger le fichier zip
  const url = window.URL.createObjectURL(blobContent);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'generated_files.zip'; 
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
};

const selectTypeAndContinue = async (type) => { // Permet de sélectionner le type de la facture et d'ouvrir
  selectedType.value = type;
  await loadMockData(type); // Charger les données en fonction du type sélectionné
  closeTypeSelectionPopup();
  toggleShowCustomizePopup();
  resetCustomization();
};

const closeDownloadPopup = () => { // Fonction pour fermer le pop-up de téléchargement
  showDownloadPopup.value = false;
  showBasePage.value = true;
  resetCustomization();
};

const closeTypeSelectionPopup = () => { // Fonction pour fermer le pop-up de sélection du type de facture
  showTypeSelectionPopup.value = false;
  showBasePage.value = true; // Je ne sserais 
  resetCustomization();
};

const closeCustomizePopup = () => { // Fonction pour fermer le pop-up de saisie manuelle des postes comptables
  showCustomizePopup.value = false;
  showTypeSelectionPopup.value = true;
  resetCustomization();
};

const customizeTitle = computed(() => { // Permet de personnaliser le titre du pop-up de saisie manuelle des postes comptables avec le type de facture sélectionné.
  let title = 'Saisie manuelle des postes comptables';
  if (selectedType.value) {
    title += ` ${selectedType.value.toUpperCase()}`; // Ajoute le type de facture sélectionné à la fin du titre
  } 
  return title;
});
</script>

<style scoped>
/* style */
</style>
