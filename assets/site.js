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
      learnTitle: 'O Kilo aprende com você',
      learnIntro: 'Quanto mais você registra, melhores ficam as sugestões. Você sempre decide se aceita.',
      learn1Title: 'A carga da próxima série',
      learn1Text: 'O Kilo olha seus últimos treinos e sugere carga e repetições para hoje. Um toque em Aceitar sugestão e as séries já vêm preenchidas.',
      learn2Title: 'Seu gasto real',
      learn2Text: 'Começa com uma estimativa. Com o que você come e como seu peso muda, o Kilo aprende quanto seu corpo gasta em um dia.',
      learn3Title: 'Check-in semanal',
      learn3Text: 'Toda semana, o Kilo mostra como foi e sugere um ajuste na sua meta. Você decide se aceita.',
      screensTitle: 'Treino, comida e peso no mesmo app',
      screenTrainAlt: 'Resumo do treino no Kilo: novo recorde no supino, 62,5 kg × 8, e 2,5 kg a mais que da última vez',
      screenTrainTitle: 'Treino',
      screenTrain1: 'Carga, repetições e RIR em cada série, com os números da última vez já preenchidos.',
      screenTrain2: 'No fim, um resumo com seus recordes e quanto você subiu em cada exercício.',
      screenFoodAlt: 'Dia de alimentação no Kilo: banana, ovo, pão francês, arroz, feijão e frango, com calorias e macros',
      screenFoodTitle: 'Alimentação',
      screenFood1: 'Tabela TACO e alimentos dos EUA dentro do app, com busca que funciona sem internet.',
      screenFood2: 'Seus alimentos mais usados aparecem primeiro em cada refeição, para registrar com um toque.',
      screenGoalAlt: 'Check-in semanal do Kilo: média de calorias e proteína, 7 de 7 dias registrados, tendência do peso de −0,5 kg e 2 treinos com 1 recorde novo',
      screenGoalTitle: 'Meta e peso',
      screenGoal1: 'Monte sua meta com algumas perguntas, ou use os números do seu nutricionista.',
      screenGoal2: 'Registre o peso na tela inicial e veja a tendência, não só o número do dia.',
      extrasTitle: 'E mais',
      extraOfflineTitle: 'Sem internet', extraOffline: 'A busca de alimentos funciona sem sinal.',
      extraBarcodeTitle: 'Código de barras', extraBarcode: 'Leia o código ou busque produtos embalados.',
      extraTimerTitle: 'Descanso na Tela Bloqueada', extraTimer: 'O timer de descanso aparece na Tela Bloqueada e na Dynamic Island.',
      extraHealthTitle: 'App Saúde', extraHealth: 'Seus passos do dia vêm do app Saúde. O Kilo só lê, nunca grava nada nele.',
      extraDarkTitle: 'Modo escuro', extraDark: 'Claro ou escuro, como você preferir.',
      extraLangTitle: 'Português e inglês', extraLang: 'Nos dois idiomas, em quilos ou libras.',
      promiseTitle: 'Sem anúncios, sem rastreamento',
      promise1: 'O app não tem anúncios, não faz análise de uso e não rastreia você.',
      promise2: 'Comece sem cadastro, como convidado. Se criar uma conta, você pode excluí-la com seus dados dentro do app, quando quiser.',
      faqTitle: 'Perguntas',
      faq1Q: 'É grátis?', faq1A: 'Sim. O Kilo é grátis e não tem anúncios.',
      faq2Q: 'Quando lança?', faq2A: 'Ainda não tem data. Estamos terminando o app. Entre na lista e avisamos por e-mail quando ele chegar ao iPhone.',
      faq3Q: 'Tem para Android?', faq3A: 'Primeiro no iPhone. O Android vem depois: entre na lista e avisamos.',
      faq4Q: 'Preciso criar conta?', faq4A: 'Não. Você pode começar como convidado, sem cadastro.',
      faq5Q: 'Funciona sem internet?', faq5A: 'A busca de alimentos, sim: a tabela TACO e os alimentos dos EUA ficam dentro do app.',
      faq6Q: 'O que vocês fazem com meus dados?', faq6A: 'No app, nada de anúncios, análise de uso ou rastreamento, e o Kilo só lê do app Saúde. Na lista de espera, usamos seu e-mail só para avisar do lançamento; os detalhes estão na página de privacidade da lista.',
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
      privacyFooter: 'Waitlist privacy',
      doneTitle: 'Done!',
      doneText: 'You will be one of the first to know when Kilo arrives.',
      doneLeave: 'To leave the list, use the link in the launch email or write to contato@kiloapp.com.br.',
      closingTitle: 'Be one of the first to use Kilo.',
      closingText: 'We will email you when it arrives on iPhone. Just one email, no spam.',
      learnTitle: 'Kilo learns from you',
      learnIntro: 'The more you log, the better the suggestions get. You always decide whether to accept.',
      learn1Title: 'The weight for your next set',
      learn1Text: 'Kilo looks at your last workouts and suggests the weight and reps for today. One tap on Accept suggestion and your sets are filled in.',
      learn2Title: 'Your real daily burn',
      learn2Text: 'It starts from an estimate. From what you eat and how your weight moves, Kilo learns how much your body burns in a day.',
      learn3Title: 'Weekly check-in',
      learn3Text: 'Every week, Kilo shows how it went and suggests a change to your target. You decide whether to accept.',
      screensTitle: 'Workouts, food and weight in one app',
      screenTrainAlt: 'Kilo workout summary: a new bench press record, 62.5 kg × 8, and 2.5 kg more than last time',
      screenTrainTitle: 'Workouts',
      screenTrain1: 'Weight, reps and RIR on every set, with last time\'s numbers already filled in.',
      screenTrain2: 'At the end, a summary with your records and how much you went up on each exercise.',
      screenFoodAlt: 'A day of food in Kilo: banana, egg, bread roll, rice, beans and chicken, with calories and macros',
      screenFoodTitle: 'Food',
      screenFood1: 'US and Brazilian food tables built into the app, so search works offline.',
      screenFood2: 'Your most-used foods come first for each meal, so most logs take one tap.',
      screenGoalAlt: 'Kilo weekly check-in: average calories and protein, 7 of 7 days logged, a weight trend of −0.5 kg and 2 workouts with 1 new record',
      screenGoalTitle: 'Goal and weight',
      screenGoal1: 'Build your target from a few questions, or use the numbers from your coach or dietitian.',
      screenGoal2: 'Log your weight on the home screen and see the trend, not just today\'s number.',
      extrasTitle: 'And more',
      extraOfflineTitle: 'Works offline', extraOffline: 'Food search works without signal.',
      extraBarcodeTitle: 'Barcode', extraBarcode: 'Scan a barcode or search packaged foods.',
      extraTimerTitle: 'Rest on the Lock Screen', extraTimer: 'The rest timer shows on the Lock Screen and in the Dynamic Island.',
      extraHealthTitle: 'Apple Health', extraHealth: 'Your daily steps come from Apple Health. Kilo only reads; it never writes to it.',
      extraDarkTitle: 'Dark mode', extraDark: 'Light or dark, as you like.',
      extraLangTitle: 'English and Portuguese', extraLang: 'In both languages, in kilograms or pounds.',
      promiseTitle: 'No ads, no tracking',
      promise1: 'The app has no ads, no analytics and no tracking.',
      promise2: 'Start without signing up, as a guest. If you make an account, you can delete it and your data from inside the app, any time.',
      faqTitle: 'Questions',
      faq1Q: 'Is it free?', faq1A: 'Yes. Kilo is free and has no ads.',
      faq2Q: 'When does it launch?', faq2A: 'There is no date yet. We are finishing the app. Join the list and we will email you when it arrives on iPhone.',
      faq3Q: 'Is it on Android?', faq3A: 'iPhone first. Android comes later: join the list and we will let you know.',
      faq4Q: 'Do I need an account?', faq4A: 'No. You can start as a guest, without signing up.',
      faq5Q: 'Does it work offline?', faq5A: 'Food search does: the Brazilian and US food tables are inside the app.',
      faq6Q: 'What do you do with my data?', faq6A: 'In the app, no ads, no analytics and no tracking, and Kilo only reads from Apple Health. On the waitlist, we use your email only to tell you about the launch; the details are on the waitlist privacy page.',
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
