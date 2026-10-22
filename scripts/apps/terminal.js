const scr = document.getElementById("osscreen");
const par = scr?.parentElement;
const nxt = scr?.nextSibling;
let win = false;
const op = document.apps.terminal.push;

document.apps.terminal.push = function(...p) {
  const result = op.apply(this, p);
  
  for (const id of p) {
    if (typeof id === "string") terminalWin(id).catch(console.error);
  }

  return result;
};

async function terminalWin(id) {
  const el = document.getElementById(id);
  const cont = document.getElementById(`${id}-cont`);
  if (!cont || !el || !scr) return;
  
  if (win) {
    if (cont || el) el?.remove();
    return alert("Only one terminal is allowed at a time :)");
  }

  win = true;

  scr?.hideen = false;
  scr?.style?.display = "block";
  scr?.style?.width = "100%";
  scr?.style?.height = "100%";
  
  cont.appendChild(scr);

  scr.tabIndex = 0;
  scr?.focus();

  let dest = false;

  function cl() {
    if (dest) return;
    
    el?.remove();
    dest = true;
    win = false;
    if (par) {
      if (nxt?.parentNode === par) {
        par?.insertBefore(scr, nxt);
      } else {
        par?.appendChild(scr);
      }
    }

    scr?.style.display = "none";
    scr?.hidden = true;
    
    const ind = document.apps["terminal"].indexOf(id);

    if (ind !== -1) {
      document.apps["terminal"].splice(ind, 1);
    }
  }

  const close = document.querySelector(`#${id} .nav .close`);
  close?.addEventListener("click", () => {
    cl();
  });
}