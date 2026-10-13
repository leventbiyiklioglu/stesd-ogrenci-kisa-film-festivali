/* STESD oylama - ortak yardımcılar (TEST) */
(function () {
  function el(t, o, k) {
    var e = document.createElement(t);
    if (o) for (var a in o) { if (a === 'text') e.textContent = o[a]; else if (a === 'class') e.className = o[a]; else e.setAttribute(a, o[a]); }
    (k || []).forEach(function (c) { if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  async function api(yol, secenek) {
    var r;
    try { r = await fetch(yol, Object.assign({ credentials: 'same-origin' }, secenek || {})); }
    catch (x) { throw new Error('Sunucuya ulaşılamadı. Siteyi SinemaDernegi-baslat.bat ile açtığınızdan emin olun.'); }
    var d = null;
    try { d = await r.json(); } catch (x) { }
    if (!d) throw new Error('Sunucudan beklenmeyen yanıt geldi (' + r.status + ').');
    d._durum = r.status;
    return d;
  }
  function post(yol, govde) {
    return api(yol, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(govde) });
  }
  // YouTube / Vimeo bağlantısından güvenli gömme adresi çıkarır; olmazsa null.
  function videoAdresi(url) {
    if (!url) return null;
    var u;
    try { u = new URL(String(url).trim()); } catch (x) { return null; }
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    var h = u.hostname.toLowerCase().replace(/^www\.|^m\./, ''), id = null, m;
    if (h === 'youtu.be') { m = u.pathname.match(/^\/([\w-]{11})$/); id = m && m[1]; }
    else if (h === 'youtube.com' || h === 'youtube-nocookie.com') {
      if (u.pathname === '/watch') { id = u.searchParams.get('v'); }
      else { m = u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})$/); id = m && m[1]; }
    }
    if (id !== null && /^[\w-]{11}$/.test(id || '')) return 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0';
    if (h === 'vimeo.com' || h === 'player.vimeo.com') {
      m = u.pathname.match(/^\/(?:video\/)?(\d+)(?:\/([\w]+))?$/);
      if (m) return 'https://player.vimeo.com/video/' + m[1] + (m[2] ? '?h=' + m[2] : (u.searchParams.get('h') ? '?h=' + encodeURIComponent(u.searchParams.get('h')) : ''));
    }
    return null;
  }
  function oynaticiKur(kap, film) {
    kap.textContent = '';
    var src = videoAdresi(film.video);
    if (!src) { kap.appendChild(el('div', { class: 'video-yok', text: 'Video bağlantısı yok' })); return; }
    var f = el('iframe', { src: src, title: film.baslik || 'Film', allow: 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen', allowfullscreen: '', referrerpolicy: 'strict-origin-when-cross-origin' });
    kap.appendChild(el('div', { class: 'video-kutu' }, [f]));
  }
  function bilgi(film) {
    var p = [film.yonetmen, film.universite].filter(Boolean).join(' · ');
    var q = [film.tur, film.sure ? film.sure + ' dk' : ''].filter(Boolean).join(' · ');
    return [p, q];
  }
  function kart(film, ek, tikla) {
    var b = bilgi(film);
    var ic = el('div', { class: 'ic' }, [
      film.test ? el('span', { class: 'test-rozet', text: 'TEST – hayali örnek' }) : null,
      el('h3', { text: film.baslik }),
      el('div', { class: 'kucuk', text: b[0] }),
      el('div', { class: 'kucuk', text: b[1] }),
      ek
    ]);
    var k = el('button', { type: 'button', class: 'film-kart', 'data-id': film.id }, [el('div', { class: 'afis', text: '▶' }), ic]);
    k.addEventListener('click', tikla);
    return k;
  }
  function mesaj(e, metin, tur) { e.textContent = metin || ''; e.className = 'mesaj' + (tur ? ' ' + tur : ''); }
  window.STESD = { el: el, api: api, post: post, videoAdresi: videoAdresi, oynaticiKur: oynaticiKur, bilgi: bilgi, kart: kart, mesaj: mesaj };
})();
