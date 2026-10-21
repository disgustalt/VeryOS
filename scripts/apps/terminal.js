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

  const term = new Terminal({
    cursorBlink: true,
    theme: { background: "#000000", foreground: "#ffffff", cursor: "#ffffff" }
  });

  term.open(t);
  term.write("Please wait :)\n");

  let s;
  let dest = false;

  function cl() {
    if (dest) return;
    
    el?.remove();
    dest = true;
    term?.dispose();
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
    s = await window.os.createTerminal();

    if (dest) {
      s?.destroy();
      return;
    }

    if (!s && !dest) {
      term.write("Coudn't get a terminal session. Maybe there's none available :c\nThis window will autoclose in 3seconds...");
      setTimeout(() => {
        if (dest) return;
        cl();
      }, 3000);
      return;
    }

    s.setOnOutput(c => { if (!dest) term.write(c) });
    term.onData(d => { if (!dest) s.write(d) });
    term.write("\r\nTerminal ready!\nWelcome to the VeryOS terminal :D\r\n");
  } catch (e) {
    console.error(e);
    if (!dest && term ) term.write("\r\nSomething went wrong :(\r\n");
    else if (el.isConnected) alert("Something went wrong ;c");
  }
}