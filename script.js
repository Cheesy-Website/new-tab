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

// Background Link Elements
const bgUrlInput = document.getElementById('bgUrlInput');
const saveBgBtn = document.getElementById('saveBgBtn');
const bgMessage = document.getElementById('bgMessage'); // New feedback container

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

// Helper function to convert standard Google Drive links to direct image links
function convertDriveLink(url) {
    const driveRegex = /(?:drive\.google\.com\/file\/d\/|drive\.google\.com\/uc\?.*id=)([a-zA-Z0-9_-]+)/;
    const match = url.match(driveRegex);
    
    if (match && match[1]) {
        return `https://google.com{match[1]}`;
    }
    return url;
}

// Handles saving, validating, and applying the background link
function handleBgLink() {
    let urlString = bgUrlInput.value.trim();
    if (!urlString) {
        bgMessage.style.color = '#ff4d4d';
        bgMessage.textContent = 'Please enter a URL first.';
        return;
    }

    // Convert link if it matches Google Drive patterns
    urlString = convertDriveLink(urlString);

    // Google Drive blocks programmatic JavaScript testing (CORS).
    // If it's a Drive link, skip the tester and apply it directly.
    if (urlString.includes('://google.com')) {
        document.body.style.backgroundImage = `url('${urlString}')`;
        localStorage.setItem('style_canvas', urlString);
        bgUrlInput.value = ''; // Clear input field
        
        bgMessage.style.color = '#2ecc71';
        bgMessage.textContent = 'Google Drive background applied!';
        setTimeout(() => { bgMessage.textContent = ''; }, 3000);
        return;
    }

    // Standard verification for all other normal image URLs
    bgMessage.style.color = '#e67e22';
    bgMessage.textContent = 'Testing link...';

    const imgTester = new Image();
    imgTester.src = urlString;

    imgTester.onload = function() {
        document.body.style.backgroundImage = `url('${urlString}')`;
        localStorage.setItem('style_canvas', urlString);
        bgUrlInput.value = ''; 
        
        bgMessage.style.color = '#2ecc71';
        bgMessage.textContent = 'Background updated successfully!';
        setTimeout(() => { bgMessage.textContent = ''; }, 3000);
    };

    imgTester.onerror = function() {
        bgMessage.style.color = '#ff4d4d';
        bgMessage.textContent = 'Failed to load image. Ensure it is a valid web link.';
    };
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
