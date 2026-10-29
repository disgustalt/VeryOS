import { default as cfg } from "/config.js";

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
    url: "https://api.disgustalt.qzz.io/veryos/file/alpine2.ext4"
  },
  bios: {
    url: null,
    instance: null,
    vga: {
      url: null,
      instance: null
    }
  },
  cdrom: {
    instance: null,
    url: null
  },
  kernel: {
    instance: null,
    url: null
  },
  serialSessions: {}
};

const lbar = document.getElementById("loadbar");
const ltxt = document.getElementById("loadtxt");
const lmain = document.getElementById("mainloader");

async function download(url, ttl, prog) {
  const dl = {
    downloaded: 0,
    total: 0,
    chunks: [],
    done: false
  };

  const maxr = cfg.dl.retries.max;
  let ret = 0;
  let total = ttl || 0;

  while (!total || dl.downloaded < total) {
    let read;
    try {
      const res = await fetch(url, {
        headers: {
          Range: `bytes=${dl.downloaded}-`
        }
      });

      if (!res.ok || res.status !== 206) throw new Error(`failed to dl ${url}: ${res.status}`);

      const range = res.headers?.get("content-range");
      const len = res.headers?.get("content-length");

      if (range) {
        const rm = range.match(/^bytes (\d+)-(\d+)\/(\d+)$/);
        
        if (!rm || Number(rm[1]) !== dl.downloaded) throw new Error(`error in dl: bad content range: ${range}`);

        total = Number(rm[3]) || total;
      } else if (!dl.downloaded) {
        total = Number(res.headers?.get("content-length")) || total;
      }

      dl.total = total;
      read = res.body?.getReader();

      while (true) {
        const { done, value } = await read?.read();
        if (done) break;

        dl.chunks.push(value);
        dl.downloaded += value?.byteLength;
        prog?.(dl);
      }

      if (total && dl.downloaded < total) throw new Error(`dl ended before full download: ${dl.downloaded}/${total}`);

      dl.done = true;
      return dl;
    } catch (dle) {
      try {
        await read?.cancel();
      } catch {}

      if (ret >= maxr) throw new Error(`dl failed after ${dl.downloaded}: ${dle.message}`);

      ret++;
      await new Promise(resolve => setTimeout(resolve, cfg.dl?.retries.delay(ret)));
    }
  }

  dl.done = true;
  return dl;
}

async function initOS() {
  ltxt.textContent = "Starting...";

  if (os.ready) return;

  try {
    os.fs.instance = await window.db.get("osfs2");
    os.wasm.instance = await window.db.get("oswasm2");
    os.bios.instance = await window.db.get("osbios2");
    os.bios.vga.instance = await window.db.get("osvga2");
    os.cdrom.instance = await window.db.get("oscdrom13");
    os.kernel.instance = await window.db.get("oskernel5");
  } catch (dbre) {
    os.err = true;
    ltxt.style.color = "red";
    ltxt.textContent = "Failed to read db :(";
    console.error(dbre);
    return;
  }

  if (!os.fs.instance) {
    ltxt.textContent = "Loading filesystem...";

    try {
      const res = await download(os.fs.url, 134217728, (dl) => {
        const cmb = (dl.downloaded / 1048576).toFixed(1);
        const tmb = (dl.total / 1048576).toFixed(1);
        ltxt.textContent = `Downloading filesystem... (${cmb}MB/${tmb}MB)`;
        lbar.style.width = Math.min(77, (dl.downloaded / dl.total) * 77) + "%";
      });

      const osfs = new Blob(res.chunks);
      os.fs.instance = await osfs.arrayBuffer();

      await window.db.set("osfs2", os.fs.instance);

      os.fs.size = Math.round(os.fs.instance.byteLength / 1048576);
    } catch (osfse) {
      ltxt.style.color = "red";
      ltxt.textContent = "Failed to load filesystem, please try again later :(";
      os.err = true;
      console.error(osfse);
    }
  } else {
    os.fs.size = Math.round(os.fs.instance.byteLength / 1048576);
    lbar.style.width = "77%";
  }

  if (os.err) return;

  if (!os.cdrom.instance) {
    ltxt.textContent = "Loading cdrom...";

    try {
      const res = await download("https://api.disgustalt.qzz.io/veryos/file/TinyCore-11.0-pfs.iso?v=7", null, (dl) => {
        const cmb = (dl.downloaded / 1048576).toFixed(1);
        const tmb = (dl.total / 1048576).toFixed(1);
        ltxt.textContent = `Downloading cdrom... (${cmb}MB/${tmb}MB)`;
        lbar.style.width = Math.min(91, (dl.downloaded / dl.total) * 14 + 77) + "%";
      });
      const oscdrom = new Blob(res.chunks);
      os.cdrom.instance = await oscdrom.arrayBuffer();

      await window.db.set("oscdrom13", os.cdrom.instance);
    } catch (oscdrome) {
      ltxt.style.color = "red";
      ltxt.textContent = "Failed to load cdrom, please try again later :(";
      console.error(oscdrome);
      os.err = true;
    }
  } else {
    lbar.style.width = "91%";
  }

  if (os.err) return;

  if (!os.wasm.instance) {
    ltxt.textContent = "Loading v86 wasm file...";

    try {
      const res = await download("https://api.disgustalt.qzz.io/veryos/file/v86.wasm", null, (dl) => {
        const cmb = (dl.downloaded / 1048576).toFixed(1);
        const tmb = (dl.total / 1048576).toFixed(1);
        ltxt.textContent = `Downloading wasm file... (${cmb}MB/${tmb}MB)`;
        lbar.style.width = Math.min(93, Math.round((dl.downloaded / dl.total) * 2 + 91)) + "%";
      });

      const oswasm = new Blob(res.chunks);
      os.wasm.instance = await oswasm.arrayBuffer();

      await window.db.set("oswasm2", os.wasm.instance);
    } catch (oswasme) {
      ltxt.style.color = "red";
      ltxt.textContent = "Failed to load v86 wasm file, please try again later :(";
      console.error(oswasme);
      os.err = true;
    }
  } else {
    lbar.style.width = "93%";
  }

  if (os.err) return;

  if (!os.bios.instance) {
    ltxt.textContent = "Loading bios...";

    try {
      const res = await download("https://api.disgustalt.qzz.io/veryos/file/seabios.bin", null, (dl) => {
        const cmb = (dl.downloaded / 1048576).toFixed(1);
        const tmb = (dl.total / 1048576).toFixed(1);
        ltxt.textContent = `Downloading bios... (${cmb}MB/${tmb}MB)`;
        lbar.style.width = Math.min(94, Math.round((dl.downloaded / dl.total) * 1 + 93)) + "%";
      });

      const osbios = new Blob(res.chunks);
      os.bios.instance = await osbios.arrayBuffer();

      await window.db.set("osbios2", os.bios.instance);
    } catch (osbiose) {
      ltxt.style.color = "red";
      ltxt.textContent = "Failed to load bios, please try again later :(";
      console.error(osbiose);
      os.err = true;
    }
  } else {
    lbar.style.width = "94%";
  }

  if (os.err) return;

  if (!os.bios.vga.instance) {
    ltxt.textContent = "Loading vga bios...";

    try {
      const res = await download("https://api.disgustalt.qzz.io/veryos/file/vgabios.bin", null, (dl) => {
        const cmb = (dl.downloaded / 1048576).toFixed(1);
        const tmb = (dl.total / 1048576).toFixed(1);
        ltxt.textContent = `Downloading vga bios... (${cmb}MB/${tmb}MB)`;
        lbar.style.width = Math.min(95, Math.round((dl.downloaded / dl.total) * 1 + 94)) + "%";
      });

      const osvga = new Blob(res.chunks);
      os.bios.vga.instance = await osvga.arrayBuffer();

      await window.db.set("osvga2", os.bios.vga.instance);
    } catch (osvgae) {
      ltxt.style.color = "red";
      ltxt.textContent = "Failed to load vga bios, please try again later :(";
      console.error(osvgae);
      os.err = true;
    }
  } else {
    lbar.style.width = "95%";
  }

  if (os.err) return;

  if (!os.kernel.instance) {
    ltxt.textContent = "Loading kernel...";

    try {
      const res = await download("https://api.disgustalt.qzz.io/veryos/file/vmlinuz-lts", null, (dl) => {
        const cmb = (dl.downloaded / 1048576).toFixed(1);
        const tmb = (dl.total / 1048576).toFixed(1);
        ltxt.textContent = `Downloading kernel... (${cmb}MB/${tmb}MB)`;
        lbar.style.width = Math.min(99, Math.round((dl.downloaded / dl.total) * 4 + 95)) + "%";
      });

      const oskernel = new Blob(res.chunks);
      os.kernel.instance = await oskernel.arrayBuffer();

      await window.db.set("oskernel5", os.kernel.instance);
    } catch (oskernele) {
      ltxt.style.color = "red";
      ltxt.textContent = "Failed to load kernel, please try again later :(";
      console.error(oskernele);
      os.err = true;
    }
  } else {
    lbar.style.width = "99%";
  }

  if (os.err) return;

  try {
    console.log(os.fs.instance?.constructor?.type + " | " + os.fs.instance?.byteLength);
    ltxt.textContent = "Starting OS...";
    os.wasm.url = URL.createObjectURL(
      new Blob([os.wasm.instance], { type: "application/wasm" })
    );

    os.instance = new V86({
      wasm_path: os.wasm.url,
      memory_size: 512 * 1024 * 1024,
      vga_memory_size: 8 * 1024 * 1024,
      screen_container: document.getElementById("osscreen"),
      bios: {
        buffer: os.bios.instance
      },
      vga_bios: {
        buffer: os.bios.vga.instance
      },
      cdrom: {
        buffer: os.cdrom.instance,
        async: true
      },
      hda: {
        buffer: os.fs?.instance,
        async: true
      },
      boot_order: 0x213,
      autostart: true,
      fastboot: true,
      network_relay_url: "wss://relay.widgetry.org/",
      use_graphical_text: true,
      serial0: {
        on_output: (b) => serialout(0, b)
      },
      serial1: {
        on_output: (b) => serialout(1, b)
      },
      serial2: {
        on_output: (b) => serialout(2, b)
      },
      serial3: {
        on_output: (b) => serialout(3, b)
      }
    });

    os.instance.add_listener("emulator-ready", () => {
      window.os.ready = true;
      os.ready = true;
      const osscreen = document.getElementById("osscreen");
      const disp = document.getElementById("loaddisp");
      osscreen.hidden = false;
      disp.appendChild(osscreen);

      const txtch = setInterval(() => {
        const vgatxt = osscreen?.textContent || osscreen?.innerText || osscreen?.innerHTML;
        const readtxt = /core is distributed with absolutely no warranty/i.test(vgatxt);
        if (readtxt) {
          console.log(readtxt);
          clearInterval(txtch);
          setTimeout(() => {
            console.log("hda:", os.instance.v86?.cpu?.devices?.hda);
            console.log("device:", Object.keys(os.instance.v86?.cpu?.devices || {}));
            lmain.style.display = "none";
          }, 1000);
        }
      }, 1000);

      setInterval(async () => {
        if (os.instance && os.fs.instance) {
          try {
            await window.db.set("osfs2", os.fs.instance);
          } catch (e) {
            console.error(e);
          }
        }
      }, 10000);
    });
  } catch (ose) {
    ltxt.style.color = "red";
    ltxt.textContent = "Couldn't start the OS, please try again later :((";
    console.error(ose);
    os.ready = false;
    os.err = true;
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

  await window.db.set("osfs2", os.fs.instance);
  os.fs.size = fssize;

  os.instance.serial1_send("resize2fs /dev/sda\n");
}

function serialout(port, byte) {
  const sid = `serial${port}`;

  if (os.serialSessions[sid]) {
    if (typeof os.serialSessions[sid].onOutput === "function") {
      os.serialSessions[sid].onOutput(String.fromCharCode(byte));
    }
  }
}

async function createTerminal() {
  await osready();

  const b = os.instance?.bus || os.instance?.s;

  if (!b) throw new Error("event bus unavailable");

  let onout = null;
  let dest = false;
  const enc = new TextEncoder();

  const h = (byte) => {
    if (dest || !onout) return;
    onout(String.fromCharCode(byte));
  }

  b.register("serial0-output-byte", h);

  return {
    write(d) {
      if (dest) return;

      for (const byte of enc.encode(d)) {
        b.send("serial0-input", byte);
      }
    },
    setOnOutput(cb) {
      onout = cb;
    },
    destroy() {
      if (dest) return;
      dest = true;
      b.unregister("serial0-output-byte", h);
      onout = null;
    }
  }
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
  fs: {
    expand: fsexpand
  },
  onready: osready,
  createTerminal
};

initOS()
  .catch((inite) => {
    os.err = true;
    os.ready = false;
    ltxt.textContent = "Initializing failed :c";
    ltxt.style.color = "red";
    console.error(inite);
  })
  .finally(() => {
    window.os.instance = os.instance;
    window.os.ready = os.ready;
  });