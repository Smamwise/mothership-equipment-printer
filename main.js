//
//  ______ _    _ _   _  _____ _______ _____ ____  _   _  _____ 
// |  ____| |  | | \ | |/ ____|__   __|_   _/ __ \| \ | |/ ____|
// | |__  | |  | |  \| | |       | |    | || |  | |  \| | (___  
// |  __| | |  | | . ` | |       | |    | || |  | | . ` |\___ \ 
// | |    | |__| | |\  | |____   | |   _| || |__| | |\  |____) |
// |_|     \____/|_| \_|\_____|  |_|  |_____\____/|_| \_|_____/ 
//

// Global Variables
let contentTypeGlobal = 'weapon';

const contentTypes = {
    weapon,
    armor,
    item,
    cyberware
  };

// Utility: debounce to avoid layout thrash
function debounce(fn, ms = 120) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), ms);
    };
}

// cached DOM nodes (safer than relying on global id->var implicit behavior)
const contentSelect = document.getElementById('contentSelect');
const randomWeaponButton = document.getElementById('randomWeaponButton');
const randomArmorButton = document.getElementById('randomArmorButton');
const randomItemButton = document.getElementById('randomItemButton');
const randomCyberwareButton = document.getElementById('randomCyberwareButton');
const contentStats = document.getElementById('contentStats');
const contentTitle = document.getElementById('contentTitle');
const contentTypeEl = document.getElementById('contentType');
const contentImageContainer = document.getElementById('contentImageContainer');
const contentSpinnerLive = document.getElementById('contentSpinnerLive');

// Event listeners (guarded, using cached nodes)
const debouncedUpdateContentBlockHeight = debounce(() => updateContentBlockHeight(), 120);
if (contentSelect) contentSelect.addEventListener('change', function() { updateContent(this.value); }); // Dropdown menu changes
if (randomWeaponButton) randomWeaponButton.addEventListener('click', () => getRandomContent('weapon'));
if (randomArmorButton) randomArmorButton.addEventListener('click', () => getRandomContent('armor'));
if (randomItemButton) randomItemButton.addEventListener('click', () => getRandomContent('item'));
if (randomCyberwareButton) randomCyberwareButton.addEventListener('click', () => getRandomContent('cyberware'));
const printButton = document.getElementById('print');
if (printButton) {
    printButton.addEventListener('click', () => debouncedUpdateContentBlockHeight());
    printButton.addEventListener('click', function() { window.print(); });
}
if (contentStats) contentStats.addEventListener('input', () => debouncedUpdateContentBlockHeight()); // input in contentStats table

const contentImg = document.getElementById('contentImg');
const contentImgInput = document.getElementById('contentImgInput');
const contentSpinner = document.getElementById('contentSpinner');
// When the image is clicked, reposition the input to the click location and show it
contentImg.addEventListener('click', function(e) {
    // Position the input where the user clicked, relative to the image container
    const container = document.getElementById('contentImageContainer');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    // clientX/Y are viewport coords — convert to container-relative
    let left = e.clientX - rect.left;
    let top = e.clientY - rect.top;

    // Make the input visible but hidden so we can measure its size
    contentImgInput.style.display = 'block';
    contentImgInput.style.visibility = 'hidden';
    contentImgInput.style.zIndex = '30';
    // ensure the input has a position so offsetWidth/Height report correctly
    contentImgInput.style.left = '0px';
    contentImgInput.style.top = '0px';

    const inputW = contentImgInput.offsetWidth || 150;
    const inputH = contentImgInput.offsetHeight || 24;

    // Clamp so the input remains fully inside the container
    if (left + inputW > rect.width) left = rect.width - inputW;
    if (top + inputH > rect.height) top = rect.height - inputH;
    if (left < 0) left = 0;
    if (top < 0) top = 0;

    contentImgInput.style.left = left + 'px';
    contentImgInput.style.top = top + 'px';

    // Reveal and focus the input
    contentImgInput.style.visibility = 'visible';
    contentImgInput.focus();
    contentImgInput.select();
});

// When the input loses focus, update the image src and hide the input
contentImgInput.addEventListener('blur', function() {
    setImageSrc(contentImgInput.value);
    contentImgInput.style.display = 'none';
    debouncedUpdateContentBlockHeight();
});

// When Enter is pressed in the input field, remove focus (thus triggering blur)
contentImgInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        contentImgInput.blur();
    }
});
								   
// Get random content
function getRandomContent(type) {
    contentTypeGlobal = type;
    updateTable(contentTypeGlobal)
    populateDropdown();
  
    const currentMap = contentTypes[contentTypeGlobal];
    const keys = Array.from(currentMap.keys());
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
  
    // Update the dropdown to show the randomly selected key
    contentSelect.value = randomKey;
    updateContent(randomKey);
};

// Populate dropdown with content names
// Function to populate the dropdown based on the current content type
function populateDropdown() {
    // Clear the existing options
    if (contentSelect) contentSelect.options.length = 0;
    
    // Use the global contentTypeGlobal string to choose the correct map
    const selectedMap = contentTypes[contentTypeGlobal];
    
    // Iterate over the selected map and add options to the dropdown
        const fragment = document.createDocumentFragment();
        selectedMap.forEach((_, key) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = key;
            fragment.appendChild(option);
        });
        if (contentSelect) contentSelect.appendChild(fragment);
};

// Safe helper to set table cell text if it exists
function setCellText(tableId, row, col, text) {
    const table = document.getElementById(tableId);
    if (!table) return;
    const r = table.rows[row];
    if (r && r.cells[col]) {
        r.cells[col].innerText = text ?? '';
        return;
    }
    // fallback: if a special/class cell exists, set that
        const special = table.querySelector('.special');
    if (special) special.innerText = text ?? '';
}

function updateContent(selectedKey) {
    // Ensure table layout matches the current content type
    updateTable(contentTypeGlobal);
    const currentMap = contentTypes[contentTypeGlobal];
    const attributes = currentMap.get(selectedKey);
    if (!attributes) return;

    // Update title and type
    document.getElementById('contentTitle').innerText = selectedKey.replace("*","");
    document.getElementById('contentType').innerText = attributes[0];

    // Update image (use fallback when the data entry has no image key)
    const imgKey = attributes[7];
    const imagepath = imgKey ? `./images/${imgKey}.png` : './images/missing.png';
    setImageSrc(imagepath);
    if (contentImgInput) contentImgInput.value = imagepath;

    // Update the table cells safely:
    setCellText('contentStats', 0, 1, attributes[2]);
    setCellText('contentStats', 1, 1, attributes[3]);
    setCellText('contentStats', 2, 1, attributes[4]);
    setCellText('contentStats', 3, 1, attributes[5]);
    setCellText('contentStats', 4, 1, attributes[6]);
};

// update table layout
function updateTable(contentType) {
    const table = document.getElementById("contentStats");
    if (!table) return;
    // clear existing rows
    while (table.firstChild) table.removeChild(table.firstChild);

    // Define rows as objects: { left, rightEditable, trStyle, leftStyle, rightId }
    let rows = [];
    if (contentType === "weapon") {
        contentTypeGlobal = "weapon";
        rows = [
            { left: 'RANGE', rightEditable: true },
            { left: 'DAMAGE', rightEditable: true },
            { left: 'SHOTS', rightEditable: true },
            { left: 'WOUND', rightEditable: true },
            { left: 'SPECIAL', rightEditable: true, rightClass: 'special' }
        ];
    } else if (contentType === "armor") {
        contentTypeGlobal = "armor";
        rows = [
            { left: 'AP', rightEditable: true },
            { left: 'O2', rightEditable: true },
            { left: 'SPEED', rightEditable: true },
            { left: '', trStyle: 'display: none;' },
            { left: 'SPECIAL', rightEditable: true, rightClass: 'special' }
        ];
    } else if (contentType === "item") {
        contentTypeGlobal = "item";
        rows = [
            { left: 'RANGE', trStyle: 'display: none;' },
            { left: 'DAMAGE', trStyle: 'display: none;' },
            { left: 'SHOTS', trStyle: 'display: none;' },
            { left: 'WOUND', trStyle: 'display: none;' },
            { left: 'DESCRIPTION', rightEditable: true, rightClass: 'special', trStyle: 'display: grid;', leftStyle: 'width: auto;' }
        ];
    } else if (contentType === "cyberware") {
        contentTypeGlobal = "cyberware";
        rows = [
            { left: 'SLOTS', rightEditable: true },
            { left: '', trStyle: 'display: none;' },
            { left: '', trStyle: 'display: none;' },
            { left: 'REQ', rightEditable: true },
            { left: 'DESC', rightEditable: true, rightClass: 'special' }
        ];
    }

    // Build DOM rows
    rows.forEach(r => {
        const tr = document.createElement('tr');
        if (r.trStyle) tr.setAttribute('style', r.trStyle);

        const tdLeft = document.createElement('td');
        if (r.leftStyle) tdLeft.setAttribute('style', r.leftStyle);
        tdLeft.textContent = r.left || '';

        const tdRight = document.createElement('td');
        if (r.rightClass) tdRight.classList.add(r.rightClass);
        if (r.rightEditable) tdRight.setAttribute('contenteditable', 'true');

        tr.appendChild(tdLeft);
        tr.appendChild(tdRight);
        table.appendChild(tr);
    });
};

// update save as pdf page pixel height
function updateContentBlockHeight() {
    const contentBlock = document.querySelector('.content-block');
    const heightPx = contentBlock.getBoundingClientRect().height + 20;
    document.documentElement.style.setProperty('--content-block-height', `${Math.floor(heightPx)}px`);
}

// fire functions on site load
window.onload = function () {
    const list = Object.keys(contentTypes);
    const randomItem = list[Math.floor(Math.random() * list.length)];
    getRandomContent(randomItem);
    setTimeout(() => { updateContentBlockHeight();}, 200);
};

// Helper to show spinner and set image src
function setImageSrc(src) {
    if (!contentImg) return;
    const fallback = './images/missing.png';
    // treat falsy src (null/undefined/empty) as missing and use fallback
    if (!src) src = fallback;
    if (contentSpinner) {
        contentSpinner.style.display = 'block';
        contentSpinner.setAttribute('aria-hidden', 'false');
    }
    contentImg.style.opacity = '0.35';

    const loader = new Image();
    loader.onload = () => {
        contentImg.src = src;
        if (contentSpinner) {
            contentSpinner.style.display = 'none';
            contentSpinner.setAttribute('aria-hidden', 'true');
        }
        contentImg.style.opacity = '1';
        debouncedUpdateContentBlockHeight();
    };
    loader.onerror = () => {
        if (src !== fallback) {
            // try fallback once
            loader.src = fallback;
        } else {
            if (contentSpinner) {
                contentSpinner.style.display = 'none';
                contentSpinner.setAttribute('aria-hidden', 'true');
            }
            contentImg.style.opacity = '1';
            debouncedUpdateContentBlockHeight();
        }
    };
    loader.src = src;
}

contentImg.addEventListener('load', () => {
    if (contentSpinner) {
        contentSpinner.style.display = 'none';
        contentSpinner.setAttribute('aria-hidden', 'true');
    }
    contentImg.style.opacity = '1';
    debouncedUpdateContentBlockHeight();
});

contentImg.addEventListener('error', () => {
    if (contentSpinner) {
        contentSpinner.style.display = 'none';
        contentSpinner.setAttribute('aria-hidden', 'true');
    }
    contentImg.style.opacity = '1';
    debouncedUpdateContentBlockHeight();
});