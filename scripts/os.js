const os = {
  err: false,
  ready: false,
  instance: null,
  wasm: {
    instance: null,
    url: null
  },
  fs: {
    instance: null,
    size: 128,
    url: "https://api.disgustalt.qzz.io/veryos/file/alpine.ext4"
  },
  bios: {
    url: null,
    instance: null,
    vga: {
      url: null,
      instance: null
    }
  },
  serialSessions: {}
};

const lbar = document.getElementById("loadbar");
const ltxt = document.getElementById("loadtxt");
const lmain = document.getElementById("mainloader");

async function initOS() {
  ltxt.textContent = "Starting...";
  if (os.ready) return;

  try {
    os.fs.instance = await window.db.get("osfs");
    os.wasm.instance = await window.db.get("oswasm");
    os.bios.instance = await window.db.get("osbios");
    os.bios.vga.instance = await window.db.get("osvga");
  } catch (dbre) {
    os.err = true;
    ltxt.style.color = "red";
    ltxt.textContent = "Failed to read db :(";
    return;
  }
    
  if (!os.fs.instance) {
    ltxt.innerText = "Loading filesystem...";
    try {
      const res = await fetch(os.fs.url);
      if (!res.ok) {
        ltxt.style.color = "red";
        ltxt.textContent = "Failed to load filesystem, please try again later :(";
        os.err = true;
        return;
      }

      const tsize = 134217728;
      const rd = res.body.getReader();
      const ch = [];
      let rsize = 0;

      while (true) {
        const { done, value } = await rd.read();
        if (done) break;

        ch.push(value);
        rsize += value.byteLength;
        const cmb = (rsize / 1048576).toFixed(1);
        const tmb = tsize ? (tsize / 1048576).toFixed(1) : "?";
        ltxt.textContent = `Downloading filesystem... (${cmb}MB/${tmb}MB)`;
        lbar.style.width = Math.round((rsize / tsize) * 20) + "%";
      }
      const osfs = new Blob(ch);
      os.fs.instance = await osfs.arrayBuffer();
      await window.db.set("osfs", os.fs.instance);
      os.fs.size = Math.round( os.fs.instance.byteLength / 1048576 );
    } catch (osfse) {
      ltxt.style.color = "red";
      ltxt.textContent = "Failed to load filesystem, please try again later :(";
      os.err = true;
      console.log(osfse);
    }
  } else {
    os.fs.size = Math.round(os.fs.instance.byteLength / 1024 / 1024);
    lbar.style.width = "20%";
  }

  if (os.err) return;

  if (!os.wasm.instance) {
    ltxt.textContent = "Loading v86 wasm file...";
    try {
      const res = await fetch("https://copy.sh/v86/build/v86.wasm");
      if (!res.ok) {
        ltxt.style.color = "red";
        ltxt.textContent = "Failed to load v86 wasm file, please try again later :(";
        os.err = true;
        return;
      }

      const tsize = Number(res?.headers?.get("Content-Length")) || 0;
      const ch = [];
      const rd = res.body.getReader();
      let rsize = 0;

      while (true) {
        const { done, value } = await rd.read();
        if (done) break;

        ch.push(value);
        rsize += value.byteLength;
        const tmb = (tsize / 1048576).toFixed(1);
        const cmb = (rsize / 1048576).toFixed(1);
        ltxt.textContent = `Downloading v86 wasm file... (${cmb}MB/${tmb}MB)`;
        lbar.style.width = Math.round((rsize / tsize) * 20 + 20) + "%";
      }

      const oswasm = new Blob(ch);
      os.wasm.instance = await oswasm.arrayBuffer();
      await window.db.set("oswasm", os.wasm.instance);
    } catch (oswasme) {
      ltxt.style.color = "red";
      ltxt.textContent = "Failed to load v86 wasm file, please try again later :c"
      console.log(oswasme);
      os.err = true;
    }
  } else lbar.style.width = "40%";

  if (os.err) return;

  if (!os.bios.instance) {
    ltxt.textContent = "Loading bios...";
    try {
      const res = await fetch("https://copy.sh/v86/bios/seabios.bin");
      if (!res.ok) {
        ltxt.style.color = "red";
        ltxt.textContent = "Failed to load bios, please try again later :(";
        os.err = true;
        return;
      }

      const tsize = Number(res?.headers?.get("Content-Length")) || 0;
      const ch = [];
      const rd = res.body.getReader();
      let rsize = 0;

      while (true) {
        const { done, value } = await rd.read();
        if (done) break;

        ch.push(value);
        rsize += value.byteLength;
        const tmb = (tsize / 1048576).toFixed(1);
        const cmb = (rsize / 1048576).toFixed(1);
        ltxt.textContent = `Downloading bios... (${cmb}MB/${tmb}MB)`;
        lbar.style.width = Math.round((rsize / tsize) * 20 + 40) + "%";
      }

      const osbios = new Blob(ch);
      os.bios.instance = await osbios.arrayBuffer();
      await window.db.set("osbios", os.bios.instance);
    } catch (osbiose) {
      ltxt.style.color = "red";
      ltxt.textContent = "Failed to load bios, please try again later :c"
      console.log(osbiose);
      os.err = true;
    }
  } else lbar.style.width = "60%";

  if (os.err) return;

  if (!os.bios.vga.instance) {
    ltxt.textContent = "Loading vga bios...";
    try {
      const res = await fetch("https://copy.sh/v86/bios/vgabios.bin");
      if (!res.ok) {
        ltxt.style.color = "red";
        ltxt.textContent = "Failed to load vga bios, please try again later :(";
        os.err = true;
        return;
      }

      const tsize = Number(res?.headers?.get("Content-Length")) || 0;
      const ch = [];
      const rd = res.body.getReader();
      let rsize = 0;

      while (true) {
        const { done, value } = await rd.read();
        if (done) break;

        ch.push(value);
        rsize += value.byteLength;
        const tmb = (tsize / 1048576).toFixed(1);
        const cmb = (rsize / 1048576).toFixed(1);
        ltxt.textContent = `Downloading vga bios... (${cmb}MB/${tmb}MB)`;
        lbar.style.width = Math.round((rsize / tsize) * 20 + 60) + "%";
      }

      const osvga = new Blob(ch);
      os.bios.vga.instance = await osvga.arrayBuffer();
      await window.db.set("osvga", os.bios.vga.instance);
    } catch (osvgae) {
      ltxt.style.color = "red";
      ltxt.textContent = "Failed to load vga bios, please try again later :c"
      console.log(osvgae);
      os.err = true;
    }
  } else lbar.style.width = "80%";

  if (os.err) return;

  try {
    ltxt.textContent = "Starting OS..."
    os.bios.url = URL.createObjectURL(new Blob([os.bios.instance]));
    os.bios.vga.url = URL.createObjectURL(new Blob([os.bios.vga.instance]));
    os.wasm.url = URL.createObjectURL(new Blob([os.wasm.instance], { type: "application/wasm" }));
  
    os.instance = new V86({
      wasm_path: os.wasm.url,
      memory_size: 512 * 1024 * 1024,
      vga_memory_size: 8 * 1024 * 1024,
      screen_container: document.getElementById("osscreen"),
      bios: {
        url: os.bios.url
      },
      vga_bios: {
        url: os.bios.vga.url
      },
      hda: {
        buffer: os.fs.instance
      },
      cmdline: "rw root=/dev/sda rootfstype=ext4 quiet",
      autostart: true,
      serial1: {
        on_output: (b) => serialout(1, b)
      },
      serial2: {
        on_output: (b) => serialout(2, b)
      },
    });

    os.instance.add_listener("emulator-ready", () => {
      try {
        lbar.style.width = "100%";
        window.os.ready = true;
        os.ready = true;
        
        setTimeout(() => {
          lmain.style.display = "none";
        }, 1000);
        
        setInterval(async () => {
          if (os.instance) {
            try {
              await window.db.set("osfs", os.fs.instance);
            } catch {}
          }
        }, 10000);
      } catch (fsse) {
        console.log(fsse);
      }
    });
  } catch (ose) {
    ltxt.style.color = "red";
    ltxt.textContent = "Couldn't start the OS, please try again later :((";
    console.log(ose);
    os.ready = false;
    os.err = true
  }
}

async function fsexpand(fssize = 256) {
  if (!os.instance || !os.ready) {
    console.error("os isnt ready :p");
    return;
  }

  if (fssize <= os.fs.size) {
    console.log("size too smol");
    return;
  }
  
  const newfs = new ArrayBuffer(fssize * 1024 * 1024);
  const view = new Uint8Array(newfs);
  view.set(new Uint8Array(os.fs.instance));
  
  os.fs.instance = newfs;
  os.instance.hda.buffer = newfs; 
  await window.db.set("osfs", os.fs.instance);
  os.fs.size = fssize;

  os.instance.serial1_send("resize2fs /dev/sda\n");
};

function serialout(port, byte) {
  const sid = `serial${port}`;
  
  if (os.serialSessions[sid]) {
    if (typeof os.serialSessions[sid]?.onOutput === "function") {
      os.serialSessions[sid].onOutput(String.fromCharCode(byte));
    }
  }
}

async function createTerminal() {
  await osready();
  
  let port = 1;
  while (os.serialSessions[`serial${port}`]) {
    port++;
    if (port > 2) return null;
  }

  const sid = `serial${port}`;
  os.serialSessions[sid] = {
    write: (data) => os.instance[`serial${port}_send`](data),
    onOutput: null
  };

  return {
    write: (data) => os.serialSessions[sid].write(data),
    setOnOutput: (cb) => { os.serialSessions[sid].onOutput = cb; },
    destroy: () => {
      os.serialSessions[sid].write("exit\n");
      delete os.serialSessions[sid];
    }
  };
}

function osready() {
  return new Promise((resolve, reject) => {
    function osr() {
      if (os.ready) {
        resolve();
      } else if (os.err) {
        reject(new Error("kaboom (failed)"));
      } else {
        setTimeout(osr, 100);
      }
    }

    osr();
  });
}

window.os = {
  ready: false,
  instance: null,
  fs: { expand: fsexpand },
  onready: osready,
  createTerminal
};

initOS().catch(inite => {
  os.err = true;
  os.ready = false;
  ltxt.textContent = "Initializing faiked :c";
  ltxt.style.color = "red";
}).finally(() => {
  window.os.instance = os.instance; 
  window.os.ready = os.ready;
});