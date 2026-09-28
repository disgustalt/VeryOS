const op = document.apps.camera.push;

document.apps.camera.push = function(...p) {
  op.apply(this, p);
  
  for (const id of p) {
    if (typeof id === "string") filesWin(id);
  }
};

async function camWin(id) {
  const el = document.getElementById(id);
  const cont = document.getElementById(`${id}-cont`);
  
  const perm = await navigator.permissions.query({
    name: "camera"
  });

  if (perm.state === "denied") {
    el.remove();
    alert("Camera app needs camera permission :(");
    return;
  }

  try {
    const vid = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment"
      }
    });

    cont.innerHTML = `<video autoplay playsinline class="camfeed"></video>`;
    const videl = cont.querySelector(".camfeed");
    videl.srcObject = vid;
  } catch (e) {
    if (perm.state !== "granted") return alert("Camera permission needed for camera app to work :(");
    alert("Hmm...something went wrong");
  }
}