import { WTerm } from "https://esm.sh/@wterm/dom?bundle";

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
  if (!cont || !el) return;

  const t = document.createElement("div");
  t.style.width = "100%";
  t.style.height = "100%";
  t.style.backgroundColor = "#000000";
  t.style.color = "#ffffff";
  cont.appendChild(t);

  let term;
  let s;
  let dest = false;

  function cl() {
    if (dest) return;
    
    el?.remove();
    dest = true;
    term?.destroy();
    s?.destroy();
    
    const ind = document.apps["terminal"].indexOf(id);

    if (ind !== -1) {
      document.apps["terminal"].splice(ind, 1);
    }
  }

  const close = document.querySelector(`#${id} .nav .close`);
  close?.addEventListener("click", () => {
    cl();
  });

  try {
    term = new WTerm(t, {
      autoResize: true,
      cursorBlinl: true,
      onData(d) {
        if (!dest && s) s?.write(d);
      }
    });

    await term.init();

    if (dest) {
      term?.destroy();
      return;
    }

    s = await window.os.createTerminal();

    if (!s && !dest) {
      term.write("\r\nCouldn't get a terminal session. Maybe there's none available :c\r\nThis window will autoclose in 3seconds...");
      setTimeout(() => {
        if (dest) return;
        cl();
      }, 3000);
      return;
    }

    s.setOnOutput(c => { if (!dest) term.write(c) });
    term.focus();
    term.write("\r\nTerminal ready!\r\nWelcome to the VeryOS terminal :D\r\n");
  } catch (e) {
    console.error(e);
    if (!dest && term ) term.write("\r\nSomething went wrong :(\r\n");
    else if (el.isConnected) alert("Something went wrong ;c");
  }
}