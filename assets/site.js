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
      privacyFooter: 'Privacidade da lista de espera', foodsFooter: 'Calorias dos alimentos', calcFooter: 'Calculadora de calorias',
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
      screenTrain1: 'Carga, repetições e RIR em cada série, com os números da última vez já preenchidos.',
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
      promiseTitle: 'Sem anúncios, sem rastreamento',
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
      faq6Q: 'O que vocês fazem com meus dados?', faq6A: 'No app, nada de anúncios, análise de uso ou rastreamento, e o Kilo só lê do app Saúde. Na lista de espera, usamos seu e-mail só para avisar do lançamento; os detalhes estão na página de privacidade da lista.',
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
      privacyFooter: 'Waitlist privacy', foodsFooter: 'Food calories (in Portuguese)', calcFooter: 'Calorie calculator',
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
      screenTrain1: 'Weight, reps and RIR on every set, with last time\'s numbers already filled in.',
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
      promiseTitle: 'No ads, no tracking',
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
      faq6Q: 'What do you do with my data?', faq6A: 'In the app, no ads, no analytics and no tracking, and Kilo only reads from Apple Health. On the waitlist, we use your email only to tell you about the launch; the details are on the waitlist privacy page.',
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
        if (result.ok && result.body && result.body.ok === true) {
          // The place in line, when the server sends one (after migration 00058); otherwise the plain "Pronto!".
          var n = result.body.position;
          if (typeof n === 'number' && Number.isInteger(n) && n >= 1 && n < 1e9) { place = n; renderPlace(TEXT[lang]); }
          showDone(box);
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

  // The hero phone starts facing away and spins round once it is on screen (CSS .ready / .turned). Without JavaScript,
  // or with reduce motion, it simply faces the visitor.
  var turn = document.querySelector('.phone-turn');
  if (!still && watch) {
    turn.classList.add('ready');
    var spin = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { turn.classList.add('turned'); spin.disconnect(); }
    }, { threshold: 0.15 });
    spin.observe(turn);
  }

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
  var cardClosed = false, cardDue = false;
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
    card.classList.toggle('show', showCard);
  }

  var queued = false;
  function queue() { if (!queued) { queued = true; requestAnimationFrame(function () { queued = false; placeExtras(); }); } }
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);

  bar.querySelector('button').addEventListener('click', function () {
    endBox.querySelector('input[type=email]').focus({ preventScroll: true });
    endBox.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'center' });
  });
  card.querySelector('.qr-close').addEventListener('click', function () {
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
})();
