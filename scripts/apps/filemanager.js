const op = document.apps.files.push;

document.apps.files.push = function(...p) {
  op.apply(this, p);
  
  for (const id of p) {
    if (typeof id === "string") filesWin(id);
  }
};

function filesWin(id) {
  const cont = document.getElementById(`${id}-cont`);
  const files = [{ name: "fileee", size: 1999 }, { name: "anoyher file", size: 3824 }];
  let fhtml = "";
  
  for (const file of files) {
    if (file.name) {
      fhtml += `<li>${file.name}`;
    }
  }
  
  cont.innerHTML = `
    ${fhtml ? "<ul>" + fhtml + "</ul" : "No files."}
  `;
}