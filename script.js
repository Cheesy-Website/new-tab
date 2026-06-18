const panel = document.getElementById('panel');
const customizerBtn = document.getElementById('customizerBtn');
const textColorPicker = document.getElementById('textColorPicker');
const accentColorPicker = document.getElementById('accentColorPicker');
const logoColorPicker = document.getElementById('logoColorPicker');
const resetBtn = document.getElementById('resetBtn');
const uiLogo = document.getElementById('ui-logo');

// Shortcut Dom Elements
const shortcutsGrid = document.getElementById('shortcutsGrid');
const tileNameInput = document.getElementById('tileName');
const tileUrlInput = document.getElementById('tileUrl');
const addTileBtn = document.getElementById('addTileBtn');

// Background Input Elements
const bgFileInput = document.getElementById('bgFileInput'); 
const bgMessage = document.getElementById('bgMessage'); 

let activeBlobUrl = null;

const defaultShortcuts = [
    { name: "Classes", url: "https://google.com" },
    { name: "Wiki", url: "https://wikipedia.org" }
];

// INDEXEDDB CONFIG: Built to support 75MB+ GIF image storage
const dbName = "WorkspacePortalDB";
const storeName = "BackgroundStore";
let db;

const dbRequest = indexedDB.open(dbName, 1);
dbRequest.onupgradeneeded = function(e) {
    let database = e.target.result;
    if (!database.objectStoreNames.contains(storeName)) {
        database.createObjectStore(storeName);
    }
};
dbRequest.onsuccess = function(e) {
    db = e.target.result;
    loadSavedBackground(); 
};

function saveBackgroundToDB(dataPayload, callback) {
    if (!db) return;
    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.put(dataPayload, "currentBackground");
    request.onsuccess = () => callback(true);
    request.onerror = () => callback(false);
}

function loadSavedBackground() {
    if (!db) return;
    const transaction = db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get("currentBackground");
    request.onsuccess = function() {
        if (request.result) {
            applyBackgroundSource(request.result);
        }
    };
}

function applyBackgroundSource(source) {
    if (activeBlobUrl) {
        URL.revokeObjectURL(activeBlobUrl);
        activeBlobUrl = null;
    }

    if (source instanceof Blob || source instanceof File) {
        activeBlobUrl = URL.createObjectURL(source);
        document.body.style.backgroundImage = `url('${activeBlobUrl}')`;
    } else {
        document.body.style.backgroundImage = `url('${source}')`;
    }
}

function togglePanel() {
    panel.classList.toggle('open');
}

function updateTheme(type, val) {
    if (type === 'text') {
        document.documentElement.style.setProperty('--text-color', val);
        localStorage.setItem('style_mainText', val);
    }
    if (type === 'accent') {
        document.documentElement.style.setProperty('--accent-color', val);
        localStorage.setItem('style_accentTint', val);
    }
    if (type === 'logo') {
        uiLogo.style.color = val;
        localStorage.setItem('style_headerTint', val);
    }
}

// Processes large binary .gif image file directly
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    showBgMessage('Storing 75MB GIF to Local Database... Please stay on the page.', '#e67e22');

    saveBackgroundToDB(file, (success) => {
        if (success) {
            applyBackgroundSource(file);
            bgFileInput.value = ''; 
            showBgMessage('75MB Custom GIF saved permanently!', '#2ecc71');
            setTimeout(() => { bgMessage.textContent = ''; }, 5000);
        } else {
            showBgMessage('Database storage write failed.', '#ff4d4d');
        }
    });
}

function showBgMessage(text, color) {
    bgMessage.style.color = color;
    bgMessage.textContent = text;
}

function renderShortcuts() {
    shortcutsGrid.innerHTML = '';
    const shortcuts = JSON.parse(localStorage.getItem('custom_shortcuts')) || defaultShortcuts;

    shortcuts.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'shortcut-container';

        const link = document.createElement('a');
        link.href = item.url;
        link.className = 'shortcut-item';
        
        const firstLetter = item.name.charAt(0).toUpperCase();
        
        link.innerHTML = `
            <div class="shortcut-tile">${firstLetter}</div>
            <div class="shortcut-title">${item.name}</div>
        `;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'tile-delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.onclick = (e) => {
            e.preventDefault();
            removeShortcut(index);
        };

        card.appendChild(link);
        card.appendChild(deleteBtn);
        shortcutsGrid.appendChild(card);
    });
}

function addShortcut() {
    const name = tileNameInput.value.trim();
    let url = tileUrlInput.value.trim();
    if (!name || !url) return;
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

    const shortcuts = JSON.parse(localStorage.getItem('custom_shortcuts')) || [...defaultShortcuts];
    shortcuts.push({ name, url });
    localStorage.setItem('custom_shortcuts', JSON.stringify(shortcuts));
    
    tileNameInput.value = '';
    tileUrlInput.value = '';
    renderShortcuts();
}

function removeShortcut(index) {
    const shortcuts = JSON.parse(localStorage.getItem('custom_shortcuts')) || [...defaultShortcuts];
    shortcuts.splice(index, 1);
    localStorage.setItem('custom_shortcuts', JSON.stringify(shortcuts));
    renderShortcuts();
}

function resetDefaults() {
    localStorage.clear();
    if (db) {
        const transaction = db.transaction([storeName], "readwrite");
        transaction.objectStore(storeName).clear();
    }
    location.reload();
}

// Event Bindings
customizerBtn.addEventListener('click', togglePanel);
resetBtn.addEventListener('click', resetDefaults);
bgFileInput.addEventListener('change', handleFileUpload); 
addTileBtn.addEventListener('click', addShortcut);

textColorPicker.addEventListener('change', (e) => updateTheme('text', e.target.value));
accentColorPicker.addEventListener('change', (e) => updateTheme('accent', e.target.value));
logoColorPicker.addEventListener('change', (e) => updateTheme('logo', e.target.value));

window.addEventListener('DOMContentLoaded', () => {
    const savedText = localStorage.getItem('style_mainText') || '#ffffff';
    const savedAccent = localStorage.getItem('style_accentTint') || '#4285f4';
    const savedLogo = localStorage.getItem('style_headerTint') || '#ffffff';

    updateTheme('text', savedText);
    updateTheme('accent', savedAccent);
    updateTheme('logo', savedLogo);

    textColorPicker.value = savedText;
    accentColorPicker.value = savedAccent;
    logoColorPicker.value = savedLogo;

    renderShortcuts();
});
