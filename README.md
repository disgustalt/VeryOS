Note: the minimise/maximum buttons are **not** supposed to work. They're *currently* just decorations.

# VeryOS
A web OS that has a Camera and filesystem(ish)!

---

# Contents
- [Yap (About)](#yapp)
- [Running it yourself](#running-it-yourself)

---

## Yapp
VeryOS is a WebOS that currently has a Camera and a 'filesystem' (not rly lol)

The 'filesystem' uses [idb-keyval](https://www.npmjs.com/package/idb-keyval) to store files as kv blobs, and just fetches them whenever they're needed.
The file info is stored in the `files` key, and the file blobs themself are stored as `file:{id}`.

That's all I think lol :p

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


The page should be live at `http://localhost:8080/index.html`!


### That's all! :v