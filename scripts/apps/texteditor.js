import { createIcons } from "https://esm.sh/lucide";

const op = document.apps.txtedit.push;

document.apps.txtedit.push = function(...p) {
  op.apply(this, p);

  for (const id of p) {
    if (typeof id === "string") txteditWin(id);
  }
};

async function txteditWin(id) {
  const el = document.getElementById(id);
  const cont = document.getElementById(`${id}-cont`);
  let finfo;
  let fc;

  if (!cont) {
    if (el) el.remove();
    const ind = document.apps.txtedit.indexOf(id);
    if (ind !== -1) document.apps.txtedit.splice(ind, 1);
    return;
  }

  cont.innerHTML = `
    <txtedit>
      <div class="txtedit-nav">
        <input id="${id}-name">
        <i id="${id}-save" data-lucide="save"></i>
      </div>
      <textarea id="${id}-txtedit"></textarea>
    </txtedit>
  `;

  try {
    createIcons();

    if (window.txtedit) {
      const files = await window.db.get("files");
      finfo = files ? files.find(f => f.id === window.txtedit) : null;

      if (finfo && finfo.mime !== "text/plain") {
        throw new Error("invalid file type");
      }

      if (finfo) {
        fc = await window.db.get(`file:${finfo.id}`);
      }

      window.txtedit = null;
    }

    if (!finfo) {
      finfo = {
        id: crypto.randomUUID(),
        name: `file-${Date.now()}`,
        mime: "text/plain"
      };

      fc = "";
    }

    const cel = document.getElementById(`${id}-txtedit`);
    const save = document.getElementById(`${id}-save`);
    const nel = document.getElementById(`${id}-name`);

    if (!cel || !save || !nel) {
      throw new Error("Editor elements not found");
    }

    cel.value = fc ?? "";
    nel.value = finfo.name;

    save.addEventListener("click", async (ev) => {
      try {
        ev.preventDefault();

        finfo.name = nel.value;

        let files = await window.db.get("files") || [];
        const ind = files.findIndex(f => f.id === finfo.id);

        if (ind === -1) files.push(finfo);
        else files[ind] = finfo;

        await window.db.add(`file:${finfo.id}`, cel.value);
        await window.db.add("files", files);
      } catch (se) {
        alert("Couldn't save that :/");
        console.log(se);
      }
    });

  } catch (e) {
    console.log(e);
    alert("Something went wrong :(");

    if (el) {
      el.remove();

      const ind = document.apps.txtedit.indexOf(id);
      if (ind !== -1) document.apps.txtedit.splice(ind, 1);
    }
  }
}