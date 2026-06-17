// Dom Element Selections
const panel = document.getElementById('panel');
const customizerBtn = document.getElementById('customizerBtn');
const textColorPicker = document.getElementById('textColorPicker');
const accentColorPicker = document.getElementById('accentColorPicker');
const logoColorPicker = document.getElementById('logoColorPicker');
const gifUpload = document.getElementById('gif-upload');
const resetBtn = document.getElementById('resetBtn');
const uiLogo = document.getElementById('ui-logo');

// Toggle panel visibility
function togglePanel() {
    panel.classList.toggle('open');
}

// Global theme customization router
function updateTheme(type, val) {
    if (type === 'text') {
        document.documentElement.style.setProperty('--text-color', val);
        localStorage.setItem('ntp_textColor', val);
    }
    if (type === 'accent') {
        document.documentElement.style.setProperty('--accent-color', val);
        localStorage.setItem('ntp_accentColor', val);
    }
    if (type === 'logo') {
        uiLogo.style.color = val;
        localStorage.setItem('ntp_logoColor', val);
    }
}

// Convert uploaded file targets into persistent Base64 blocks
function handleBgUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Img = e.target.result;
            try {
                document.body.style.backgroundImage = `url('${base64Img}')`;
                localStorage.setItem('ntp_bgImage', base64Img);
            } catch (err) {
                alert("The file size is too large for browser storage. Please optimize or use a smaller .gif configuration.");
            }
        };
        reader.readAsDataURL(file);
    }
}

// Reset custom parameters back to layout defaults
function resetDefaults() {
    localStorage.clear();
    location.reload();
}

// Event Binding Attachments
customizerBtn.addEventListener('click', togglePanel);
resetBtn.addEventListener('click', resetDefaults);
gifUpload.addEventListener('change', handleBgUpload);

textColorPicker.addEventListener('change', (e) => updateTheme('text', e.target.value));
accentColorPicker.addEventListener('change', (e) => updateTheme('accent', e.target.value));
logoColorPicker.addEventListener('change', (e) => updateTheme('logo', e.target.value));

// Init and restore parameters on tab bootup
window.addEventListener('DOMContentLoaded', () => {
    const savedText = localStorage.getItem('ntp_textColor') || '#ffffff';
    const savedAccent = localStorage.getItem('ntp_accentColor') || '#4285f4';
    const savedLogo = localStorage.getItem('ntp_logoColor') || '#ffffff';
    const savedBg = localStorage.getItem('ntp_bgImage');

    // Feed attributes into runtime variables
    updateTheme('text', savedText);
    updateTheme('accent', savedAccent);
    updateTheme('logo', savedLogo);

    // Sync input components
    textColorPicker.value = savedText;
    accentColorPicker.value = savedAccent;
    logoColorPicker.value = savedLogo;

    // Apply wallpaper constraints
    if (savedBg) {
        document.body.style.backgroundImage = `url('${savedBg}')`;
    }
});
