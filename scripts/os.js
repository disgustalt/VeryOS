const os = {
  ready: false,
  instance: null,
  wasm: {
    url: "https://copy.sh/v86/build/v86.wasm"
  },
  fs: {
    seed_url: "https://github.com/disgustalt/VeryOS/releases/download/v1.0.0/alpine.ext4",
    buffer: null,
    size: 128
  },
  bios: {
    url: "https://copy.sh/v86/bios/seabios.bin",
    vga_url: "https://copy.sh/v86/bios/vgabios.bin"
  },
  serialSessions: {}
};

async function initOS() {
  if (os.ready) return;

  os.fs.buffer = await window.db.get("osfs");
    
  if (!os.fs.buffer) {
    try {
      const response = await fetch(os.fs.seed_url);
      os.fs.buffer = await response.arrayBuffer();
      await window.db.set("osfs", os.fs.buffer);
    } catch (e) {
      console.error(e);
      return;
    }
  } else {
    os.fs.size = Math.round(os.fs.buffer.byteLength / 1024 / 1024);
  }

  try {
    os.instance = new window.V86({
      wasm_path: os.wasm.url,
      memory_size: 512 * 1024 * 1024,
      vga_memory_size: 8 * 1024 * 1024,
      screen_container: document.getElementById("osscreen") || document.createElement("div"),
      bios: { url: os.bios.url },
      vga_bios: { url: os.bios.vga_url },
      hda: { buffer: os.fs.buffer },
      cmdline: "rw root=/dev/sda rootfstype=ext4 quiet",
      autostart: true,
      serial1: { on_output: (b) => serialout(1, b) },
      serial2: { on_output: (b) => serialout(2, b) }
    });

    os.instance.add_listener("emulator-ready", () => {
      os.ready = true;
      setInterval(async () => {
        if (os.instance && os.fs.buffer) {
          await window.db.set("osfs", os.fs.buffer);
        }
      }, 30000);
    });

  } catch (e) {
    console.error(e);
  }
}

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

window.os.fs.expand = async function(targetSize = 256) {
  if (!os.instance || !os.ready) return;
  if (targetSize <= os.fs.size) return;
  
  const newBuf = new ArrayBuffer(targetSize * 1024 * 1024);
  new Uint8Array(newBuf).set(new Uint8Array(os.fs.buffer));
  
  os.fs.buffer = newBuf;
  os.instance.hda.buffer = newBuf;
  await window.db.set("osfs", newBuf);
  os.fs.size = targetSize;
  
  os.instance.serial1_send("resize2fs /dev/sda\n");
};

function osready() {
  return new Promise(resolve => {
    if (os.ready) resolve();
    else setTimeout(() => osready().then(resolve), 100);
  });
}

window.os = {
  ready: false,
  instance: null,
  onready: osready,
  createTerminal
};

initOS().then(() => { 
  window.os.instance = os.instance; 
  window.os.ready = os.ready; 
});