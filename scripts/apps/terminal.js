import { Terminal } from "https://cdn.jsdelivr.net/npm/@xterm/xterm@5.5.0/+esm";

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
  cont.appendChild(t);

  let s;
  let dest = false;

  window.lib.init(() => {
    const term = new window.hterm.Terminal();
    term.getPrefs().set("background-color", "#000000");
    term.getPrefs().set("foreground-color", "#ffffff");
    term.getPrefs().set("cursor-color", "#ffffff");
    term.decorate(t);

  function cl() {
    if (dest) return;
    
    el?.remove();
    dest = true;
    term?.uninstallKeyboard();
    term.getPrefs().resetAll();
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

  term.onTerminalReady = async () => {
    const io = term.io.push();

  try {
    s = await window.os.createTerminal();

    if (dest) {
      s?.destroy();
      return;
    }

    if (!s && !dest) {
      io.writeUTF8("\r\nCouldn't get a terminal session. Maybe there's none available :c\r\nThis window will autoclose in 3seconds...");
      setTimeout(() => {
        if (dest) return;
        cl();
      }, 3000);
      return;
    }

    io.onVTKeystroke = (b) => {
      if (!dest) s.write(b);
    };

    io.sendString = (b) => {
      if (!dest) s.write(b);
    };

    s.setOnOutput(c => { if (!dest) io.writeUTF8(c) });
    io.writeUTF8("\r\nTerminal ready!\r\nWelcome to the VeryOS terminal :D\r\n");
  } catch (e) {
    console.error(e);
    if (!dest && term ) io.writeUTF8("\r\nSomething went wrong :(\r\n");
    else if (el.isConnected) alert("Something went wrong ;c");
  }
  }
  });
}