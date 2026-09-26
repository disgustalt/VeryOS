windowListener("win-test")

function windowListener(id) {
  const pos = { 1: 0, 2: 0, 3: 0, 4: 0 };
  const el = document.getElementById(id);
  
  if (!el) return;

  el.onmousedown = holdWin;
  el.addEventListener('touchstart', holdWin, { passive: false });
  
  function holdWin(e) {
    e.preventDefault();
    
    pos[3] = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    pos[4] = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;

    if (e.type === "mousedown") {
      document.onmouseup = stopWinDrag;
      document.onmousemove = winDrag;
    } else {
      document.addEventListener("touchend", stopWinDrag);
      document.addEventListener("touchmobe", winDrag, { passive: false });
    }
  }

  function winDrag(e) {
    e.preventDefault();
    
    pos[1] = pos[3] - e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    pos[2] = pos[4] - e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    pos[3] = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    pos[4] = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    el.style.left = (el.offsetLeft - pos[1]) + "px";
    el.style.top = (el.offsetTop - pos[2]) + "px";
  }

  function stopWinDrag(e) {
    e.preventDefault();
    document.onmouseup = null;
    document.onmousemove = null;
    document.removeEventListener("touchend", stopWinDrag);
    document.removeEventListener("touchmove", winDrag);
  }
}