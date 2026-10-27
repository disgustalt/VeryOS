import { Terminal } from "https://cdn.jsdelivr.net/npm/@xterm/xterm@5.5.0/+esm";

let win = false;
const op = document.apps.terminal.push;

document.apps.terminal.push = function (...p) {
  const result = op.apply(this, p);

  for (const id of p) {
    if (typeof id === "string") {
      terminalWin(id).catch(console.error);
    }
  }

  return result;
};

async function terminalWin(id) {
  const el = document.getElementById(id);
  const cont = document.getElementById(`${id}-cont`);

  if (!el || !cont) return;

  if (win) {
    el.remove();

    const ind = document.apps.terminal.indexOf(id);
    if (ind !== -1) document.apps.terminal.splice(ind, 1);

    alert("Only one terminal is allowed at a time :)");
    return;
  }

  win = true;

  let s;
  let term;
  let input;
  let dest = false;

  try {
    cont.replaceChildren();

    const t = document.createElement("div");
    Object.assign(t.style, {
      width: "100%",
      height: "100%",
      minHeight: "0",
      overflow: "hidden"
    });

    cont.appendChild(t);

    term = new Terminal({
      cursorBlink: true,
      convertEol: true,
      scrollOnUserInput: true,
      scrollback: 5000,
      fontFamily: "monospace",
      fontSize: 14,
      theme: {
        background: "#080d16",
        foreground: "#b8f7c5",
        cursor: "#b8f7c5",
        selectionBackground: "#294b3b"
      }
    });

    term.open(t);
    term.focus();

    s = await window.os.createTerminal();

    if (dest || !el.isConnected) {
      s.destroy();
      term.dispose();
      return;
    }

    s.setOnOutput(data => {
      if (!dest) term.write(data, () => {
        term.scrollToBottom();
      });
    });

    input = term.onData(data => {
      if (!dest) s.write(data);
    });

    const close = el.querySelector(".nav .close");

    function cl() {
      if (dest) return;
      dest = true;

      input?.dispose();
      s?.destroy();
      term?.dispose();

      el.remove();

      const ind = document.apps.terminal.indexOf(id);
      if (ind !== -1) document.apps.terminal.splice(ind, 1);

      win = false;
    }

    close?.addEventListener("click", cl);
  } catch (e) {
    dest = true;
    input?.dispose();
    s?.destroy();
    term?.dispose();
    el.remove();
    win = false;
    throw e;
  }
}
