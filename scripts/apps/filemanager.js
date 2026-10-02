const op = document.apps.files.push;

document.apps.files.push = function(...p) {
  op.apply(this, p);
  
  for (const id of p) {
    if (typeof id === "string") filesWin(id);
  }
};

async function filesWin(id) {
  const cont = document.getElementById(`${id}-cont`);
  const files = await window.db.get("files");
  let fhtml = "";
  
  for (const file of files) {
    if (file.name) {
      fhtml += `<li><img src="./img/icons/filemanager.svg"><p class="fname">${file.name}</p><p style="color: rgba(255, 255, 255, 0.3);padding: 0 7px;">-</p><p class="fsize">${file.size}</p></li>`;
    }
  }
  
  cont.innerHTML = `
    ${fhtml ? "<ul>" + fhtml + "</ul>" : "No files."}
  `;
}