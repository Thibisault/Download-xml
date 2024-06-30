<template>
  <div class="mgmt-global-container">
    <div v-if="showBasePage" class="mgmt-container">
      <h1 class="mgmt-heading">Télécharger Factures</h1>
      <hr class="mgmt-divider"/>
      
      <div v-if="alertMessages.length > 0 || alertRecapMessage" class="alert-modal">
        <div class="alert-content">
          <div v-if="alertRecapMessage">
            <p>{{ alertRecapMessage }}</p>
          </div>
          <div v-if="alertMessages.length > 0">
            <h2>Attention</h2>
            <div v-for="message in alertMessages" :key="message">
              <p>{{ message }}</p>
            </div>
          </div>
          <button @click="alertMessages = []; alertRecapMessage = ''" class="mgmt-button confirm">OK</button>
        </div>
      </div>

      <div class="button-container">
        <button @click="toggleShowDownloadPopup" class="mgmt-button download">
          Télécharger Factures
        </button>
        <button @click="toggleShowTypeSelectionPopup" class="mgmt-button customize">
          Personnalisation de la Facture
        </button>
      </div>
    </div>

    <div v-if="showDownloadPopup" class="download-popup" ref="downloadPopup">
      <div class="popup-content">
        <div class="mgmt-popup-banner">
          <h2>Choisissez les paramètres de téléchargement</h2>
          <div class="input-group">
            <label for="numIdPost">Nombre d'IdPost</label>
            <input
              id="numIdPost"
              v-model.number="numIdPost"
              type="number"
              min="1"
              class="popup-input"
            />
          </div>
          <div class="input-group">
            <label for="numFilesPerIdPost">Nombre de Factures par IdPost</label>
            <input
              id="numFilesPerIdPost"
              v-model.number="numFilesPerIdPost"
              type="number"
              min="1"
              class="popup-input"
            />
          </div>
          <div class="input-group">
            <label>Types de Factures</label>
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
          <div v-if="errorMessage" class="error-message">
            <p>{{ errorMessage }}</p>
          </div>
          <div class="popup-actions">
            <button @click="downloadFiles" class="mgmt-button confirm">Télécharger</button>
            <button @click="closeDownloadPopup" class="mgmt-button cancel">Annuler</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showTypeSelectionPopup" class="download-popup" ref="typeSelectionPopup">
      <div class="popup-content">
        <div class="mgmt-popup-banner">
          <h2>Choisir type facture</h2>
          <div class="input-group">
            <label>Types de Factures</label>
            <div>
              <button @click="selectTypeAndContinue('hop')" class="mgmt-button type-select">Hop</button>
            </div>
            <div>
              <button @click="selectTypeAndContinue('rol')" class="mgmt-button type-select">Rol</button>
            </div>
            <div>
              <button @click="selectTypeAndContinue('rec')" class="mgmt-button type-select">Rec</button>
            </div>
          </div>
          <div class="popup-actions">
            <button @click="closeTypeSelectionPopup" class="mgmt-button cancel">Annuler</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showCustomizePopup" class="download-popup" ref="customizePopup">
      <div class="popup-content">
        <div class="mgmt-popup-banner">
          <h2>{{ customizeTitle }}</h2>
          <div class="input-group">
            <label for="postComptable">Saisissez poste comptable</label>
            <input
              id="postComptable"
              v-model="postComptable"
              @input="validatePostComptable"
              autocomplete="off"
              type="text"
              list="data"
              :class="{'valid': isPostComptableValid, 'invalid': !isPostComptableValid}"
              class="popup-input"
            />
            <datalist id="data">
              <option v-for="item in filteredMockData" :key="item.IdPost" :value="item.IdPost" />
            </datalist>
          </div>
          <div class="popup-actions">
            <button @click="addPostComptable" :disabled="!isPostComptableValid" class="mgmt-button confirm">Ajouter poste comptable</button>
          </div>
          <div class="added-posts" v-if="showHalfCustomizePopup">
            <ul>
              <li v-for="post in addedPostComptables" :key="post" class="added-post-item">
                {{ post }}
                <img src="assets/lock-red.png" @click="removePostComptable(post)" class="remove-icon" />
              </li>
            </ul>
          </div>
          <hr class="mgmt-divider"/>
          <div class="input-group" v-if="showHalfCustomizePopup">
            <label for="numFilesPerPostComptable">Nombre de Factures par poste comptable</label>
            <input
              id="numFilesPerPostComptable"
              v-model.number="numFilesPerPostComptable"
              type="number"
              min="1"
              class="popup-input"
            />
          </div>          
          <div class="popup-actions">
            <button @click="customizeDownloadFiles" :disabled="addedPostComptables.length === 0" class="mgmt-button confirm" v-if="showHalfCustomizePopup">Télécharger</button>
            <button @click="closeCustomizePopup" class="mgmt-button cancel">Annuler</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showNumberOfFilesPopup" class="download-popup" ref="numberOfFilesPopup">
      <div class="popup-content">
        <div class="mgmt-popup-banner">
          <h2>Nombre de factures par poste comptable</h2>
          <div class="input-group">
            <label for="numFilesPerPost">Nombre de Factures par Poste Comptable</label>
            <input
              id="numFilesPerPost"
              v-model.number="numFilesPerPost"
              type="number"
              min="1"
              class="popup-input"
            />
          </div>
          <div class="popup-actions">
            <button @click="customizeDownloadFiles" class="mgmt-button confirm">Télécharger</button>
            <button @click="closeNumberOfFilesPopup" class="mgmt-button cancel">Annuler</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { mockDataHop } from '../server/data/mock-data-hop';
import { mockDataRol } from '../server/data/mock-data-rol';
import { mockDataRec } from '../server/data/mock-data-rec';

const showBasePage = ref(true);
const showDownloadPopup = ref(false);
const showHalfCustomizePopup = ref(false);
const showCustomizePopup = ref(false);
const showNumberOfFilesPopup = ref(false);
const showTypeSelectionPopup = ref(false); // Nouveau pop-up pour la sélection du type de facture
const numIdPost = ref(1);
const numFilesPerIdPost = ref(1);
const numFilesPerPost = ref(1);
const numFilesPerPostComptable = ref(1); // Nouveau champ pour le nombre de factures par poste comptable
const alertMessages = ref([]);
const alertRecapMessage = ref('');
const postComptable = ref('');
const addedPostComptables = ref([]);
const isPostComptableValid = ref(false);
const downloadPopup = ref(null);
const customizePopup = ref(null);
const numberOfFilesPopup = ref(null);
const typeSelectionPopup = ref(null);
const selectedType = ref(''); // Variable pour stocker le type de facture sélectionné
const errorMessage = ref(''); // Variable pour stocker le message d'erreur

const mockDataHopCache = ref([]);
const mockDataRolCache = ref([]);
const mockDataRecCache = ref([]);
const router = useRouter();

const loadMockData = () => {
  mockDataHopCache.value = mockDataHop;
  mockDataRolCache.value = mockDataRol;
  mockDataRecCache.value = mockDataRec;
};

const validatePostComptable = () => {
  let mockData;
  switch (selectedType.value) {
    case 'hop':
      mockData = mockDataHopCache.value;
      break;
    case 'rol':
      mockData = mockDataRolCache.value;
      break;
    case 'rec':
      mockData = mockDataRecCache.value;
      break;
    default:
      mockData = [];
  }

  isPostComptableValid.value = mockData.some(item => item.IdPost === postComptable.value) && !addedPostComptables.value.includes(postComptable.value);
};

const filteredMockData = computed(() => {
  let mockData;
  switch (selectedType.value) {
    case 'hop':
      mockData = mockDataHopCache.value;
      break;
    case 'rol':
      mockData = mockDataRolCache.value;
      break;
    case 'rec':
      mockData = mockDataRecCache.value;
      break;
    default:
      mockData = [];
  }

  return mockData.filter(item => !addedPostComptables.value.includes(item.IdPost));
});

const addPostComptable = () => {
  if (isPostComptableValid.value) {
    addedPostComptables.value.push(postComptable.value);
    postComptable.value = '';
    isPostComptableValid.value = false;
    if (!showHalfCustomizePopup.value) {
      showHalfCustomizePopup.value = true;
    }
  }
};

const removePostComptable = (post) => {
  addedPostComptables.value = addedPostComptables.value.filter(item => item !== post);
  if (addedPostComptables.value.length < 1) {
    showHalfCustomizePopup.value = false;
  }
  validatePostComptable(); 
};

const resetCustomization = () => {
  addedPostComptables.value = [];
  postComptable.value = '';
  isPostComptableValid.value = false;
  showHalfCustomizePopup.value = false;
};

const handleClickOutside = (event) => {
  const downloadPopupEl = downloadPopup.value;
  const customizePopupEl = customizePopup.value;
  const numberOfFilesPopupEl = numberOfFilesPopup.value;
  const typeSelectionPopupEl = typeSelectionPopup.value;

  if (
    (downloadPopupEl && !downloadPopupEl.contains(event.target)) &&
    (customizePopupEl && !customizePopupEl.contains(event.target)) &&
    (numberOfFilesPopupEl && !numberOfFilesPopupEl.contains(event.target)) &&
    (typeSelectionPopupEl && !typeSelectionPopupEl.contains(event.target))
  ) {
    showDownloadPopup.value = false;
    showCustomizePopup.value = false;
    showNumberOfFilesPopup.value = false;
    showTypeSelectionPopup.value = false;
    showBasePage.value = true;
    resetCustomization();
  }
};

const toggleShowDownloadPopup = () => {
  errorMessage.value = ''; // Réinitialise le message d'erreur
  showBasePage.value = !showBasePage.value;
  showDownloadPopup.value = !showDownloadPopup.value;
};

const toggleShowCustomizePopup = () => {
  showBasePage.value = !showBasePage.value;
  showCustomizePopup.value = !showCustomizePopup.value;
};

const toggleShowNumberOfFilesPopup = () => {
  if (showCustomizePopup.value === true) {
    showCustomizePopup.value = false;
  } else {
    showCustomizePopup.value = true;
  }
  if (showBasePage.value === true) {
    showBasePage.value = false;
  }
  showNumberOfFilesPopup.value = !showNumberOfFilesPopup.value;
};

const toggleShowTypeSelectionPopup = () => {
  showBasePage.value = !showBasePage.value;
  showTypeSelectionPopup.value = !showTypeSelectionPopup.value;
};

const handleKeyDown = (event) => {
  if (event.key === 'Escape') {
    showDownloadPopup.value = false;
    showCustomizePopup.value = false;
    showNumberOfFilesPopup.value = false;
    showTypeSelectionPopup.value = false;
    showBasePage.value = true;
    resetCustomization();
  }
};

onMounted(() => {
  loadMockData();
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleKeyDown);
});

const downloadFiles = async () => {
  if (!selectedType.value) {
    errorMessage.value = 'Vous devez sélectionner un type de facture.';
    return;
  }

  const params = new URLSearchParams({
    numIdPost: numIdPost.value,
    numFilesPerIdPost: numFilesPerIdPost.value,
    type: selectedType.value
  });

  try {
    const response = await fetch(`/api/generate-multiple-xml?${params}`, {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error(`La réponse du serveur n'est pas "ok": ${response.statusText}`);
    }

    const blob = await response.blob();
    const alerts = JSON.parse(response.headers.get('X-Alerts'));
    handleAlerts(alerts);
    downloadZip(blob);
    closeDownloadPopup();
  } catch (error) {
    console.error('Il y a une erreur lors de l"opération fetch:', error);
  }
};

const handleAlerts = (alerts) => {
  console.log(alerts);
  alertMessages.value = alerts.idPost || [];
  alertRecapMessage.value = alerts.recap?.join(' ') || '';
  if (alerts.codCol.length > 0) {
    alertMessages.value.push(...alerts.codCol);
  }
};

const downloadZip = (blobContent) => {
  const url = window.URL.createObjectURL(blobContent);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'generated_files.zip';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
};

const customizeDownloadFiles = async () => {
  const params = new URLSearchParams({
    numFilesPerPostComptable: numFilesPerPostComptable.value,
    type: selectedType.value,
    idPosts: addedPostComptables.value.join(',')
  });

  try {
    const response = await fetch(`/api/generate-multiple-xml?${params}`, {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error(`La réponse du serveur n'est pas "ok": ${response.statusText}`);
    }

    const blob = await response.blob();
    const alerts = JSON.parse(response.headers.get('X-Alerts'));
    handleAlerts(alerts);
    downloadZip(blob);
    closeCustomizePopup();
  } catch (error) {
    console.error('Il y a une erreur lors de l"opération fetch:', error);
  }
};

const selectTypeAndContinue = (type) => {
  selectedType.value = type;
  closeTypeSelectionPopup();
  toggleShowCustomizePopup();
};

const closeDownloadPopup = () => {
  showDownloadPopup.value = false;
  showBasePage.value = true;
  resetCustomization();
};

const closeTypeSelectionPopup = () => {
  showTypeSelectionPopup.value = false;
  showBasePage.value = true;
  resetCustomization();
};

const closeCustomizePopup = () => {
  showCustomizePopup.value = false;
  showBasePage.value = true;
  resetCustomization();
};

const closeNumberOfFilesPopup = () => {
  showNumberOfFilesPopup.value = false;
  showBasePage.value = true;
  resetCustomization();
};

const customizeTitle = computed(() => {
  let title = 'Saisie manuelle des postes comptables';
  if (selectedType.value) {
    title += ` ${selectedType.value.toUpperCase()}`;
  } 
  return title;
});
</script>

<style scoped>

</style>
