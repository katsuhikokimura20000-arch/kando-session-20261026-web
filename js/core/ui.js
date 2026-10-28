(function () {
  'use strict';
  const KS = window.KS, DK = KS.deck, U = KS.U, WD = KS.world;
  const UI = (KS.ui = {});
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  const plain = (s) => String(s || '').replace(/[{}^]|\(\(|\)\)/g, '').replace(/\n/g, ' ');

  let hud = null, hudOn = true, lastSecKey = null;
  function buildHud() {
    const root = $('L-hud');
    if (!root) return;
    root.innerHTML = '<div id="hud-sec"></div><div id="hud-no"><span id="hud-pips"></span><span id="hud-num"></span></div><div id="hud-bar"><i></i></div><div id="toast"></div><div id="numbuf"></div>';
    hud = { root, sec: $('hud-sec'), no: $('hud-no'), num: $('hud-num'), pips: $('hud-pips'), bar: root.querySelector('#hud-bar i') };
  }

  let cueBusy = null, cueLast = null, cueT = 0;
  function updCue(force) {
    if (!hud || KS.params.export) return;
    const t = performance.now();
    if (!force && t - cueT < 100) return;
    cueT = t;
    const S = DK.S, busy = DK.busy(), last = !!S && DK.beat >= DK.beatsOf(S.def);
    if (busy === cueBusy && last === cueLast) return;
    cueBusy = busy;
    cueLast = last;
    hud.no.classList.toggle('busy', busy);
    hud.no.classList.toggle('last', last);
  }
  function updHud(st) {
    if (!hud || st.index < 0) return;
    const d = DK.list[st.index];
    hud.root.classList.toggle('off', !hudOn || !d || d.hud === false);
    const key = st.qa != null ? 'qa' : String(st.sec);
    if (key !== lastSecKey) {
      lastSecKey = key;
      const html = st.qa != null ? '<b>FAQ</b>よくある質問'
        : st.sec > 0 ? '<b>' + String(st.sec).padStart(2, '0') + '</b>' + esc(st.secLabel) : esc(st.secLabel);
      hud.sec.classList.remove('in');
      void hud.sec.offsetWidth;
      hud.sec.innerHTML = html;
      hud.sec.classList.add('in');
    }
    hud.num.textContent = st.qa != null ? (st.qa ? 'FAQ ' + String(st.qa).padStart(2, '0') : 'FAQ') : st.n != null ? st.n + ' / ' + st.total : '';
    if (!KS.params.export) {
      let h = '';
      if (st.beats > 1) for (let k = 1; k <= st.beats; k++) h += '<i class="' + (k < st.beat ? 'on' : k === st.beat ? 'on cur' : '') + '"></i>';
      hud.pips.innerHTML = h;
      updCue(true);
    }
    const p = st.qa != null ? 1 : st.n != null && st.total > 1 ? (st.n - 1) / (st.total - 1) : 0;
    hud.bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
  }
  let toastT = 0;
  function toast(msg, sec = 2.4) {
    const el = $('toast');
    if (!el || KS.params.export) return;
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(() => el.classList.remove('on'), sec * 1000);
  }
  UI.toast = toast;
  KS.on('toast', (m) => toast(m));

  let numbuf = '', numT = 0;
  function showNum() {
    const el = $('numbuf');
    if (!el) return;
    el.innerHTML = numbuf ? 'ページ <b>' + esc(numbuf) + '</b> へ　<i>Enter</i>' : '';
    el.classList.toggle('on', !!numbuf);
    clearTimeout(numT);
    if (numbuf) numT = setTimeout(clearNum, 4000);
  }
  function clearNum() {
    numbuf = '';
    showNum();
  }

  let open = null;
  let idxSel = -1;
  const KEYS = [
    ['→ ↓ Space Enter PageDown / クリック', '次へ'],
    ['← ↑ Backspace PageUp / 右クリック', '戻る'],
    ['Shift + → / ←', 'ページ単位で移動'],
    ['数字 + Enter', 'ページ番号へ移動'],
    ['Home / End', '最初 / むすび'],
    ['G / Tab', '目次'],
    ['Q', 'FAQ（よくある質問）⇄ 本編'],
    ['FAQ内：数字 1〜9・0・-・^ / カード', 'FAQ 1〜12へ（0＝10、-＝11、^＝12）'],
    ['右下の点・ページ番号', '暗い＝演出中／明るい＝次の段あり／金色＝次でページが進む'],
    ['B / .', 'ブラックアウト'],
    ['F', '全画面'],
    ['K', '決めフレーム（PDFと同じ静止画）'],
    ['S', '配信向け表示（粒子のちらつき抑制）の切替'],
    ['N', 'ページ番号の表示切替'],
    ['H / ?', 'このヘルプ'],
  ];
  function buildOverlays() {
    const ui = $('ui');
    if (!ui) return;
    ui.innerHTML = '<div id="idx" class="ov"></div><div id="help" class="ov"></div>';
    $('help').innerHTML =
      '<div class="panel"><div class="ttl">操作</div><table>' +
      KEYS.map((k) => '<tr><th>' + esc(k[0]) + '</th><td>' + esc(k[1]) + '</td></tr>').join('') +
      '</table><div class="foot">KS ' + esc(KS.version) + ' · 描画 ' + esc(WD.tier) + (WD.renderer ? ' · ' + esc(WD.renderer.slice(0, 64)) : '') + '</div></div>';
    $('idx').addEventListener('click', (e) => {
      e.stopPropagation();
      const a = e.target.closest('[data-i]');
      if (a) pick(+a.dataset.i);
      else if (!e.target.closest('.panel')) closeOv();
    });
    $('help').addEventListener('click', (e) => {
      e.stopPropagation();
      closeOv();
    });
  }
  function fillIndex() {
    let h = '<div class="panel wide"><div class="ttl">目次</div><div class="cols">';
    for (const sec of KS.SECTIONS) {
      const items = DK.list.filter((d) => (sec.id === 'qa' ? d.qa != null : d.qa == null && d.sec === sec.id));
      if (!items.length) continue;
      h += '<div class="sec"><div class="sh">' + (typeof sec.id === 'number' && sec.id > 0 ? '<b>' + String(sec.id).padStart(2, '0') + '</b>' : '') + esc(sec.label) + '</div>';
      for (const d of items) {
        const no = d.qa != null ? (!d.qa ? '—' : DK.qaFirst(d.qa) === d ? String(d.qa).padStart(2, '0') : '') : d.no != null ? d.no : '·';
        h += '<a data-i="' + d.index + '"' + (d.index === DK.cur ? ' class="cur"' : '') + '><b>' + no + '</b>' + esc(plain(d.title || d.id)) + '</a>';
      }
      h += '</div>';
    }
    $('idx').innerHTML = h + '</div></div>';
    idxSel = DK.cur;
    markSel();
  }
  function markSel() {
    const el = $('idx');
    el.querySelectorAll('a.sel').forEach((a) => a.classList.remove('sel'));
    const a = el.querySelector('a[data-i="' + idxSel + '"]');
    if (a) {
      a.classList.add('sel');
      if (a.scrollIntoView) a.scrollIntoView({ block: 'nearest' });
    }
  }
  function pick(i) {
    closeOv();
    DK.goto(i);
  }
  function openOv(name) {
    if (KS.params.export) return;
    if (open === name) return closeOv();
    closeOv();
    if (name === 'idx') fillIndex();
    open = name;
    $(name).classList.add('on');
    $('ui').classList.add('on');
  }
  function closeOv() {
    if (!open) return;
    $(open).classList.remove('on');
    $('ui').classList.remove('on');
    open = null;
  }
  function idxKey(e) {
    const k = e.key, n = DK.list.length;
    if (k === 'ArrowDown' || k === 'ArrowRight') idxSel = Math.min(n - 1, idxSel + 1);
    else if (k === 'ArrowUp' || k === 'ArrowLeft') idxSel = Math.max(0, idxSel - 1);
    else if (k === 'Enter' || k === ' ') return pick(idxSel);
    else if (k === 'Escape' || k === 'g' || k === 'G' || k === 'Tab') return closeOv();
    else return;
    markSel();
  }

  function fullscreen() {
    const d = document;
    if (d.fullscreenElement) d.exitFullscreen().catch(() => 0);
    else if (d.documentElement.requestFullscreen) d.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => 0);
  }
  function toggleSafe() {
    WD.safe = !WD.safe;
    toast(WD.safe ? '配信向け表示：オン（ちらつき抑制）' : '配信向け表示：オフ（フィルム調）');
  }

  const NEXT = ['ArrowRight', 'ArrowDown', ' ', 'PageDown', 'Enter'];
  const PREV = ['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'];
  function onKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    if (k === 'Shift' || k === 'Control' || k === 'Alt' || k === 'Meta') return;
    if (DK.previewing) {
      e.preventDefault();
      DK.preview(false);
      return;
    }
    if (open === 'help') {
      e.preventDefault();
      closeOv();
      return;
    }
    if (open === 'idx') {
      e.preventDefault();
      idxKey(e);
      return;
    }
    if (DK.key(e)) {
      e.preventDefault();
      return;
    }
    if (/^[0-9]$/.test(k)) {
      e.preventDefault();
      if (numbuf.length < 3) numbuf += k;
      showNum();
      return;
    }
    if (numbuf && (k === 'Enter' || k === 'Escape' || k === 'Backspace')) {
      e.preventDefault();
      if (k === 'Backspace') {
        numbuf = numbuf.slice(0, -1);
        return showNum();
      }
      const n = parseInt(numbuf, 10);
      clearNum();
      if (k === 'Escape') return;
      const d = DK.byNo(n);
      if (d) DK.goto(d.index);
      else toast('ページ ' + n + ' はありません');
      return;
    }
    if (NEXT.indexOf(k) >= 0 || PREV.indexOf(k) >= 0) {
      e.preventDefault();
      if (e.repeat) return;
      if (DK.black) return DK.blackout(false);
      const fwd = NEXT.indexOf(k) >= 0;
      if (e.shiftKey && k !== ' ' && k !== 'Enter') fwd ? DK.nextScene() : DK.prevScene();
      else fwd ? DK.next() : DK.prev();
      return;
    }
    let done = true;
    switch (k) {
      case 'Home': DK.home(); break;
      case 'End': DK.end(); break;
      case 'b': case 'B': case '.': DK.blackout(); break;
      case 'f': case 'F': fullscreen(); break;
      case 'k': case 'K': DK.preview(true); break;
      case 's': case 'S': toggleSafe(); break;
      case 'n': case 'N':
        hudOn = !hudOn;
        updHud(DK.state());
        break;
      case 'g': case 'G': case 'Tab': openOv('idx'); break;
      case 'q': case 'Q': DK.toggleQA(); break;
      case 'h': case 'H': case '?': openOv('help'); break;
      case 'Escape': closeOv(); break;
      default: done = false;
    }
    if (done) e.preventDefault();
  }
  UI.key = onKey;

  function bindPointer() {
    window.addEventListener('click', (e) => {
      if (e.button !== 0 || open) return;
      if (DK.previewing) return void DK.preview(false);
      const nav = e.target.closest && e.target.closest('[data-nav]');
      if (nav) return void DK.nav(nav.dataset.nav);
      if (DK.black) return void DK.blackout(false);
      DK.next();
    });
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (open) return closeOv();
      if (DK.previewing) return void DK.preview(false);
      if (DK.black) return void DK.blackout(false);
      DK.prev();
    });

    const side = (e) => e.button === 3 || e.button === 4;
    window.addEventListener('mousedown', (e) => side(e) && e.preventDefault());
    window.addEventListener('auxclick', (e) => side(e) && e.preventDefault());
    window.addEventListener('mouseup', (e) => {
      if (side(e)) {
        e.preventDefault();
        e.button === 4 ? DK.next() : DK.prev();
      }
    });
    let x0 = 0, y0 = 0;
    window.addEventListener('touchstart', (e) => {
      const t = e.changedTouches[0];
      x0 = t.clientX;
      y0 = t.clientY;
    }, { passive: true });
    window.addEventListener('touchend', (e) => {
      if (open) return;
      const t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0;
      const nav = e.target.closest && e.target.closest('[data-nav]');
      e.preventDefault();
      if (DK.previewing) return void DK.preview(false);
      if (nav && Math.hypot(dx, dy) < 12) return void DK.nav(nav.dataset.nav);
      if (DK.black) return void DK.blackout(false);
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) dx < 0 ? DK.next() : DK.prev();
      else if (Math.hypot(dx, dy) < 12) DK.next();
    }, { passive: false });

    let curT = 0;
    const wake = () => {
      document.body.classList.remove('nocur');
      clearTimeout(curT);
      curT = setTimeout(() => document.body.classList.add('nocur'), 1800);
    };
    window.addEventListener('mousemove', wake);
    wake();
  }

  UI.init = () => {
    buildHud();
    if (KS.params.export) return;
    buildOverlays();
    window.addEventListener('keydown', onKey);
    bindPointer();
    KS.on('change', (st) => {
      updHud(st);
      if (open === 'idx') fillIndex();
    });
    KS.on('frame', () => updCue(false));
    KS.on('preview', (on) => toast(on ? '決めフレーム（任意のキーで戻る）' : 'ライブ表示に戻りました', on ? 3 : 1.6));
  };

})();
