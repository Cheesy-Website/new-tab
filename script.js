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
const bgUrlInput = document.getElementById('bgUrlInput');
const saveBgBtn = document.getElementById('saveBgBtn');
const bgFileInput = document.getElementById('bgFileInput'); 
const bgMessage = document.getElementById('bgMessage'); 

const defaultShortcuts = [
    { name: "Drive", url: "https://google.com" },
    { name: "Classes", url: "https://google.com" },
    { name: "Wiki", url: "https://wikipedia.org" }
];

// INDEXEDDB SETUP: For storing backgrounds up to hundreds of megabytes safely
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
    loadSavedBackground(); // Load the large image only when DB is fully ready
};

function saveBackgroundToDB(base64Data, callback) {
    if (!db) return;
    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.put(base64Data, "currentBackground");
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
            document.body.style.backgroundImage = `url('${request.result}')`;
        }
    };
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

function convertDriveLink(url) {
    const driveRegex = /(?:drive\.google\.com\/file\/d\/|drive\.google\.com\/uc\?.*id=)([a-zA-Z0-9_-]+)/;
    const match = url.match(driveRegex);
    if (match && match[1]) {
        return `https://google.com{match[1]}&confirm=t`;
    }
    return url;
}

// Processes the uploaded .txt file containing large Base64 data
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    showBgMessage('Reading massive Base64 file... Please wait.', '#e67e22');

    const reader = new FileReader();
    reader.onload = function(evt) {
        let base64String = evt.target.result.trim();

        // Strip literal quotes if exported incorrectly inside the txt file
        if (base64String.startsWith('"') && base64String.endsWith('"')) {
            base64String = base64String.slice(1, -1);
        }

        // Add correct mime prefix if file contains raw data strings
        if (!base64String.startsWith('data:image')) {
            base64String = `data:image/png;base64,${base64String}`;
        }

        showBgMessage('Processing 100MB canvas asset details...', '#e67e22');

        // Render directly to UI and save to IndexedDB block bypassing 5MB limit
        document.body.style.backgroundImage = `url('${base64String}')`;
        
        saveBackgroundToDB(base64String, (success) => {
            if (success) {
                bgUrlInput.value = '';
                bgFileInput.value = ''; 
                showBgMessage('100MB Background saved and applied successfully!', '#2ecc71');
                setTimeout(() => { bgMessage.textContent = ''; }, 5000);
            } else {
                showBgMessage('Database write failed.', '#ff4d4d');
            }
        });
    };

    reader.readAsText(file);
}

function handleBgLink() {
    let urlString = bgUrlInput.value.trim();
    if (!urlString) {
        showBgMessage('Please enter a URL first.', '#ff4d4d');
        return;
    }

    urlString = convertDriveLink(urlString);
    showBgMessage('Downloading background file... Please wait.', '#e67e22');

    const loaderImage = new Image();
    loaderImage.src = urlString;

    loaderImage.onload = function() {
        document.body.style.backgroundImage = `url('${urlString}')`;
        saveBackgroundToDB(urlString, (success) => {
            if (success) {
                bgUrlInput.value = ''; 
                bgFileInput.value = '';
                showBgMessage('Background path saved successfully!', '#2ecc71');
                setTimeout(() => { bgMessage.textContent = ''; }, 4000);
            }
        });
    };

    loaderImage.onerror = function() {
        showBgMessage('Failed to load image. Ensure link is public.', '#ff4d4d');
    };
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
saveBgBtn.addEventListener('click', handleBgLink);
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
