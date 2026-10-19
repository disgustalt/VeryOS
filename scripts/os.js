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
    url: "https://cdn.jsdelivr.net/gh/disgustalt/VeryOS@v1.0.0/alpine.ext4"
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

async function initOS() {
  ltxt.textContent = "Starting...";
  if (os.ready) return;

  os.fs.instance = await window.db.get("osfs");
    
  if (!os.fs.instance) {
    ltxt.innerText = "Loading filesystem...";
    try {
      const res = await fetch(os.fs.url);
      if (!res.ok) {
        ltxt.style.color = "red";
        ltxt.textContent = "Loading failed: 1" + res.status + res.statusText;
        os.err = true;
        return;
      }

      const tsize = Number(res.headers.get("Content-Length")) || 0;
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
        ltxt.textContent = `Downloading filesystem... (${cmb}MB/${tmb}MB)`
      }
      const osfs = new Blob(ch);
      os.fs.instance = await osfs.arrayBuffer();
      await window.db.set("osfs", os.fs.instance);
      os.fs.size = Math.round( os.fs.instance.byteLength / 1048576 );
    } catch (osfse) {
      ltxt.style.color = "red";
      ltxt.textContent = "Loading failed" + osfse;
      os.err = true;
      console.log(osfse);
    }
  } else {
    os.fs.size = Math.round(os.fs.instance.byteLength / 1024 / 1024);
  }

  if (os.err) return;

  if (!os.wasm.instance) {
    try {
      const oswasm = await fetch("https://copy.sh/v86/build/v86.wasm");
      os.wasm.instance = await oswasm.arrayBuffer();
      await window.db.set("oswasm", os.wasm.instance);
    } catch (oswasme) {
      console.log(oswasme);
    }
  }

  if (os.err) return;

  if (!os.bios.instance) {
    try {
      const osbios = await fetch("https://copy.sh/v86/bios/seabios.bin");
      os.bios.instance = await osbios.arrayBuffer();
      await window.db.set("osbios", os.bios.instance);
    } catch (osbiose) {
      console.log(osbiose);
    }
  }

  if (os.err) return;

  if (!os.bios.vga.instance) {
    try {
      const osvga = await fetch("https://copy.sh/v86/bios/vgabios.bin");
      os.bios.vga.instance = await osvga.arrayBuffer();
      await window.db.set("osvga", os.bios.vga.instance);
    } catch (osvgae) {
      console.log(osvgae);
    }
  }

  if (os.err) return;

  try {
    os.bios.url = URL.createObjectURL(os.bios.instance);
    os.bios.vga.url = URL.createObjectURL(os.bios.vga.instance);
    os.wasm.url = URL.createObjectURL(os.wasm.instance);
  
    os.instance = new window.V86({
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
        os.ready = true;
        setInterval(async () => {
          if (os.instance) {
            await window.db.set("osfs", os.fs.instance);
          }
        }, 10000);
      } catch (fsse) {
        console.log(fsse);
      }
    });
  } catch (ose) {
    console.log(ose);
    os.ready = false;
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
    os.serialSessions[sid].onOutput(String.fromCharCode(byte));
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
  return new Promise(resolve => {
    if (os.ready) resolve();
    else setTimeout(() => osready().then(resolve), 100);
  });
}

window.os = {
  ready: false,
  instance: null,
  fs: { expand: fsexpand },
  onready: osready,
  createTerminal
};

initOS().then(() => { 
  window.os.instance = os.instance; 
  window.os.ready = os.ready; 
});