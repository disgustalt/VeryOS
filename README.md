Note: the minimise/maximum buttons are **not** supposed to work. They're *currently* just decorations.

# VeryOS
A web OS that has a Camera and filesystem(ish)!

---

# Contents
- [Yap (About)](#yapp)
- [What's New](#whats-new)
- [Running it yourself](#running-it-yourself)

---

## Yapp
VeryOS is a WebOS that currently has a Camera and a 'filesystem

The 'filesystem' uses [idb-keyval](https://www.npmjs.com/package/idb-keyval) to store files as kv blobs, and just fetches them whenever they're needed.
The file info is stored in the `files` key, and the file blobs themself are stored as `file:{id}`.
It also uses an actual filesystem, which is available through the terminal app.

The page runs TinyCore Linux, which us accessible through the terminal app.

You can install packages using `tce-load` (32-bit packages)

Example:
```bash
tce-load -wi nano
```

You **cannot** install packages as root, so you'll have to switch to another user first.

Switch to the tc user using:
```bash
su - tc
```

All packages are persisted, along with files in /home.

That's all I think lol :p


## What's new?
- The website now runs an actual OS.
- A working terminal you can rum Linux commands in.
- A persistent filesystem in the OS.
- Better downloading.
- Boot logs on loader page.


## Running it Yourself
It's pretty simple to run the page yourself since it just serves static files ;)

For starters, install Python if you haven't already (pretty unlikely):
**Linux**
```bash
apt install python git
```

**Windows**
```powershell
winget install -e --id Python.Python.3; `
winget install -e --id Git.Git;
```

Clone this repository:
```bash
git clone https://github.com/disgustalt/VeryOS.git
```

Move to directory:
**Linux**
```bash
cd ./VeryOS
```

**Windows**
```powershell
cd .\VeryOS
```

Serve the page:
```bash
python -m http.server 8080
```

You can edit [this file](/config.js) to configure some stuff like download retries.
```javascript
export default {
  dl: { /* downloading related settings */
    retries: {
      max: 20, /* maximum retries before throwing an error */
      delay: (r) => { return Math.min(r * 500, 5000) } /* gets a delay (between retries) that increases with retries (max is 5 secs) */
    }
  }
};
```

The page should be live at `http://localhost:8080/index.html`!


### That's all! :v