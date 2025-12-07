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

// Event listeners 
contentSelect.addEventListener('change', function() {updateContent(this.value);}); // Dropdown menu changes
document.getElementById('randomWeaponButton').addEventListener('click', () => getRandomContent('weapon')); // button clicks
document.getElementById('randomArmorButton').addEventListener('click', () => getRandomContent('armor'));
document.getElementById('randomItemButton').addEventListener('click', () => getRandomContent('item'));
document.getElementById('randomCyberwareButton').addEventListener('click', () => getRandomContent('cyberware'));
const printButton = document.getElementById('print')
printButton.addEventListener('click', () => updateContentBlockHeight());
printButton.addEventListener('click', function() {window.print();});                    
document.getElementById('contentStats').addEventListener('input', () => updateContentBlockHeight()); // input in contentStats table

const contentImg = document.getElementById('contentImg');
const contentImgInput = document.getElementById('contentImgInput');
// When the image is clicked, reposition the input to the click location and show it
contentImg.addEventListener('click', function(e) {
    // Position the input where the user clicked
    contentImgInput.style.left = e.clientX +'px';
    contentImgInput.style.top = e.clientY +'px';
    // Show the input and focus on it
    contentImgInput.style.display = 'block';
    contentImgInput.focus();
    contentImgInput.select();
});

// When the input loses focus, update the image src and hide the input
contentImgInput.addEventListener('blur', function() {
    contentImg.src = contentImgInput.value;
    contentImgInput.style.display = 'none';
    updateContentBlockHeight();
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
    contentSelect.innerHTML = "";
    
    // Use the global contentTypeGlobal string to choose the correct map
    const selectedMap = contentTypes[contentTypeGlobal];
    
    // Iterate over the selected map and add options to the dropdown
    selectedMap.forEach((_, key) => {
      let option = document.createElement('option');
      option.value = key;
      option.textContent = key;
      contentSelect.appendChild(option);
    });
};

function updateContent(selectedKey) {
    const currentMap = contentTypes[contentTypeGlobal];
    const attributes = currentMap.get(selectedKey);
    if (!attributes) return;

    // Update title and type
    document.getElementById('contentTitle').innerText = selectedKey.replace("*","");
    document.getElementById('contentType').innerText = attributes[0];

    // Update image
    let imagepath = `./images/${attributes[7]}.png`;
    contentImg.setAttribute('src', imagepath);
    contentImgInput.value = imagepath;

    // Update the table cells:
    document.getElementById('contentStats').rows[0].cells[1].innerText = attributes[2];
    document.getElementById('contentStats').rows[1].cells[1].innerText = attributes[3];
    document.getElementById('contentStats').rows[2].cells[1].innerText = attributes[4];
    document.getElementById('contentStats').rows[3].cells[1].innerText = attributes[5];
    document.getElementById('contentStats').rows[4].cells[1].innerText = attributes[6];
    document.getElementById('contentStats').rows[5].cells[1].innerText = attributes[6];
};

// update table layout
function updateTable(contentType) {
    const table = document.getElementById("contentStats");
    let htmlContent = "";
    if (contentType === "weapon") {
        contentTypeGlobal = "weapon"
        htmlContent = `
        <tr><td>RANGE</td><td contenteditable="true"></td></tr>
        <tr><td>DAMAGE</td><td contenteditable="true"></td></tr>
        <tr><td>SHOTS</td><td contenteditable="true"></td></tr>
        <tr><td>WOUND</td><td contenteditable="true"></td></tr>
        <tr><td>SPECIAL</td><td contenteditable="true" id="special"></td></tr>
        `;
    } else if (contentType === "armor") {
        contentTypeGlobal = "armor"
        htmlContent = `
        <tr><td>AP</td><td contenteditable="true"></td></tr>
        <tr><td>O2</td><td contenteditable="true"></td></tr>
        <tr><td>SPEED</td><td contenteditable="true"></td></tr>
        <tr style="display: none;"><td></td><td></td></tr>
        <tr><td>SPECIAL</td><td contenteditable="true" id="special"></td></tr>
        `;
    } else if (contentType === "item") {
        contentTypeGlobal = "item"
        htmlContent = `
        <tr style="display: none;"><td>RANGE</td><td></td></tr>
        <tr style="display: none;"><td>DAMAGE</td><td></td></tr>
        <tr style="display: none;"><td>SHOTS</td><td></td></tr>
        <tr style="display: none;"><td>WOUND</td><td></td></tr>
        <tr style="display: grid"><td style="width: auto">DESCRIPTION</td><td contenteditable="true" id="special"></td></tr>
        `;
    } else if (contentType === "cyberware") {
        contentTypeGlobal = "cyberware"
        htmlContent = `
        <tr><td>SLOTS</td><td contenteditable="true"></td></tr>
        <tr style="display: none;"><td></td><td></td></tr>
        <tr style="display: none;"><td></td><td></td></tr>
        <tr><td>REQ</td><td contenteditable="true"></td></tr>
        <tr><td>DESC</td><td contenteditable="true" id="special"></td></tr>
        `;
    }
    table.innerHTML = htmlContent;
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