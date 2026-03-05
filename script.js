let assets = JSON.parse(localStorage.getItem("assets")) || [];

function save(){
localStorage.setItem("assets", JSON.stringify(assets));
display();
}

function addAsset(){

let asset = {
id: document.getElementById("assetId").value,
device: document.getElementById("device").value,
brand: document.getElementById("brand").value,
serial: document.getElementById("serial").value,
user: document.getElementById("user").value
};

assets.push(asset);
save();
clearForm();
}

function display(){

let table = document.querySelector("#assetTable tbody");
table.innerHTML="";

assets.forEach((a,i)=>{

let row = `
<tr>
<td>${a.id}</td>
<td>${a.device}</td>
<td>${a.brand}</td>
<td>${a.serial}</td>
<td>${a.user}</td>
<td><button onclick="deleteAsset(${i})">Delete</button></td>
</tr>
`;

table.innerHTML += row;

});
}

function deleteAsset(i){
assets.splice(i,1);
save();
}

function clearForm(){
document.getElementById("assetId").value="";
document.getElementById("device").value="";
document.getElementById("brand").value="";
document.getElementById("serial").value="";
document.getElementById("user").value="";
}

function searchAsset(){

let filter = document.getElementById("search").value.toLowerCase();
let rows = document.querySelectorAll("#assetTable tbody tr");

rows.forEach(row=>{
row.style.display = row.innerText.toLowerCase().includes(filter) ? "" : "none";
});

}

function exportCSV(){

let csv = "AssetID,Device,Brand,Serial,User\n";

assets.forEach(a=>{
csv += `${a.id},${a.device},${a.brand},${a.serial},${a.user}\n`;
});

let blob = new Blob([csv]);
let url = URL.createObjectURL(blob);

let a = document.createElement("a");
a.href=url;
a.download="assets.csv";
a.click();

}

display();