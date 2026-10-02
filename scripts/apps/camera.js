const op = document.apps.camera.push;

document.apps.camera.push = async function(...p) {
  op.apply(this, p);
  
  for (const id of p) {
    if (typeof id === "string") await camWin(id);
  }
};

async function camWin(id) {
  let vid;
  let face = 0;
  
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
    vid = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment"
      }
    });

    el._clVid = () => vid.getTracks().forEach(t => t.stop());

    cont.innerHTML = `<cam><video autoplay playsinline class="camfeed"></video><button class="camtake"></button><button class="camgall"><img src="./img/icons/gallery.svg"></button><button class="camface"><img src="./img/icons/change.svg"></button><canvas id="pic" hidden></canvas></cam>`;
    const videl = cont.querySelector(".camfeed");
    videl.srcObject = vid;

    gallListener();
    capListener();
    faceListener();

    function capListener() {
      const c = cont.querySelector("#pic");
      const main = cont.querySelector(".camtake");
      
      main.addEventListener("click", async(e) => {
        e.preventDefault();
        c.width = videl.videoWidth;
        c.height = videl.videoHeight;
        const ctx = c.getContext("2d");

        ctx.drawImage(videl, 0, 0, c.width, c.height);

        const img = await new Promise(resolve => c.toBlob(resolve, "image/jpeg"));;

        const imgid = crypto.randomUUID();  
        const imgn = `img-${new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()).replace(/[^0-9]/g, '-')}.jpg`  

        await window.db.add(`file:${imgid}`, img);  
        let files = await window.db.get("files");  
        if (!files) {  
          files = [{ id: imgid, name: imgn, mime: "image/jpeg" }];  
        } else {  
          files.push({ id: imgid, name: imgn, mime: "image/jpeg" });  
        }  
        await window.db.add("files", files);  
      });
    }

    function gallListener() {
      const main = cont.querySelector(".camgall");
      main.addEventListener("click", (e) => {
        e.preventDefault();
        const winid = `win-files-${Date.now()}`;
        
        createWindow(winid, "files");
      });
    }

    function faceListener() {
      const main = cont.querySelector(".camface");

      main.addEventListener("click", async (e) => {
        e.preventDefault();
      
        const nFace = face ? "environment" : "user";
        const oVid = vid;
        
        oVid.getTracks().forEach(t => t.stop());
        
        try {
          const nVid = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: nFace
            }
          });

          vid = nVid;
          videl.srcObject = vid;
          face = face ? 0 : 1;
          
          if (videl.paused) {
            videl.play().catch(() => {});
          }
        } catch (e) {
          alert("Something went wrong :(");
          console.log(e);
          
          try {
            const nvid2 = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: face ? "environment" : "user" }
            });
            vid = nvid2;
            videl.srcObject = vid;
            if (videl.paused) videl.play().catch(() => {});
          } catch (e) {
            console.log(e);
            alert("Something went wrong ;)")
          }
        }
      });
    }
  } catch (e) {
    console.log(e);
    const ind = document.apps["camera"].indexOf(id);

    if (ind !== -1) {
      document.apps["camera"].splice(ind, 1);
    }  
    
    if (perm.state !== "granted") {
      alert("Camera permission needed for camera app to work :(");
      el.remove();
      return;
    }
    
    alert("Hmm...something went wrong");
  }
}