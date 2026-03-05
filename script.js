// Load existing assets from localStorage
let assets = JSON.parse(localStorage.getItem("assets")) || [];
let editIndex = -1; // Track which asset is being edited

// Save assets to localStorage and refresh table
function save() {
    localStorage.setItem("assets", JSON.stringify(assets));
    display();
}

// Add a new asset or update existing
function addAsset() {
    const id = document.getElementById("assetId").value.trim();
    const device = document.getElementById("device").value.trim();
    const brand = document.getElementById("brand").value.trim();
    const serial = document.getElementById("serial").value.trim();
    const user = document.getElementById("user").value.trim();

    if (!id || !device || !brand || !serial || !user) {
        alert("Please fill all fields.");
        return;
    }

    const asset = { id, device, brand, serial, user };

    if (editIndex > -1) {
        // Update existing asset
        assets[editIndex] = asset;
        editIndex = -1;
        document.querySelector("button[onclick='addAsset()']").innerText = "Add Asset";
    } else {
        assets.push(asset);
    }

    save();
    clearForm();
}

// Display all assets in table
function display() {
    const table = document.querySelector("#assetTable tbody");
    table.innerHTML = "";

    assets.forEach((a, i) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${a.id}</td>
            <td>${a.device}</td>
            <td>${a.brand}</td>
            <td>${a.serial}</td>
            <td>${a.user}</td>
            <td>
                <button onclick="editAsset(${i})">Edit</button>
                <button onclick="deleteAsset(${i})">Delete</button>
            </td>
        `;
        table.appendChild(row);
    });
}

// Edit asset
function editAsset(i) {
    const a = assets[i];
    document.getElementById("assetId").value = a.id;
    document.getElementById("device").value = a.device;
    document.getElementById("brand").value = a.brand;
    document.getElementById("serial").value = a.serial;
    document.getElementById("user").value = a.user;

    editIndex = i;
    document.querySelector("button[onclick='addAsset()']").innerText = "Update Asset";
}

// Delete asset
function deleteAsset(i) {
    if (confirm("Are you sure you want to delete this asset?")) {
        assets.splice(i, 1);
        save();
    }
}

// Clear form
function clearForm() {
    document.getElementById("assetId").value = "";
    document.getElementById("device").value = "";
    document.getElementById("brand").value = "";
    document.getElementById("serial").value = "";
    document.getElementById("user").value = "";

    editIndex = -1;
    document.querySelector("button[onclick='addAsset()']").innerText = "Add Asset";
}

// Search assets
function searchAsset() {
    const filter = document.getElementById("search").value.toLowerCase();
    const rows = document.querySelectorAll("#assetTable tbody tr");

    rows.forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(filter) ? "" : "none";
    });
}

// Export assets as CSV
function exportCSV() {
    if (assets.length === 0) {
        alert("No assets to export.");
        return;
    }

    let csv = "AssetID,Device,Brand,Serial,User\n";
    assets.forEach(a => {
        csv += `${a.id},${a.device},${a.brand},${a.serial},${a.user}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "assets.csv";
    a.click();
}

// Import PC info from your custom .txt file
function importTxt() {
    const fileInput = document.getElementById("importFile");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a .txt file.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
        const lines = e.target.result
            .split(/\r?\n/)
            .map(l => l.trim())
            .filter(l => l !== "");

        let asset = { id: "", device: "", brand: "", serial: "", user: "" };
        let count = 0;

        lines.forEach(line => {
            if (line.toLowerCase().startsWith("hostname:")) {
                asset.device = line.split(":")[1].trim();
                asset.id = asset.device; // Use hostname as ID
            } else if (line.toLowerCase().startsWith("serial number:")) {
                const serial = line.split(":")[1].trim();
                if (serial) {
                    asset.serial = serial;
                    if (asset.device && asset.serial) {
                        // Update existing asset if same ID
                        const existingIndex = assets.findIndex(a => a.id === asset.id);
                        if (existingIndex > -1) {
                            assets[existingIndex] = { ...asset };
                        } else {
                            assets.push({ ...asset });
                        }
                        count++;
                        asset = { id: "", device: "", brand: "", serial: "", user: "" };
                    }
                }
            }
        });

        save();
        fileInput.value = "";
        alert(`${count} assets imported successfully!`);
    };

    reader.onerror = function() {
        alert("Error reading file.");
    };

    reader.readAsText(file);
}

// Initial display
display();
