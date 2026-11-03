(function () {
  var t = document.getElementById('toast'), timer;
  function say(m) { t.textContent = m; t.className = 'on'; clearTimeout(timer); timer = setTimeout(function () { t.className = ''; }, 1800); }
  document.addEventListener('click', function (e) {
    var el = e.target;
    if (el.closest('#tb')) return;
    var g = el.closest('.opt:not(.off),.rd');
    if (g && !el.closest('button,a,input,select')) {
      [].forEach.call(g.parentElement.children, function (c) { if (c.matches('.opt,.rd')) c.classList.remove('sel'); });
      g.classList.add('sel'); return;
    }
    var sg = el.closest('.seg span');
    if (sg) { [].forEach.call(sg.parentElement.children, function (c) { c.classList.remove('a'); }); sg.classList.add('a'); return; }
    var sw = el.closest('.sw');
    if (sw) { sw.style.opacity = sw.style.opacity === '0.4' ? '1' : '0.4'; return; }
    var b = el.closest('button:not([disabled]),a[href="#"],.btn2');
    if (b) { e.preventDefault(); say('Mockup: "' + b.textContent.trim().replace(/\s+/g, ' ').slice(0, 40) + '" diklik'); }
  });
})();
