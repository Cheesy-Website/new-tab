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
const bgFileInput = document.getElementById('bgFileInput'); // NEW
const bgMessage = document.getElementById('bgMessage'); 

const defaultShortcuts = [
    { name: "Drive", url: "https://google.com" },
    { name: "Classes", url: "https://google.com" },
    { name: "Wiki", url: "https://wikipedia.org" }
];

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

// NEW: Processes the uploaded .txt file containing Base64 data
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "text/plain" && !file.name.endsWith('.txt')) {
        showBgMessage('Please upload a valid .txt file.', '#ff4d4d');
        return;
    }

    showBgMessage('Reading Base64 file...', '#e67e22');

    const reader = new FileReader();
    reader.onload = function(evt) {
        let base64String = evt.target.result.trim();

        // Automatically wrap raw base64 string with image header if missing
        if (!base64String.startsWith('data:image')) {
            base64String = `data:image/png;base64,${base64String}`;
        }

        const testImage = new Image();
        testImage.src = base64String;

        testImage.onload = function() {
            try {
                document.body.style.backgroundImage = `url('${base64String}')`;
                localStorage.setItem('style_canvas', base64String); // Saved on its own
                bgUrlInput.value = '';
                bgFileInput.value = ''; 
                showBgMessage('Base64 background applied!', '#2ecc71');
                setTimeout(() => { bgMessage.textContent = ''; }, 4000);
            } catch (error) {
                showBgMessage('Storage failed. File exceeds browser 5MB limit.', '#ff4d4d');
            }
        };

        testImage.onerror = function() {
            showBgMessage('Invalid image data inside .txt file.', '#ff4d4d');
        };
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
        try {
            document.body.style.backgroundImage = `url('${urlString}')`;
            localStorage.setItem('style_canvas', urlString);
            bgUrlInput.value = ''; 
            bgFileInput.value = '';
            showBgMessage('Background rendered successfully!', '#2ecc71');
            setTimeout(() => { bgMessage.textContent = ''; }, 4000);
        } catch(e) {
            showBgMessage('Storage failed. URL path is too long.', '#ff4d4d');
        }
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
    location.reload();
}

// Event Bindings
customizerBtn.addEventListener('click', togglePanel);
resetBtn.addEventListener('click', resetDefaults);
saveBgBtn.addEventListener('click', handleBgLink);
bgFileInput.addEventListener('change', handleFileUpload); // NEW
addTileBtn.addEventListener('click', addShortcut);

textColorPicker.addEventListener('change', (e) => updateTheme('text', e.target.value));
accentColorPicker.addEventListener('change', (e) => updateTheme('accent', e.target.value));
logoColorPicker.addEventListener('change', (e) => updateTheme('logo', e.target.value));

window.addEventListener('DOMContentLoaded', () => {
    const savedText = localStorage.getItem('style_mainText') || '#ffffff';
    const savedAccent = localStorage.getItem('style_accentTint') || '#4285f4';
    const savedLogo = localStorage.getItem('style_headerTint') || '#ffffff';
    const savedBg = localStorage.getItem('style_canvas');

    updateTheme('text', savedText);
    updateTheme('accent', savedAccent);
    updateTheme('logo', savedLogo);

    textColorPicker.value = savedText;
    accentColorPicker.value = savedAccent;
    logoColorPicker.value = savedLogo;

    if (savedBg) {
        document.body.style.backgroundImage = `url('${savedBg}')`;
    }

    renderShortcuts();
});
