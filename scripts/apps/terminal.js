const op = document.apps.terminal.push;

document.apps.terminal.push = function(...p) {
  op.apply(this, p);
  
  for (const id of p) {
    if (typeof id === "string") terminalWin(id);
  }
};

function terminalWin(id) {
  const el = document.getElementById(id);
  const cont = document.getElementById(`${id}-cont`);
  if (!cont) return;

  const t = document.createElement("div");
  t.style.width = "100";
  t.style.height = "100%";
  t.style.backgroundColor = "#000000";
  cont.appendChild(t);

  const term = new Terminal({
    cursorBlink: true,
    theme: { background: "#000000", foreground: "#000000" }
  });

  term.open(t);
  term.Writeln("Please wait :)\n");

  const s = await window.os.createTerminal();
  if (!s) {
    el.remove();
    return;
  }

  s.setOnOutput((c) => term.write(c));
  term.onData((d) => s.write(d));

  const close = document.querySelector(`#${id} .nav .close`);
  close.addEventListener("click", (ev) => {
    s.destroy();
    term.dispose();
    el.remove();
  });
}