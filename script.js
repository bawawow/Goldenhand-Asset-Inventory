// ============================
// Login & Modification Passwords
// ============================
const USERNAME = "admin";
const LOGIN_PASSWORD = "Login123";  // password to access site
const MOD_PASSWORD   = "P@55w0rd";  // password for add/update/delete/export

// Login function
function checkLogin() {
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if(username === USERNAME && password === LOGIN_PASSWORD){
        // Fade out overlay
        const overlay = document.getElementById("loginOverlay");
        overlay.classList.add("fade-out");
        setTimeout(() => overlay.style.display = "none", 500);
        document.getElementById("loginError").style.display = "none";
    } else {
        document.getElementById("loginError").style.display = "block";
    }
}

// Enter key support
document.getElementById("loginPassword").addEventListener("keypress", e => { if(e.key === "Enter") checkLogin(); });
document.getElementById("loginUsername").addEventListener("keypress", e => { if(e.key === "Enter") checkLogin(); });

// ============================
// Asset Inventory System
// ============================
let assets = JSON.parse(localStorage.getItem("assets")) || [];
let editIndex = -1;

// Check password for sensitive actions
function checkPassword() {
    const input = prompt("Enter modification password:");
    if(input !== MOD_PASSWORD){
        alert("Incorrect password!");
        return false;
    }
    return true;
}

// Save assets
function save() {
    localStorage.setItem("assets", JSON.stringify(assets));
    display();
}

// Add / Update Asset
function addAsset() {
    if(!checkPassword()) return;

    const id = document.getElementById("assetId").value.trim();
    const device = document.getElementById("device").value.trim();
    const model = document.getElementById("model").value.trim();
    const serial = document.getElementById("serial").value.trim();
    const user = document.getElementById("user").value.trim();

    if(!device || !serial) { alert("Device and Serial are required."); return; }

    const asset = { id, device, model, serial, user };

    if(editIndex > -1){
        assets[editIndex] = asset;
        editIndex = -1;
        document.querySelector("button[onclick='addAsset()']").innerText = "Add Asset";
    } else {
        assets.push(asset);
    }

    save();
    clearForm();
}

// Delete Asset
function deleteAsset(i) {
    if(!checkPassword()) return;
    if(confirm("Are you sure you want to delete this asset?")){
        assets.splice(i,1);
        save();
    }
}

// Export CSV
function exportCSV(){
    if(!checkPassword()) return;
    if(assets.length === 0){ alert("No assets to export."); return; }

    let csv = "AssetID,Device,Model,Serial,User\n";
    assets.forEach(a => { csv += `${a.id},${a.device},${a.model},${a.serial},${a.user}\n`; });

    const blob = new Blob([csv], { type:"text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "assets.csv";
    a.click();
}

// Display assets
function display() {
    const table = document.querySelector("#assetTable tbody");
    table.innerHTML = "";
    assets.forEach((a,i)=>{
        const row = document.createElement("tr");
        if(!a.id || !a.user) row.classList.add("imported");
        row.innerHTML = `
            <td>${a.id}</td>
            <td>${a.device}</td>
            <td>${a.model}</td>
            <td>${a.serial}</td>
            <td>${a.user}</td>
            <td>
                <button onclick="editAsset(${i})">Edit</button>
                <button onclick="deleteAsset(${i})">Delete</button>
            </td>`;
        table.appendChild(row);
    });
}

// Edit Asset
function editAsset(i) {
    const a = assets[i];
    document.getElementById("assetId").value = a.id;
    document.getElementById("device").value = a.device;
    document.getElementById("model").value = a.model;
    document.getElementById("serial").value = a.serial;
    document.getElementById("user").value = a.user;
    editIndex = i;
    document.querySelector("button[onclick='addAsset()']").innerText = "Update Asset";
}

// Clear form
function clearForm() {
    document.getElementById("assetId").value="";
    document.getElementById("device").value="";
    document.getElementById("model").value="";
    document.getElementById("serial").value="";
    document.getElementById("user").value="";
    editIndex=-1;
    document.querySelector("button[onclick='addAsset()']").innerText = "Add Asset";
}

// Search assets
function searchAsset() {
    const filter = document.getElementById("search").value.toLowerCase();
    const rows = document.querySelectorAll("#assetTable tbody tr");
    rows.forEach(row => row.style.display = row.innerText.toLowerCase().includes(filter) ? "" : "none");
}

// Import PC info (.txt)
function importTxt() {
    const fileInput = document.getElementById("importFile");
    const file = fileInput.files[0];
    if(!file){ alert("Please select a .txt file."); return; }

    const reader = new FileReader();
    reader.onload = function(e){
        const lines = e.target.result.split(/\r?\n/).map(l=>l.trim());
        let asset = {id:"",device:"",model:"",serial:"",user:""};
        lines.forEach(line=>{
            if(!line || line.startsWith("Computer Information") || line.startsWith("=")) return;
            if(line.toLowerCase().startsWith("hostname:")) asset.device=line.split(":")[1]?.trim();
            else if(line.toLowerCase().startsWith("serial number:")) asset.serial=line.split(":")[1]?.trim();
            else if(line.toLowerCase().startsWith("model:")) asset.model=line.split(":")[1]?.trim();
        });
        if(!asset.device || !asset.serial){ alert("Invalid file: missing Hostname or Serial Number."); return; }
        assets.push({...asset});
        save();
        fileInput.value="";
        alert("Asset imported successfully! Highlighted row is missing AssetID/User.");
    };
    reader.onerror=function(){alert("Error reading file.");};
    reader.readAsText(file);
}

// Download PC info script
document.getElementById("downloadScript").addEventListener("click", function(e){
    e.preventDefault();
    const batContent = `@echo off
REM ===========================
REM Get PC Hostname, Serial Number, Model
REM ===========================

REM Output file
set output_file=pc_info.txt

REM Clear previous file
> "%output_file%" echo Computer Information
>> "%output_file%" echo =====================
>> "%output_file%" echo.

REM Get Hostname
echo Hostname: %COMPUTERNAME% >> "%output_file%"

REM Get Serial Number using WMIC
for /f "skip=1 delims=" %%a in ('wmic bios get serialnumber') do (
    set sn=%%a
    goto :got_sn
)
:got_sn
set sn=%sn: =%
echo Serial Number: %sn% >> "%output_file%"

REM Get Model using WMIC
for /f "skip=1 delims=" %%m in ('wmic computersystem get model') do (
    set model=%%m
    goto :got_model
)
:got_model
set model=%model: =%
echo Model: %model% >> "%output_file%"

echo.
echo PC Info saved to %output_file%
pause`;

    const blob = new Blob([batContent], {type:"text/plain"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "get_pc_info.bat";
    a.click();
    URL.revokeObjectURL(url);
});

// Display initial assets
display();
