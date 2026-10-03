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
      fhtml += `<li data-id=${file.id}><img src="./img/icons/filemanager.svg"><p class="fname">${file.name}</p><p style="color: rgba(255, 255, 255, 0.3);padding: 0 7px;">-</p><p class="fsize">${file.size}</p></li>`;
    }
  }
  
  cont.innerHTML = `
    ${fhtml ? "<ul>" + fhtml + "</ul>" : "No files."}
  `;

  const ulel = cont.querySelector("ul");
  const flist = ulel.querySelectorAll(":scope > li");

  for (const fileel of flist) {
    file.addEventListener("click", (e) => {
      e.preventDefault();
      
      const fileid = fileel.dataset.id;
      if (!fileid) return alert("Hmm...couldn't find that");

      const file = window.db.get(`file:${fileid}`);

      if (!file || file instanceof Blob) return alert("Hmm...couldn't find that");

      const finfo = files.find(f => f.id === fileid);

      document.body.insertAdjacentHTML("beforeend", `
        <div class="window" id="${id}">
          <div class="nav">
            <img src="./img/icons/filemanager.svg" class="icon">
            <p class="name">
              File Viewer | ${finfo.name}
            </p>
            <div class="ctrls">
              <div class="min">
                -
              </div>
              <div class="full">
                &#9633
              </div>
              <div class="close">
                &times;
              </div>
            </div>
          </div>
          <div class="cont" id="${id}-cont">
          </div>
        </div>
      `);
    });

    const winid = `win-${app}-${Date.now()}`;
    
  }
}