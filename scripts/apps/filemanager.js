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
      fhtml += `<li data-id="${file.id}"><img src="./img/icons/filemanager.svg"><p class="fname">${file.name}</p><p style="color: rgba(255, 255, 255, 0.3);padding: 0 7px;">-</p><p class="fsize">${file.size}</p></li>`;
    }
  }
  
  cont.innerHTML = `
    ${fhtml ? "<ul>" + fhtml + "</ul>" : "No files."}
  `;

  const ulel = cont.querySelector("ul");
  if (!ulel) return alert("Hmm...couldn't find that");
  const flist = ulel.querySelectorAll(":scope > li");

  for (const fileel of flist) {
    fileel.addEventListener("click", async (e) => {
      e.preventDefault();
      
      const fileid = fileel.dataset.id;
      if (!fileid) return alert("Hmm...couldn't find that");

      const blob = await window.db.get(`file:${fileid}`);

      if (!blob || !(blob instanceof Blob)) return alert("Hmm...couldn't find that");

      const finfo = files.find(f => f.id === fileid);
      if (!finfo) return alert("Hmm...couldn't find that");
      const winid = `win-filev-${Date.now()}`;

      let fileview;
      let furl;
      if (finfo.mime.startsWith("image/")) {
        furl = URL.createObjectURL(blob);
        fileview = `
          <img src=${furl} style="width: 100%; height: 100%; object-fit: contain;">
        `;
      }

      document.body.insertAdjacentHTML("beforeend", `
        <div class="window" id="${winid}">
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
          <div class="cont" id="${winid}-cont">
            ${fileview}
          </div>
        </div>
      `);
      filevListener(winid, furl);
    });
  }
}

function filevListener(id, furl) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0, posx, posy;
  const el = document.getElementById(id);
  if (!el) return;

  const targ = el.querySelector(".nav");

  targ.onmousedown = holdWin;
  targ.addEventListener('touchstart', holdWin, { passive: false });

  const winclose = el.querySelector(":scope .nav .ctrls .close");
  winclose.addEventListener("click", winClose);
  
  function holdWin(e) {
    if (e.target.closest(".ctrls")) return;
    
    const cordx = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const cordy = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    pos3 = cordx;
    pos4 = cordy;
    pos1 = el.offsetTop;
    pos2 = el.offsetLeft;

    if (e.type === "mousedown") {
      document.onmouseup = stopWinDrag;
      document.onmousemove = winDrag;
    } else {
      document.addEventListener("touchend", stopWinDrag);
      document.addEventListener("touchmove", winDrag, { passive: false });
    }
  }

  function winDrag(e) {
    e.preventDefault();
    
    const cordx = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const cordy = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    posx = cordx;
    posy = cordy;
    
    el.style.left = pos2 + (posx - pos3) + "px";
    el.style.top = pos1 + (posy - pos4) + "px";
  }

  function stopWinDrag(e) {
    document.onmouseup = null;
    document.onmousemove = null;
    document.removeEventListener("touchend", stopWinDrag);
    document.removeEventListener("touchmove", winDrag);
  }

  function winClose(e) {
    e.preventDefault();
    if (el._clVid) el._clVid();
    el.remove();
    if (furl) URL.revokeObjectURL(furl);
  }
}