(function () {
  'use strict';
  const KS = window.KS;
  if (KS.params.export) document.body.classList.add('export');
  KS.world.init({ canvas: document.getElementById('gl'), stage: document.getElementById('stage') });
  KS.ui.init();
  KS.world.start();
  KS.deck.boot();
  window.KS_READY = true;
})();
