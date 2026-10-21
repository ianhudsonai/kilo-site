// The landing page's words in both languages, the language switch, and the waitlist forms (the hero box and the closing box share
// this code). The forms call the same waitlist function the old /lista page did, with the same fields and messages.
// The consent line and the button label must stay word for word: the database records that people agreed to that wording
// (consent version 2026-10-20 in internal.waitlist_consent_texts).
(function () {
  var TEXT = {
    pt: {
      docTitle: 'Kilo: o app de treino e dieta que aprende com você',
      docDescription: 'O Kilo sugere a carga da próxima série e, toda semana, um ajuste na sua meta pelo seu progresso real. Treino e dieta no mesmo app, grátis e sem anúncios. Em breve no iPhone: entre na lista de espera.',
      eyebrow: 'Em breve no iPhone · Grátis',
      headline: 'O app de treino e dieta que aprende com você.',
      lede: 'O Kilo sugere a carga da próxima série e, toda semana, um ajuste na sua meta pelo seu progresso real. Você só aceita.',
      phoneAlt: 'Tela de treino do Kilo: o supino da última vez, 3 séries de 60 kg, e o botão Aceitar sugestão',
      emailLabel: 'Seu e-mail',
      placeholder: 'voce@exemplo.com',
      button: 'Entrar na lista de espera',
      sending: 'Enviando…',
      consent: 'Só vamos mandar e-mail sobre o lançamento do Kilo. Você pode sair da lista quando quiser.',
      privacy: 'Privacidade',
      privacyFooter: 'Privacidade da lista de espera',
      doneTitle: 'Pronto!',
      doneText: 'Você vai ser um dos primeiros a saber quando o Kilo chegar.',
      doneLeave: 'Para sair da lista, use o link no e-mail de lançamento ou escreva para contato@kiloapp.com.br.',
      closingTitle: 'Seja um dos primeiros a usar o Kilo.',
      closingText: 'Avisamos por e-mail quando ele chegar ao iPhone. Um e-mail só, sem spam.',
      invalid: 'Confira o e-mail. Parece que falta alguma coisa.',
      busy: 'Muita gente entrando agora. Tente de novo em alguns minutos.',
      failed: 'Não deu para enviar. Confira sua internet e tente de novo.',
      toggle: 'English', toggleLang: 'en'
    },
    en: {
      docTitle: 'Kilo: the workout and diet app that learns from you',
      docDescription: 'Kilo suggests the weight for your next set and, every week, a change to your target based on your real progress. Workouts and diet in one app, free with no ads. Coming soon to iPhone: join the waitlist.',
      eyebrow: 'Coming soon to iPhone · Free',
      headline: 'The workout and diet app that learns from you.',
      lede: 'Kilo suggests the weight for your next set and, every week, a change to your target based on your real progress. You just accept.',
      phoneAlt: 'Kilo workout screen: last time\'s bench press, 3 sets of 60 kg, and the Aceitar sugestão (Accept suggestion) button',
      emailLabel: 'Your email',
      placeholder: 'you@example.com',
      button: 'Join the waitlist',
      sending: 'Sending…',
      consent: 'We will only email you about the Kilo launch. You can leave the list at any time.',
      privacy: 'Privacy',
      privacyFooter: 'Waitlist privacy',
      doneTitle: 'Done!',
      doneText: 'You will be one of the first to know when Kilo arrives.',
      doneLeave: 'To leave the list, use the link in the launch email or write to contato@kiloapp.com.br.',
      closingTitle: 'Be one of the first to use Kilo.',
      closingText: 'We will email you when it arrives on iPhone. Just one email, no spam.',
      invalid: 'Check the email. It looks like something is missing.',
      busy: 'Lots of people are joining right now. Try again in a few minutes.',
      failed: 'Could not send it. Check your connection and try again.',
      toggle: 'Português', toggleLang: 'pt-BR'
    }
  };

  var params = new URLSearchParams(location.search);
  // The tag in the link (?origem=ig-treino) says which account brought the person; the database keeps only well-formed tags.
  var origem = (params.get('origem') || '').trim().toLowerCase().slice(0, 40) || null;
  var lang = params.get('lang') === 'en' ? 'en' : 'pt';
  var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-join]'));
  var toggle = document.getElementById('lang-toggle');
  var sendingBox = null;

  function each(selector, fn) { Array.prototype.forEach.call(document.querySelectorAll(selector), fn); }

  function apply() {
    var t = TEXT[lang];
    document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR';
    document.title = t.docTitle;
    document.querySelector('meta[name=description]').setAttribute('content', t.docDescription);
    each('[data-t]', function (el) { el.textContent = t[el.getAttribute('data-t')]; });
    each('[data-t-placeholder]', function (el) { el.placeholder = t[el.getAttribute('data-t-placeholder')]; });
    each('[data-t-alt]', function (el) { el.alt = t[el.getAttribute('data-t-alt')]; });
    each('[data-privacy]', function (el) { el.href = '/lista/privacidade/' + (lang === 'en' ? '?lang=en' : ''); });
    toggle.textContent = t.toggle;
    toggle.lang = t.toggleLang;
    boxes.forEach(function (box) {
      box.querySelector('button.join').textContent = box === sendingBox ? t.sending : t.button;
      if (box.dataset.error) showError(box, box.dataset.error);
    });
  }

  function clearError(box) {
    var status = box.querySelector('.status');
    status.textContent = '';
    status.className = 'status';
    delete box.dataset.error;
    box.querySelector('input[type=email]').removeAttribute('aria-invalid');
  }

  function showError(box, key) {
    var status = box.querySelector('.status');
    status.textContent = TEXT[lang][key];
    status.className = 'status error';
    box.dataset.error = key;
    if (key === 'invalid') box.querySelector('input[type=email]').setAttribute('aria-invalid', 'true');
  }

  /** After a join, every box shows the done message, so the page never offers the form again. */
  function showDone(fromBox) {
    boxes.forEach(function (box) {
      box.querySelector('form').hidden = true;
      box.querySelector('.join-done').hidden = false;
    });
    fromBox.querySelector('.join-done').focus();
  }

  toggle.addEventListener('click', function () {
    lang = lang === 'en' ? 'pt' : 'en';
    // Keep the choice in the address, so a reload or a shared link opens in the same language.
    if (lang === 'en') params.set('lang', 'en'); else params.delete('lang');
    var query = params.toString();
    history.replaceState(null, '', location.pathname + (query ? '?' + query : '') + location.hash);
    apply();
  });

  boxes.forEach(function (box) {
    var form = box.querySelector('form');
    var email = box.querySelector('input[type=email]');
    var button = box.querySelector('button.join');
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (sendingBox) return;
      var value = email.value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) || value.length > 254) { showError(box, 'invalid'); email.focus(); return; }
      var config = window.KILO_WAITLIST || {};
      if (!config.url || !config.key) { showError(box, 'failed'); return; }
      sendingBox = box;
      button.disabled = true;
      button.textContent = TEXT[lang].sending;
      clearError(box);
      fetch(config.url + '/rest/v1/rpc/join_waitlist', {
        method: 'POST',
        headers: { 'content-type': 'application/json', apikey: config.key },
        body: JSON.stringify({ p_email: value, p_origem: origem, p_lang: lang, p_website: box.querySelector('.trap input').value })
      }).then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (body) { return { ok: response.ok, body: body }; });
      }).then(function (result) {
        if (result.ok && result.body && result.body.ok === true) { showDone(box); return; }
        var error = result.body && result.body.error;
        showError(box, error === 'invalid-email' ? 'invalid' : error === 'busy' ? 'busy' : 'failed');
      }).catch(function () {
        showError(box, 'failed');
      }).then(function () {
        sendingBox = null;
        button.disabled = false;
        button.textContent = TEXT[lang].button;
      });
    });
  });

  apply();
})();
