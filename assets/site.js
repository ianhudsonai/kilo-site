// The landing page's words in both languages, the language switch, and the waitlist forms (the hero box and the closing box share
// this code). The forms call the same waitlist function the old /lista page did, with the same fields and messages.
// The consent line and the button label must stay word for word: the database records that people agreed to that wording
// (consent version 2026-10-20 in internal.waitlist_consent_texts).
(function () {
  var TEXT = {
    pt: {
      docTitle: 'Kilo: o app de treino e dieta que aprende com você',
      docDescription: 'O Kilo sugere a carga da próxima série e, toda semana, um ajuste na sua meta pelo seu progresso real. Treino e dieta no mesmo app, grátis e sem anúncios. Em breve no iPhone: entre na lista de espera.',
      eyebrow: 'Grátis. Em breve no iPhone.',
      headline: 'O app de treino e dieta que aprende com você.',
      lede: 'O Kilo sugere a carga da próxima série e, toda semana, um ajuste na sua meta pelo seu progresso real. Você só aceita.',
      phoneAlt: 'Tela de treino do Kilo: o supino da última vez, 3 séries de 60 kg, e o botão Aceitar sugestão',
      emailLabel: 'Seu e-mail',
      placeholder: 'voce@exemplo.com',
      button: 'Entrar na lista de espera',
      sending: 'Enviando…',
      consent: 'Só vamos mandar e-mail sobre o lançamento do Kilo. Você pode sair da lista quando quiser.',
      privacy: 'Privacidade',
      privacyFooter: 'Privacidade do site e da lista', foodsFooter: 'Calorias dos alimentos', exercisesFooter: 'Como fazer os exercícios', calcFooter: 'Calculadora de calorias',
      doneTitle: 'Pronto!',
      placeTitle: 'Você é o nº\u00a0{n} da fila',
      doneText: 'Você vai ser um dos primeiros a saber quando o Kilo chegar.',
      doneLeave: 'Para sair da lista, use o link no e-mail de lançamento ou escreva para contato@kiloapp.com.br.',
      closingTitle: 'Seja um dos primeiros a usar o Kilo.',
      closingText: 'Avisamos por e-mail quando ele chegar ao iPhone. Um e-mail só, sem spam.',
      learnTitle: 'O Kilo aprende com você',
      learnIntro: 'O Kilo usa o que você registra para sugerir. Você sempre decide se aceita.',
      learn1Title: 'A carga da próxima série',
      learn1Text: 'O Kilo olha seus últimos treinos e sugere a carga de cada série de hoje. Toque em “Aceitar sugestão” e as séries já vêm preenchidas.',
      learn2Title: 'Seu gasto diário real',
      learn2Text: 'Começa com uma estimativa. Com o que você come e como seu peso muda, o Kilo aprende quanto seu corpo gasta em um dia.',
      learn3Title: 'Check-in semanal',
      learn3Text: 'Toda semana, o Kilo mostra como foi e sugere um ajuste na sua meta. Você decide se aceita.',
      screensTitle: 'Treino, comida e peso no mesmo app',
      screenTrainAlt: 'Resumo do treino no Kilo: novo recorde no supino, 62,5 kg × 8, e 2,5 kg a mais que da última vez',
      screenTrainTitle: 'Treino',
      screenTrain1: 'Carga, repetições e RIR (repetições em reserva) em cada série, com os números da última vez já preenchidos.',
      screenTrain2: 'No fim, um resumo com seus recordes e quanto você subiu em cada exercício.',
      screenFoodAlt: 'Dia de alimentação no Kilo: café da manhã com banana, ovo e pão francês, e arroz no almoço, com as calorias e os macros que faltam',
      screenFoodTitle: 'Alimentação',
      screenFood1: 'Tabela TACO e alimentos dos EUA dentro do app, com busca que funciona sem internet.',
      screenFood2: 'Seus alimentos mais usados aparecem primeiro em cada refeição, para registrar com um toque.',
      screenGoalAlt: 'Check-in semanal do Kilo: média de calorias e proteína, 7 de 7 dias registrados, tendência do peso de −0,5 kg e 2 treinos com 1 recorde novo',
      screenGoalTitle: 'Meta e peso',
      screenGoal1: 'Um check-in por semana mostra calorias, proteína, treinos e a tendência do peso, e sugere ajustes na sua meta.',
      screenGoal2: 'Registre o peso na tela inicial e veja a tendência, não só o número do dia.',
      extrasTitle: 'E mais',
      extraOfflineTitle: 'Busca sem internet', extraOffline: 'A busca de alimentos funciona sem sinal.',
      extraBarcodeTitle: 'Código de barras', extraBarcode: 'Leia o código ou busque produtos embalados.',
      extraTimerTitle: 'Descanso na Tela Bloqueada', extraTimer: 'O timer de descanso aparece na Tela Bloqueada e na Dynamic Island.',
      extraHealthTitle: 'App Saúde', extraHealth: 'Seus passos do dia vêm do app Saúde. O Kilo só lê, nunca grava nada nele.',
      extraDarkTitle: 'Modo escuro', extraDark: 'Claro ou escuro, como você preferir.',
      extraLangTitle: 'Português e inglês', extraLang: 'Nos dois idiomas, em quilos ou libras.',
      promiseTitle: 'No app: sem anúncios, sem rastreamento',
      promise1: 'O app não tem anúncios, não faz análise de uso e não rastreia você.',
      promise2: 'Comece sem cadastro, como convidado. Se criar uma conta, você pode excluí-la com seus dados dentro do app, quando quiser.',
      pricesTitle: 'Quanto custaria tudo isso?',
      pricesIntro: 'Treino e dieta que se ajustam a você costumam ser pagos. Fizemos as contas.',
      priceTrain: 'App de treino que ajusta a carga', priceTrainValue: 'R$ 200 a R$ 400 por ano',
      priceDiet: 'App de dieta que ajusta a sua meta', priceDietValue: 'R$ 400 a R$ 600 por ano',
      priceCoach: 'Personal trainer, 2 a 3 vezes por semana', priceCoachValue: 'R$ 600 a R$ 1.800 por mês',
      priceKilo: 'Kilo, com treino e dieta juntos', priceKiloValue: 'R$ 0. Sério.',
      pricesNote: 'Planos anuais na App Store do Brasil e faixas publicadas por guias de preço de personal trainer, conferidos em outubro de 2026. Um bom personal vale o que cobra; o Kilo é para quem quer registrar e evoluir por conta própria.',
      faqTitle: 'Perguntas frequentes',
      faq1Q: 'É grátis?', faq1A: 'Sim. O Kilo é grátis e não tem anúncios.',
      faq2Q: 'Quando lança?', faq2A: 'Ainda não temos data. Estamos terminando o app. Entre na lista e avisamos por e-mail quando ele chegar ao iPhone.',
      faq3Q: 'Tem para Android?', faq3A: 'Primeiro no iPhone. O Android vem depois: entre na lista e avisamos.',
      faq4Q: 'Preciso criar conta?', faq4A: 'Não. Você pode começar como convidado, sem cadastro.',
      faq5Q: 'Funciona sem internet?', faq5A: 'A busca de alimentos, sim: a tabela TACO e os alimentos dos EUA ficam dentro do app.',
      faq6Q: 'O que vocês fazem com meus dados?', faq6A: 'No app, nada de anúncios, análise de uso ou rastreamento, e o Kilo só lê do app Saúde. Neste site, contamos as visitas sem cookies e sem saber quem é você. Na lista de espera, usamos seu e-mail só para avisar do lançamento. Os detalhes estão na página de privacidade.',
      gorillaWaveAlt: 'O gorila do Kilo dando oi',
      gorillaNotesAlt: 'O gorila do Kilo de olho no seu progresso',
      gorillaPointAlt: 'O gorila do Kilo convidando você para entrar na lista',
      gorillaCheerAlt: 'O gorila do Kilo comemorando com você',
      joinBar: 'Entrar na lista',
      close: 'Fechar',
      qrAlt: 'Código QR que abre o site do Kilo no celular',
      qrTitle: 'Abra no celular',
      qrText: 'Aponte a câmera do celular para entrar na lista por lá.',
      disclaimer: 'O Kilo é uma ferramenta de registro e não substitui orientação médica ou de um nutricionista.',
      trademark: 'Apple e iPhone são marcas da Apple Inc., registradas nos EUA e em outros países.',
      invalid: 'Confira o e-mail. Parece que falta alguma coisa.',
      busy: 'Muita gente entrando agora. Tente de novo em alguns minutos.',
      failed: 'Não deu para enviar. Confira sua internet e tente de novo.',
      toggle: 'English', toggleLang: 'en'
    },
    en: {
      docTitle: 'Kilo: the workout and diet app that learns from you',
      docDescription: 'Kilo suggests the weight for your next set and, every week, a change to your target based on your real progress. Workouts and diet in one app, free with no ads. Coming soon to iPhone: join the waitlist.',
      eyebrow: 'Free. Coming soon to iPhone.',
      headline: 'The workout and diet app that learns from you.',
      lede: 'Kilo suggests the weight for your next set and, every week, a change to your target based on your real progress. You just accept.',
      phoneAlt: 'Kilo workout screen: last time\'s bench press, 3 sets of 60 kg, and the Aceitar sugestão (Accept suggestion) button',
      emailLabel: 'Your email',
      placeholder: 'you@example.com',
      button: 'Join the waitlist',
      sending: 'Sending…',
      consent: 'We will only email you about the Kilo launch. You can leave the list at any time.',
      privacy: 'Privacy',
      privacyFooter: 'Site and waitlist privacy', foodsFooter: 'Food calories (in Portuguese)', exercisesFooter: 'Exercise how-tos (in Portuguese)', calcFooter: 'Calorie calculator',
      doneTitle: 'Done!',
      placeTitle: 'You\'re number\u00a0{n} in line',
      doneText: 'You will be one of the first to know when Kilo arrives.',
      doneLeave: 'To leave the list, use the link in the launch email or write to contato@kiloapp.com.br.',
      closingTitle: 'Be one of the first to use Kilo.',
      closingText: 'We will email you when it arrives on iPhone. Just one email, no spam.',
      learnTitle: 'Kilo learns from you',
      learnIntro: 'Kilo uses what you log to make suggestions. You always decide whether to accept.',
      learn1Title: 'The weight for your next set',
      learn1Text: 'Kilo looks at your last workouts and suggests the weight for each set today. Tap “Accept suggestion” and your sets are filled in.',
      learn2Title: 'Your real daily burn',
      learn2Text: 'It starts from an estimate. From what you eat and how your weight moves, Kilo learns how much your body burns in a day.',
      learn3Title: 'Weekly check-in',
      learn3Text: 'Every week, Kilo shows how it went and suggests a change to your target. You decide whether to accept.',
      screensTitle: 'Workouts, food and weight in one app',
      screenTrainAlt: 'Kilo workout summary: a new bench press record, 62.5 kg × 8, and 2.5 kg more than last time',
      screenTrainTitle: 'Workouts',
      screenTrain1: 'Weight, reps and RIR (reps in reserve) on every set, with last time\'s numbers already filled in.',
      screenTrain2: 'At the end, a summary with your records and how much you went up on each exercise.',
      screenFoodAlt: 'A day of food in Kilo: banana, egg and a bread roll for breakfast, rice at lunch, with the calories and macros left',
      screenFoodTitle: 'Food',
      screenFood1: 'US and Brazilian food tables built into the app, so search works offline.',
      screenFood2: 'Your most-used foods come first for each meal, so most logs take one tap.',
      screenGoalAlt: 'Kilo weekly check-in: average calories and protein, 7 of 7 days logged, a weight trend of −0.5 kg and 2 workouts with 1 new record',
      screenGoalTitle: 'Goal and weight',
      screenGoal1: 'A weekly check-in shows calories, protein, workouts and the weight trend, and suggests changes to your target.',
      screenGoal2: 'Log your weight on the home screen and see the trend, not just today\'s number.',
      extrasTitle: 'And more',
      extraOfflineTitle: 'Offline food search', extraOffline: 'Food search works without signal.',
      extraBarcodeTitle: 'Barcode', extraBarcode: 'Scan a barcode or search packaged foods.',
      extraTimerTitle: 'Rest on the Lock Screen', extraTimer: 'The rest timer shows on the Lock Screen and in the Dynamic Island.',
      extraHealthTitle: 'Apple Health', extraHealth: 'Your daily steps come from Apple Health. Kilo only reads; it never writes to it.',
      extraDarkTitle: 'Dark mode', extraDark: 'Light or dark, as you like.',
      extraLangTitle: 'English and Portuguese', extraLang: 'In both languages, in kilograms or pounds.',
      promiseTitle: 'In the app: no ads, no tracking',
      promise1: 'The app has no ads, no analytics and no tracking.',
      promise2: 'Start without signing up, as a guest. If you make an account, you can delete it and your data from inside the app, any time.',
      pricesTitle: 'What would all this cost?',
      pricesIntro: 'Workouts and diet that adjust to you are usually paid for. We did the maths.',
      priceTrain: 'A training app that adjusts the weight', priceTrainValue: 'R$ 200 to R$ 400 a year',
      priceDiet: 'A diet app that adjusts your target', priceDietValue: 'R$ 400 to R$ 600 a year',
      priceCoach: 'A personal trainer, 2 to 3 times a week', priceCoachValue: 'R$ 600 to R$ 1,800 a month',
      priceKilo: 'Kilo, with workouts and diet together', priceKiloValue: 'R$ 0. Really.',
      pricesNote: 'Yearly plans on the Brazilian App Store and ranges published by personal trainer price guides, checked in October 2026. A good personal trainer is worth what they charge; Kilo is for people who want to log and progress on their own.',
      faqTitle: 'Common questions',
      faq1Q: 'Is it free?', faq1A: 'Yes. Kilo is free and has no ads.',
      faq2Q: 'When does it launch?', faq2A: 'There is no date yet. We are finishing the app. Join the list and we will email you when it arrives on iPhone.',
      faq3Q: 'Is it on Android?', faq3A: 'iPhone first. Android comes later: join the list and we will let you know.',
      faq4Q: 'Do I need an account?', faq4A: 'No. You can start as a guest, without signing up.',
      faq5Q: 'Does it work offline?', faq5A: 'Food search does: the Brazilian and US food tables are inside the app.',
      faq6Q: 'What do you do with my data?', faq6A: 'In the app, no ads, no analytics and no tracking, and Kilo only reads from Apple Health. On this site, we count visits without cookies and without knowing who you are. On the waitlist, we use your email only to tell you about the launch. The details are on the privacy page.',
      gorillaWaveAlt: 'The Kilo gorilla saying hi',
      gorillaNotesAlt: 'The Kilo gorilla keeping an eye on your progress',
      gorillaPointAlt: 'The Kilo gorilla inviting you to join the list',
      gorillaCheerAlt: 'The Kilo gorilla celebrating with you',
      joinBar: 'Join the waitlist',
      close: 'Close',
      qrAlt: 'QR code that opens the Kilo site on your phone',
      qrTitle: 'Open it on your phone',
      qrText: 'Point your phone\'s camera here to join the list from there.',
      disclaimer: 'Kilo is a tracking tool and does not replace advice from a doctor or dietitian.',
      trademark: 'Apple and iPhone are trademarks of Apple Inc., registered in the U.S. and other countries.',
      invalid: 'Check the email. It looks like something is missing.',
      busy: 'Lots of people are joining right now. Try again in a few minutes.',
      failed: 'Could not send it. Check your connection and try again.',
      toggle: 'Português', toggleLang: 'pt-BR'
    }
  };

  var params = new URLSearchParams(location.search);
  // The tag in the link (?origem=ig-treino) says which account brought the person; the database keeps only well-formed tags.
  var origem = (params.get('origem') || '').trim().toLowerCase().slice(0, 40) || null;

  // The visitor counter: Umami Cloud, cookie-free, data in its EU region (Frankfurt), described on the privacy page. src and id
  // are the two values from Umami's tracking code; nothing loads while id is empty. It counts pages, where visits come from,
  // scroll depth and taps on the join buttons, never an email, and only the origem and lang tags of the address. If it is
  // blocked or broken, the page works the same.
  var COUNTER = { src: 'https://cloud.umami.is/script.js', id: 'e87ebbf0-b53b-4acc-9c4f-4806fbc2c50a' };
  // Every address Umami sends (the page and the one before it) keeps only its origem and lang tags, so ad click ids, utm
  // tags or anything else in a link never reach it. Another site's address is cut down to the site's name. A browser asking
  // not to be tracked (Do Not Track, handled by Umami, or Global Privacy Control) is not counted at all.
  function counterAddress(address) {
    if (!address) return '';
    var url = new URL(address, location.origin);
    // protocol + host, not origin: an app's address (android-app://com.google.android.gm/) has the origin "null".
    if (url.origin !== location.origin) return url.protocol + '//' + url.host + '/';
    // Only well-formed tags pass, so a link with an email or anything else in them sends nothing.
    var kept = new URLSearchParams();
    var tag = url.searchParams.get('origem');
    if (tag && /^[a-z0-9-]{1,40}$/.test(tag)) kept.set('origem', tag);
    if (url.searchParams.get('lang') === 'en') kept.set('lang', 'en');
    var query = kept.toString();
    return (/^[a-z][a-z0-9+.-]*:/i.test(address) ? url.origin : '') + url.pathname + (query ? '?' + query : '');
  }
  window.kiloCounterBeforeSend = function (type, payload) {
    try {
      if (navigator.globalPrivacyControl) return null;
      payload.url = counterAddress(payload.url);
      if ('referrer' in payload) payload.referrer = counterAddress(payload.referrer);
    } catch (e) { return null; }
    return payload;
  };
  // Asking not to be tracked also means Umami's script is never fetched.
  var noTracking = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || window.doNotTrack === '1';
  var waiting = []; // events from before Umami's script has loaded, sent once it has
  if (COUNTER.src && COUNTER.id && !noTracking) {
    var counter = document.createElement('script');
    counter.defer = true;
    counter.src = COUNTER.src;
    counter.setAttribute('data-website-id', COUNTER.id);
    counter.setAttribute('data-domains', 'kiloapp.com.br');
    counter.setAttribute('data-do-not-track', 'true');
    counter.setAttribute('data-before-send', 'kiloCounterBeforeSend');
    counter.onload = function () { waiting.splice(0).forEach(function (event) { count(event[0], event[1]); }); };
    document.head.appendChild(counter);
  }
  function count(name, data) {
    try {
      if (window.umami && typeof window.umami.track === 'function') window.umami.track(name, data);
      else if (waiting.length < 20) waiting.push([name, data]);
    } catch (e) { /* never in the way */ }
  }
  var lang = params.get('lang') === 'en' ? 'en' : 'pt';
  var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-join]'));
  var toggle = document.getElementById('lang-toggle');
  var sendingBox = null;
  var joined = false;
  var place = null; // the place in line from the join answer, once the server sends one
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var watch = 'IntersectionObserver' in window;

  function each(selector, fn) { Array.prototype.forEach.call(document.querySelectorAll(selector), fn); }

  function apply() {
    var t = TEXT[lang];
    document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR';
    document.title = t.docTitle;
    document.querySelector('meta[name=description]').setAttribute('content', t.docDescription);
    each('[data-t]', function (el) { el.textContent = t[el.getAttribute('data-t')]; });
    each('[data-only-lang]', function (el) { el.hidden = el.getAttribute('data-only-lang') !== lang; });
    each('[data-t-placeholder]', function (el) { el.placeholder = t[el.getAttribute('data-t-placeholder')]; });
    each('[data-t-alt]', function (el) { el.alt = t[el.getAttribute('data-t-alt')]; });
    each('[data-t-aria]', function (el) { el.setAttribute('aria-label', t[el.getAttribute('data-t-aria')]); });
    each('[data-privacy]', function (el) { el.href = '/lista/privacidade/' + (lang === 'en' ? '?lang=en' : ''); });
    renderPlace(t);
    describe(t);
    toggle.textContent = t.toggle;
    toggle.lang = t.toggleLang;
    boxes.forEach(function (box) {
      box.querySelector('button.join').textContent = box === sendingBox ? t.sending : t.button;
      if (box.dataset.error) showError(box, box.dataset.error);
    });
  }

  // "Você é o nº 1.234 da fila" in the done boxes, once the join answer has given a place in line.
  function renderPlace(t) {
    if (!place) return;
    var number = place.toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR');
    each('.join-done h2', function (el) { el.textContent = t.placeTitle.replace('{n}', number); });
  }

  // For Google, which runs this script: the English page is its own address, with its own words and FAQ details. Kept apart and
  // guarded, so a slip in the details can never stop the visible page from switching language.
  function describe(t) {
    try {
      var here = 'https://kiloapp.com.br/' + (lang === 'en' ? '?lang=en' : '');
      var canonical = document.querySelector('link[rel=canonical]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = here;
      document.querySelector('meta[property="og:url"]').content = here;
      document.querySelector('meta[property="og:title"]').content = t.docTitle;
      document.querySelector('meta[property="og:description"]').content = t.docDescription;
      var ld = document.getElementById('ld');
      var data = JSON.parse(ld.textContent);
      data['@graph'].forEach(function (node) {
        if (node['@type'] === 'WebSite') node.description = t.docDescription;
        if (node['@type'] !== 'FAQPage') return;
        node.inLanguage = document.documentElement.lang;
        node.mainEntity.forEach(function (q, i) { q.name = t['faq' + (i + 1) + 'Q']; q.acceptedAnswer.text = t['faq' + (i + 1) + 'A']; });
      });
      ld.textContent = JSON.stringify(data);
    } catch (e) { /* the page itself is already translated */ }
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
    joined = true;
    placeExtras();
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
    var where = box === boxes[0] ? 'topo' : 'fim';
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      count('entrar-na-lista', { lugar: where });
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
        if (result.ok && result.body && result.body.ok === true) {
          // The place in line, when the server sends one (after migration 00058); otherwise the plain "Pronto!".
          var n = result.body.position;
          if (typeof n === 'number' && Number.isInteger(n) && n >= 1 && n < 1e9) { place = n; renderPlace(TEXT[lang]); }
          showDone(box);
          count('entrou', { lugar: where });
          return;
        }
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

  // The hero phone: a rendered orange iPhone that turns from its back to its front once, when it comes on screen. The video
  // carries its see-through edge as a grey picture under the colour one, and a small WebGL shader joins the two (an
  // ordinary video has no transparency). The still of the last frame is the page's own picture: it shows without
  // JavaScript, WebGL or motion, while the video loads, and again once it ends.
  var turnBox = document.querySelector('.phone-3d');
  if (turnBox && !still && watch) playTurn(turnBox);

  // Sections slide in gently the first time they come into view.
  if (!still && watch) {
    var slide = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) { entry.target.classList.add('in'); slide.unobserve(entry.target); } });
    }, { threshold: 0.12 });
    each('main > section.band', function (el) {
      // A section already on screen at load stays put; only the ones below slide.
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      el.classList.add('reveal');
      slide.observe(el);
    });
  }

  // The phone join bar and the computer QR card. Neither may ever cover an email box: the bar hides while either box is
  // on screen, and the card hides wherever it would overlap one.
  var bar = document.querySelector('.join-bar');
  var card = document.querySelector('.qr-card');
  var heroBox = boxes[0], endBox = boxes[boxes.length - 1];
  var phoneWidth = window.matchMedia('(max-width: 899px)');
  var cardClosed = false, cardDue = false, cardCounted = false;
  // The tags the short links use; each has its QR code in assets/qr (made by tools/make-qr.py).
  var QR_TAGS = ['ig-kiloapp', 'ig-elas', 'ig-treino', 'tt-kiloapp', 'tt-elas', 'tt-treino', 'ig-ian'];
  var qr = card.querySelector('img');

  // `below` counts a box as on screen that far before it scrolls in, so the bar is gone by the time the box arrives.
  function onScreen(el, below) { var r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < window.innerHeight + (below || 0); }
  function overlaps(a, b) { return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom; }

  function placeExtras() {
    var showBar = phoneWidth.matches && !joined && heroBox.getBoundingClientRect().bottom < 0 && !onScreen(heroBox) && !onScreen(endBox, bar.offsetHeight + 40);
    bar.classList.toggle('show', showBar);
    // While the bar is up, keyboard focus scrolls things clear of it.
    document.documentElement.classList.toggle('bar-up', showBar);
    if (card.hidden) return;
    // Where the card sits when shown (bottom right), whether or not it is showing now.
    var home = { right: window.innerWidth - 20, bottom: window.innerHeight - 20 };
    home.left = home.right - card.offsetWidth; home.top = home.bottom - card.offsetHeight;
    var clear = boxes.every(function (box) { return !overlaps(home, box.getBoundingClientRect()); });
    var showCard = cardDue && !cardClosed && !joined && !phoneWidth.matches && clear;
    // The code loads only when the card first shows, so phones never fetch it.
    if (showCard && !qr.getAttribute('src')) qr.src = '/assets/qr/' + (QR_TAGS.indexOf(origem) >= 0 ? origem : 'kilo') + '.svg';
    if (showCard && !cardCounted) { cardCounted = true; count('qr-mostrado'); }
    card.classList.toggle('show', showCard);
  }

  var queued = false;
  // How far down the page the visitor got: 25, 50, 75 and 100%, each counted once.
  var depths = [25, 50, 75, 100];
  function countDepth() {
    if (!window.umami) return; // marks wait until the counter is there (it never is while switched off or blocked)
    var seen = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
    while (depths.length && seen >= depths[0] - 1) count('rolagem', { ate: depths.shift() });
  }
  function queue() { if (!queued) { queued = true; requestAnimationFrame(function () { queued = false; placeExtras(); countDepth(); }); } }
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);

  bar.querySelector('button').addEventListener('click', function () {
    count('entrar-na-lista', { lugar: 'barra' });
    endBox.querySelector('input[type=email]').focus({ preventScroll: true });
    endBox.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'center' });
  });
  card.querySelector('.qr-close').addEventListener('click', function () {
    count('qr-fechado');
    cardClosed = true;
    placeExtras();
    // The button just vanished: hand focus back to the page so keyboard users carry on from the top of the content.
    document.querySelector('main').focus({ preventScroll: true });
  });
  card.hidden = false;
  setTimeout(function () { cardDue = true; placeExtras(); }, still ? 0 : 1200);
  placeExtras();

  // The gorilla plays his move each time he comes into view, instead of moving all the time (a few seconds, then he rests).
  if ('IntersectionObserver' in window) {
    var watcher = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { entry.target.classList.toggle('play', entry.isIntersecting); });
    }, { threshold: 0.6 });
    each('img.gorilla', function (el) { watcher.observe(el); });
  }

  apply();
  function playTurn(box) {
    var canvas = document.createElement('canvas');
    var gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return;
    var video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('muted', '');
    video.preload = 'none';
    // H.264 first: smaller, and decoded in hardware on iPhones. A browser without it (open-source Chromium) takes the VP9 copy.
    [['mp4', 'video/mp4; codecs="avc1.64002A"'], ['webm', 'video/webm; codecs="vp9"']].forEach(function (kind) {
      if (!video.canPlayType(kind[1])) return;
      var source = document.createElement('source');
      source.src = box.getAttribute('data-turn') + '.' + kind[0];
      source.type = kind[1];
      video.appendChild(source);
    });
    if (!video.lastChild) return;
    canvas.className = 'phone-anim';
    canvas.setAttribute('aria-hidden', 'true');
    // While the video loads, the first frame (the phone's back) stands in, so the phone never vanishes.
    var first = document.createElement('img');
    first.className = 'phone-first';
    first.alt = '';
    first.src = box.getAttribute('data-turn') + '-first.webp';
    // iPhones pause a video that isn't on the page, so it sits in a 1 px window inside the box.
    var holder = document.createElement('div');
    holder.className = 'phone-video';
    holder.appendChild(video);
    var done = false;
    var shown = false;
    var timer = 0;

    function stop() {
      if (done) return;
      done = true;
      seen.disconnect();
      clearTimeout(timer);
      box.classList.remove('waiting', 'turning');
      [canvas, first, holder].forEach(function (el) { if (el.parentNode) el.parentNode.removeChild(el); });
      video.pause();
      while (video.firstChild) video.removeChild(video.firstChild);
      video.removeAttribute('src');
      video.load();
      var lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    }
    function show() {
      if (done || shown) return;
      shown = true;
      if (!setUp()) { stop(); return; }
      draw();
      box.appendChild(canvas);
      if (first.parentNode) first.parentNode.removeChild(first);
      box.classList.add('turning');
      box.classList.remove('waiting');
      // However the video behaves from here, the still is back within the turn's length and a little more.
      clearTimeout(timer);
      timer = setTimeout(stop, ((video.duration || 2) + 1.5) * 1000);
      loop();
    }
    function start() {
      // The back's picture started loading with the page; the still hides only once it is there to cover for it.
      var cover = function () { if (!done && !shown) box.classList.add('waiting'); };
      if (first.complete && first.naturalWidth) cover(); else first.addEventListener('load', cover);
      box.appendChild(first);
      box.appendChild(holder);
      video.preload = 'auto';
      // Slow to start is not worth the wait: after 3 s the still stays and nothing turns.
      timer = setTimeout(stop, 3000);
      video.addEventListener('playing', show);
      video.addEventListener('ended', function () { draw(); stop(); });
      video.addEventListener('pause', function () { if (!video.ended) stop(); });
      video.addEventListener('error', stop);
      video.lastChild.addEventListener('error', stop);
      video.load();
      var playing = video.play();
      if (playing && playing.catch) playing.catch(stop);
    }
    // Starts the first time the phone is on screen. Scrolled away mid-turn, it skips to the still: no drawing nobody sees.
    var started = false;
    var seen = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) {
        if (started) { seen.disconnect(); stop(); }
        return;
      }
      if (started) return;
      started = true;
      start();
    }, { threshold: 0.1 });
    seen.observe(box);

    function loop() {
      if (done) return;
      draw();
      requestAnimationFrame(loop);
    }
    function setUp() {
      if (!video.videoWidth) return false;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight / 2;
      var program = gl.createProgram();
      [[gl.VERTEX_SHADER, 'attribute vec2 p; varying vec2 uv; void main() { uv = vec2(p.x + 1.0, 1.0 - p.y) * 0.5; gl_Position = vec4(p, 0.0, 1.0); }'],
       [gl.FRAGMENT_SHADER, 'precision mediump float; uniform sampler2D t; varying vec2 uv; void main() { float a = texture2D(t, vec2(uv.x, 0.5 + uv.y * 0.5)).r; vec3 c = texture2D(t, vec2(uv.x, uv.y * 0.5)).rgb; gl_FragColor = vec4(min(c, vec3(a)), a); }']
      ].forEach(function (part) {
        var shader = gl.createShader(part[0]);
        gl.shaderSource(shader, part[1]);
        gl.compileShader(shader);
        gl.attachShader(program, shader);
      });
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      var at = gl.getAttribLocation(program, 'p');
      gl.enableVertexAttribArray(at);
      gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0);
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      return true;
    }
    function draw() {
      if (done || video.readyState < 2) return;
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }
})();
