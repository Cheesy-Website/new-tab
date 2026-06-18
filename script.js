const panel = document.getElementById('panel');
const customizerBtn = document.getElementById('customizerBtn');
const textColorPicker = document.getElementById('textColorPicker');
const accentColorPicker = document.getElementById('accentColorPicker');
const logoColorPicker = document.getElementById('logoColorPicker');
const gifUpload = document.getElementById('gif-upload');
const resetBtn = document.getElementById('resetBtn');
const uiLogo = document.getElementById('ui-logo');

// New Shortcut Dom Elements
const shortcutsGrid = document.getElementById('shortcutsGrid');
const tileNameInput = document.getElementById('tileName');
const tileUrlInput = document.getElementById('tileUrl');
const addTileBtn = document.getElementById('addTileBtn');

// Fallback basic layouts to keep firewalls happy initially
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

function handleBgUpload(event) {
    const file = event.target.files;
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const dataStr = e.target.result;
            try {
                document.body.style.backgroundImage = `url('${dataStr}')`;
                localStorage.setItem('style_canvas', dataStr);
            } catch (err) {
                alert("File size limit exceeded for standard cache.");
            }
        };
        reader.readAsDataURL(file);
    }
}

// Render tiles directly out of array storage strings
function renderShortcuts() {
    shortcutsGrid.innerHTML = '';
    const shortcuts = JSON.parse(localStorage.getItem('custom_shortcuts')) || defaultShortcuts;

    shortcuts.forEach((item, index) => {
        // Build shortcut card container
        const card = document.createElement('div');
        card.className = 'shortcut-container';

        // Anchor link configuration
        const link = document.createElement('a');
        link.href = item.url;
        link.className = 'shortcut-item';
        
        // Grab first letter of site name as a dynamic fallback icon
        const firstLetter = item.name.charAt(0).toUpperCase();
        
        link.innerHTML = `
            <div class="shortcut-tile">${firstLetter}</div>
            <div class="shortcut-title">${item.name}</div>
        `;

        // Small functional delete node element
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'tile-delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.title = 'Remove Link';
        deleteBtn.onclick = (e) => {
            e.preventDefault(); // Stop click from following the link
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

    if (!name || !url) {
        alert("Please fill in both fields.");
        return;
    }

    // Auto-fix URL strings if the user forgets the protocol format
    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }

    const shortcuts = JSON.parse(localStorage.getItem('custom_shortcuts')) || [...defaultShortcuts];
    shortcuts.push({ name, url });
    
    localStorage.setItem('custom_shortcuts', JSON.stringify(shortcuts));
    
    // Clear out input fields
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
gifUpload.addEventListener('change', handleBgUpload);
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

    // Run custom component generation loops on document ready
    renderShortcuts();
});
