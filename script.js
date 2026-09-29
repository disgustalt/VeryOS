document.apps = {
  files: [],
  camera: []
}

const apps = {
  files: {
    name: "File Manager",
    icon: "./img/icons/filemanager.svg"
  },
  camera: {
    name: "Camera",
    icon: "./img/icons/camera.svg"
  }
}

function windowListener(id, appid) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
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
    const ind = document.apps[appid].indexOf(id);

    if (ind !== -1) {
      document.apps[appid].splice(ind, 1);
    }
  }
}

function appListener(app) {
  const el = document.getElementById(`app-${app}`);

  if (!el) return;

  el.addEventListener("click", (e) => {
    e.preventDefault();
    const winid = `win-${app}-${Date.now()}`;
    createWindow(winid, app);
  });
}

function createWindow(id, appid) {
  const app = apps[appid];

  switch(appid) {
    case "files":
      document.body.insertAdjacentHTML("beforeend", `
        <div class="window" id="${id}">
          <div class="nav">
            <img src="${app.icon}" class="icon">
            <p class="name">
              ${app.name}
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

      document.apps.files.push(id);
      break;

    case "camera":
      document.body.insertAdjacentHTML("beforeend", `
        <div class="window" id="${id}">
          <div class="nav">
            <img src="${app.icon}" class="icon">
            <p class="name">
              ${app.name}
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

      document.apps.camera.push(id);
      break;
  }
  windowListener(id, appid);
}

appListener("files");
appListener("camera");

