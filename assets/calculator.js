// The calorie and macro calculator (/calculadora/). The maths is the Kilo app's goal maths (target-calculator.ts in the app
// repo) with the pace the app uses when none is picked (its onboarding dial can start a little faster for small bodies);
// the check compares this file with data/goal-samples.json, written from the app. The warnings are the app's own words (target-rules.ts).
// Everything runs here: the number boxes have no names and the form never submits, so nothing typed leaves the page.
(function () {
  'use strict';

  var FACTOR = { sitting: 1.2, light: 1.375, active: 1.55, very: 1.725 };
  var KCAL_PER_KG = 7700;
  var FLOOR = { female: 1200, male: 1500, unspecified: 1350 };
  var PACE = { lose: 0.5, gain: 0.25 };
  var MIN_AGE = 16, ADULT_AGE = 18, LOW_BMI = 18.5, MAX_DEFICIT = 0.25, KCAL_MIN = 1200, KCAL_MAX = 5000;

  var round10 = function (v) { return Math.round(v / 10) * 10; };
  var round5 = function (v) { return Math.round(v / 5) * 5; };
  var savable = function (kcal) { return kcal >= KCAL_MIN && kcal <= KCAL_MAX; };

  /** The first body number the app would refuse, as the app names it ('weight', 'height', 'age', 'too-young'), or null. */
  function rangeProblem(b) {
    if (!isFinite(b.weightKg) || b.weightKg < 30 || b.weightKg > 300) return 'weight';
    if (!isFinite(b.heightCm) || b.heightCm < 120 || b.heightCm > 230) return 'height';
    if (!(b.age % 1 === 0) || b.age > 100) return 'age';
    if (b.age < MIN_AGE) return 'too-young';
    return null;
  }

  /** Protein by body weight (for a high BMI, by the weight at BMI 25), fat the larger of 0.7 g/kg and 25% of calories, carbs the rest. */
  function macros(weightKg, heightCm, kcal, goal) {
    var reference = weightKg;
    if (weightKg / Math.pow(heightCm / 100, 2) > 30) reference = 25 * Math.pow(heightCm / 100, 2);
    var protein = Math.min(round5(reference * (goal === 'lose' ? 1.8 : 1.6)), round5(kcal * 0.35 / 4));
    var fat = round5(Math.max(0.7 * weightKg, kcal * 0.25 / 9));
    return { kcal: kcal, protein: protein, fat: fat, carbs: Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4)) };
  }

  /** The app's proposeTarget for a person who answered every question and picked no pace. */
  function propose(b) {
    var bmi = b.weightKg / Math.pow(b.heightCm / 100, 2);
    var restriction = b.age < ADULT_AGE ? 'young' : null;
    var goal = restriction ? 'maintain' : b.goal;
    var resting = 10 * b.weightKg + 6.25 * b.heightCm - 5 * b.age + (b.sex === 'male' ? 5 : b.sex === 'female' ? -161 : -78);
    var maintenance = resting * FACTOR[b.activity];
    var daily = (goal === 'maintain' ? 0 : PACE[goal]) * KCAL_PER_KG / 7;
    var kcal = goal === 'lose' ? maintenance - daily : goal === 'gain' ? maintenance + daily : maintenance;
    var capped = null, atResting = false;
    if (goal === 'lose') {
      if (kcal < maintenance * (1 - MAX_DEFICIT)) { kcal = maintenance * (1 - MAX_DEFICIT); capped = 'deficit'; }
      if (kcal < FLOOR[b.sex]) { kcal = Math.min(FLOOR[b.sex], maintenance); capped = 'floor'; }
      if (kcal < resting) { kcal = Math.min(resting, maintenance); capped = 'floor'; atResting = true; }
    }
    kcal = atResting ? Math.ceil(kcal / 10) * 10 : round10(kcal);
    var unsavable = null;
    if (restriction === null && !savable(kcal)) {
      var fallback = savable(round10(maintenance)) ? 'maintenance' : 'none';
      unsavable = { kcal: kcal, fallback: fallback };
      if (fallback === 'maintenance') kcal = round10(maintenance);
      capped = null;
    }
    var m = macros(b.weightKg, b.heightCm, kcal, goal);
    return {
      kcal: m.kcal, protein: m.protein, carbs: m.carbs, fat: m.fat, restingKcal: Math.round(resting), maintenanceKcal: round10(maintenance),
      goal: goal, restriction: restriction, lowBmi: bmi < LOW_BMI, capped: capped, belowResting: kcal < resting - 5, unsavable: unsavable
    };
  }

  // For the check, which compares these with the app's answers.
  window.KiloCalculator = { propose: propose, rangeProblem: rangeProblem };

  var TEXT = {
    pt: {
      docTitle: 'Calculadora de calorias e macros grátis · Kilo',
      docDescription: 'Calcule quantas calorias e quanto de proteína, carboidrato e gordura comer por dia para perder, manter ou ganhar peso. Grátis, com a mesma conta do app Kilo.',
      crumbsLabel: 'Você está em', home: 'Kilo', here: 'Calculadora',
      title: 'Calculadora de calorias e macros',
      lede: 'Descubra quantas calorias comer por dia para perder, manter ou ganhar peso, e quanto disso em proteína, carboidrato e gordura. É a conta que o app Kilo usa para montar a sua meta, com o ritmo padrão: perder até 0,5 kg ou ganhar cerca de 0,25 kg por semana.',
      goalLegend: 'Seu objetivo', goalLose: 'Perder peso', goalMaintain: 'Manter o peso', goalGain: 'Ganhar peso',
      sexLegend: 'Sexo', sexMale: 'Masculino', sexFemale: 'Feminino', sexUnspecified: 'Prefiro não dizer',
      ageLabel: 'Idade (anos)', heightLabel: 'Altura (cm)', heightHint: 'Em centímetros, como 170, ou em metros, como 1,70.', weightLabel: 'Peso (kg)',
      activityLegend: 'Como é o seu dia', activitySitting: 'Maior parte do tempo sentado', activityLight: 'Em pé durante parte do dia',
      activityActive: 'Em pé durante a maior parte do dia', activityVery: 'Trabalho braçal',
      activityHint: 'Treina pesado quase todo dia? Escolha um nível acima.',
      calculate: 'Calcular', privacyNote: 'A conta é feita no seu aparelho. Nada do que você digita é enviado.',
      resultTitle: 'Sua meta diária', perDay: 'kcal por dia', protein: 'Proteína', carbs: 'Carboidrato', fat: 'Gordura',
      burn: 'Gasto estimado: {burn} kcal por dia (em repouso, {rest} kcal).',
      paceLose: 'Para perder até 0,5 kg por semana.', paceGain: 'Para ganhar cerca de 0,25 kg por semana.', paceMaintain: 'Para manter o peso.',
      estimate: 'Uma estimativa inicial. O peso de cada pessoa responde de um jeito, então vale acompanhar e ajustar.',
      needGoal: 'Escolha o seu objetivo.', needSex: 'Escolha uma opção em sexo.', needActivity: 'Escolha como é o seu dia.',
      tooYoung: 'O Kilo é para pessoas de 16 anos ou mais, então não sugere meta.',
      badWeight: 'Informe um peso entre 30 e 300 kg.', badAge: 'Informe sua idade em anos, entre 16 e 100.',
      badHeight: 'Informe uma altura entre 120 e 230 cm, ou em metros, como 1,75.',
      young: 'Até 17 anos, o Kilo sugere só manutenção, sem déficit nem superávit.',
      lowBmiHeld: 'Seu peso está baixo para a sua altura, então o Kilo sugere só manutenção. Fale com um médico antes de mudar quanto você come.',
      lowBmi: 'Seu peso está baixo para a sua altura. A escolha é sua; fale com um médico antes de mudar quanto você come.',
      floor: 'Mantida em um mínimo seguro; um ritmo mais lento é mais tranquilo.',
      deficit: 'Limitada a um déficit de 25%; um ritmo mais lento é mais tranquilo.',
      belowResting: 'Abaixo do seu gasto em repouso; fale com um médico ou treinador antes de comer tão pouco.',
      unsavableNone: 'O Kilo não consegue sugerir um número para esta meta. O número que ele calcula, cerca de {kcal} kcal, está fora da faixa de 1.200 a 5.000 kcal que o app aceita.',
      unsavableMaintenance: 'O número que o Kilo calcula para esta meta, cerca de {kcal} kcal, está fora da faixa de 1.200 a 5.000 kcal que o app aceita, então ele sugere a manutenção, cerca de {maintenance} kcal.',
      howTitle: 'Como a conta funciona',
      how1: 'O gasto em repouso vem da fórmula de Mifflin-St Jeor, com seu peso, altura, idade e sexo. Em “Prefiro não dizer”, a conta usa a média entre as versões masculina e feminina.',
      how2: 'O gasto do dia é o gasto em repouso vezes o seu nível de atividade: 1,2 (sentado), 1,375 (em pé parte do dia), 1,55 (em pé a maior parte do dia) ou 1,725 (trabalho braçal).',
      how3: 'Para perder peso, a meta tira até 0,5 kg por semana (cerca de 7.700 kcal por quilo), mas nunca mais de 25% do seu gasto, nunca menos de 1.200 kcal (feminino), 1.500 kcal (masculino) ou 1.350 kcal (prefiro não dizer), a não ser que o seu gasto seja menor, e nunca menos que o seu gasto em repouso. Para ganhar, soma cerca de 0,25 kg por semana. Um número fora da faixa de 1.200 a 5.000 kcal não é sugerido.',
      how4: 'Proteína: 1,8 g por kg para perder e 1,6 g por kg para manter ou ganhar (acima de IMC 30, pelo peso de IMC 25), até 35% das calorias. Gordura: o maior entre 0,7 g por kg e 25% das calorias. Carboidrato: o que sobra.',
      how5: 'Até 17 anos, a meta fica na manutenção. Abaixo de 16 anos, não há meta.',
      joinTitle: 'O Kilo sugere ajustes pelo seu progresso real',
      joinText: 'No app, a meta começa com esta conta. Toda semana, o check-in mostra como foi e sugere um ajuste na sua meta. Você decide se aceita.',
      joinButton: 'Entrar na lista de espera', joinSmall: 'Grátis, sem anúncios. Primeiro no iPhone.',
      footHome: 'Página inicial do Kilo', footFoods: 'Calorias dos alimentos',
      disclaimer: 'O Kilo é uma ferramenta de registro e não substitui orientação médica ou de um nutricionista.',
      toggle: 'English', toggleLang: 'en'
    },
    en: {
      docTitle: 'Free calorie and macro calculator · Kilo',
      docDescription: 'Work out how many calories to eat a day to lose, keep or gain weight, and how much protein, carbs and fat. Free, with the same maths as the Kilo app.',
      crumbsLabel: 'You are here', home: 'Kilo', here: 'Calculator',
      title: 'Calorie and macro calculator',
      lede: 'Find out how many calories to eat a day to lose, keep or gain weight, and how much of that as protein, carbs and fat. It is the maths the Kilo app uses to set your target, at its default pace: lose up to 0.5 kg or gain about 0.25 kg a week.',
      goalLegend: 'Your goal', goalLose: 'Lose weight', goalMaintain: 'Keep my weight', goalGain: 'Gain weight',
      sexLegend: 'Sex', sexMale: 'Male', sexFemale: 'Female', sexUnspecified: 'Prefer not to say',
      ageLabel: 'Age (years)', heightLabel: 'Height (cm)', heightHint: 'In centimetres, like 170, or in metres, like 1.70.', weightLabel: 'Weight (kg)',
      activityLegend: 'What your day is like', activitySitting: 'Sitting most of the day', activityLight: 'On your feet part of the day',
      activityActive: 'On your feet most of the day', activityVery: 'Physical work',
      activityHint: 'Train hard most days? Pick one level up.',
      calculate: 'Calculate', privacyNote: 'The maths runs on your device. Nothing you type is sent anywhere.',
      resultTitle: 'Your daily target', perDay: 'kcal a day', protein: 'Protein', carbs: 'Carbs', fat: 'Fat',
      burn: 'Estimated burn: {burn} kcal a day ({rest} kcal at rest).',
      paceLose: 'To lose up to 0.5 kg a week.', paceGain: 'To gain about 0.25 kg a week.', paceMaintain: 'To keep your weight.',
      estimate: 'A starting estimate. Every body responds differently, so it is worth tracking and adjusting.',
      needGoal: 'Choose your goal.', needSex: 'Choose an option for sex.', needActivity: 'Choose what your day is like.',
      tooYoung: 'Kilo is for people 16 and older, so it does not suggest a target.',
      badWeight: 'Enter a weight between 30 and 300 kg.', badAge: 'Enter your age in years, between 16 and 100.',
      badHeight: 'Enter a height between 120 and 230 cm, or in metres, like 1.75.',
      young: 'Under 18, Kilo suggests maintenance only, with no deficit or surplus.',
      lowBmiHeld: 'Your weight is low for your height, so Kilo suggests maintenance only. Talk to a doctor before you change how much you eat.',
      lowBmi: 'Your weight is low for your height. The choice is yours; talk to a doctor before you change how much you eat.',
      floor: 'Held at a safe minimum; a slower pace is gentler.',
      deficit: 'Limited to a 25% deficit; a slower pace is gentler.',
      belowResting: 'Below your resting burn; talk to a doctor or coach before eating this low.',
      unsavableNone: 'Kilo cannot suggest a number for this goal. The number it works out, about {kcal} kcal, is outside the 1,200 to 5,000 kcal the app accepts.',
      unsavableMaintenance: 'The number Kilo works out for this goal, about {kcal} kcal, is outside the 1,200 to 5,000 kcal the app accepts, so it suggests maintenance, about {maintenance} kcal.',
      howTitle: 'How the maths works',
      how1: 'Your resting burn comes from the Mifflin-St Jeor formula, with your weight, height, age and sex. With "Prefer not to say", it uses the average of the male and female versions.',
      how2: 'Your daily burn is the resting burn times your activity level: 1.2 (sitting), 1.375 (on your feet part of the day), 1.55 (on your feet most of the day) or 1.725 (physical work).',
      how3: 'To lose weight, the target takes off up to 0.5 kg a week (about 7,700 kcal per kilo), but never more than 25% of your burn, never under 1,200 kcal (female), 1,500 kcal (male) or 1,350 kcal (prefer not to say) unless your burn is lower, and never under your resting burn. To gain, it adds about 0.25 kg a week. A number outside 1,200 to 5,000 kcal is not suggested.',
      how4: 'Protein: 1.8 g per kg to lose and 1.6 g per kg to keep or gain (above BMI 30, by the weight at BMI 25), up to 35% of calories. Fat: the larger of 0.7 g per kg and 25% of calories. Carbs: the rest.',
      how5: 'Under 18, the target stays at maintenance. Under 16, there is no target.',
      joinTitle: 'Kilo suggests adjustments from your real progress',
      joinText: 'In the app, your target starts with this maths. Every week, the check-in shows how it went and suggests an adjustment to your target. You decide whether to take it.',
      joinButton: 'Join the waitlist', joinSmall: 'Free, with no ads. iPhone first.',
      footHome: 'Kilo home page', footFoods: 'Food calories (in Portuguese)',
      disclaimer: 'Kilo is a tracking tool and does not replace advice from a doctor or dietitian.',
      toggle: 'Português', toggleLang: 'pt-BR'
    }
  };

  var params = new URLSearchParams(location.search);
  var lang = params.get('lang') === 'en' ? 'en' : 'pt';
  var form = document.getElementById('calc');
  if (!form) return;
  var result = document.getElementById('result');
  var status = form.querySelector('.status');
  var toggle = document.getElementById('lang-toggle');
  var shown = null; // what the result area shows, so a language switch can redraw it

  function each(selector, fn) { Array.prototype.forEach.call(document.querySelectorAll(selector), fn); }
  function fill(text, values) { return text.replace(/\{(\w+)\}/g, function (all, key) { return values[key]; }); }
  function kcalText(n) { return Math.round(n).toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR'); }
  function picked(name) { var el = form.querySelector('[data-group="' + name + '"] input:checked'); return el ? el.value : null; }
  function number(id) { return form.querySelector('#' + id).value.trim().replace(',', '.'); }

  /** The app's reading of the boxes: whole years; centimetres, or metres like 1,75; a weight with a comma or a dot. */
  function readBody() {
    var ageText = number('age'), heightText = number('height'), weightText = number('weight');
    var heightCm = NaN;
    if (/^\d\.\d{1,2}$/.test(heightText) && Number(heightText) >= 1 && Number(heightText) <= 2.5) heightCm = Math.round(Number(heightText) * 1000) / 10;
    else if (/^\d{2,3}(\.\d+)?$/.test(heightText)) heightCm = Number(heightText);
    return {
      age: /^\d{1,3}$/.test(ageText) ? Number(ageText) : NaN,
      heightCm: heightCm,
      weightKg: /^\d{1,3}(\.\d+)?$/.test(weightText) ? Number(weightText) : NaN
    };
  }

  function problemOf(body) {
    if (isNaN(body.age) || body.age > 100) return ['badAge', 'age'];
    if (body.age < MIN_AGE) return ['tooYoung', 'age'];
    // The app asks for the height before the weight, so a bad height is named first.
    if (rangeProblem({ age: body.age, heightCm: body.heightCm, weightKg: 70 }) === 'height') return ['badHeight', 'height'];
    if (rangeProblem(body) === 'weight') return ['badWeight', 'weight'];
    return null;
  }

  function render() {
    var t = TEXT[lang];
    result.hidden = !shown;
    if (!shown) return;
    var p = shown.proposal;
    var noNumber = p.unsavable && p.unsavable.fallback === 'none';
    result.querySelector('.figures').hidden = noNumber;
    result.querySelector('[data-kcal]').textContent = kcalText(p.kcal);
    ['protein', 'carbs', 'fat'].forEach(function (key) { result.querySelector('[data-' + key + ']').textContent = p[key] + ' g'; });
    // A goal held at maintenance (the floor above the burn, or a number the app does not accept) says so, not the pace.
    var held = p.goal === 'maintain' || !!p.unsavable || (p.goal === 'lose' && p.kcal >= p.maintenanceKcal);
    result.querySelector('.pace').textContent = noNumber ? '' : held ? t.paceMaintain : p.goal === 'lose' ? t.paceLose : t.paceGain;
    result.querySelector('.burn').textContent = fill(t.burn, { burn: kcalText(p.maintenanceKcal), rest: kcalText(p.restingKcal) });
    var lines = [];
    if (p.restriction === 'young') lines.push(t.young);
    if (p.lowBmi) lines.push(p.restriction ? t.lowBmiHeld : t.lowBmi);
    if (p.capped === 'floor') lines.push(t.floor);
    if (p.capped === 'deficit') lines.push(t.deficit);
    if (p.unsavable) lines.push(fill(p.unsavable.fallback === 'none' ? t.unsavableNone : t.unsavableMaintenance, { kcal: kcalText(p.unsavable.kcal), maintenance: kcalText(p.maintenanceKcal) }));
    if (p.belowResting) lines.push(t.belowResting);
    var notes = result.querySelector('.notes');
    notes.textContent = '';
    lines.forEach(function (line) { var li = document.createElement('li'); li.textContent = line; notes.appendChild(li); });
    notes.hidden = !lines.length;
  }

  function showProblem(key, focusId) {
    shown = null;
    render();
    status.textContent = TEXT[lang][key];
    status.dataset.key = key;
    each('#calc [aria-invalid]', function (el) { el.removeAttribute('aria-invalid'); });
    var field = form.querySelector('#' + focusId) || form.querySelector('[data-group="' + focusId + '"] input');
    if (field && field.tagName === 'INPUT' && field.type !== 'radio') field.setAttribute('aria-invalid', 'true');
    if (field) field.focus();
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var goal = picked('goal'), sex = picked('sex'), activity = picked('activity');
    if (!goal) return showProblem('needGoal', 'goal');
    if (!sex) return showProblem('needSex', 'sex');
    var body = readBody();
    var problem = problemOf(body);
    if (problem) return showProblem(problem[0], problem[1]);
    if (!activity) return showProblem('needActivity', 'activity');
    status.textContent = '';
    delete status.dataset.key;
    each('#calc [aria-invalid]', function (el) { el.removeAttribute('aria-invalid'); });
    shown = { proposal: propose({ age: body.age, heightCm: body.heightCm, weightKg: body.weightKg, sex: sex, activity: activity, goal: goal }) };
    render();
    result.focus();
  });

  function apply() {
    var t = TEXT[lang];
    document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR';
    document.title = t.docTitle;
    document.querySelector('meta[name=description]').content = t.docDescription;
    each('[data-t]', function (el) { el.textContent = t[el.getAttribute('data-t')]; });
    each('[data-t-aria]', function (el) { el.setAttribute('aria-label', t[el.getAttribute('data-t-aria')]); });
    if (status.dataset.key) status.textContent = t[status.dataset.key];
    each('[data-join-link]', function (el) { el.href = '/?origem=seo-calc' + (lang === 'en' ? '&lang=en' : ''); });
    toggle.textContent = t.toggle;
    toggle.lang = t.toggleLang;
    try {
      var here = 'https://kiloapp.com.br/calculadora/' + (lang === 'en' ? '?lang=en' : '');
      var canonical = document.querySelector('link[rel=canonical]');
      if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
      canonical.href = here;
      document.querySelector('meta[property="og:url"]').content = here;
      document.querySelector('meta[property="og:title"]').content = t.docTitle;
      document.querySelector('meta[property="og:description"]').content = t.docDescription;
    } catch (e) { /* the page itself is already translated */ }
    render();
  }

  // Without JavaScript the form could not work, so it shows only now (the page says why otherwise).
  form.hidden = false;
  each('.needs-js', function (el) { el.hidden = true; });
  toggle.hidden = false;
  toggle.addEventListener('click', function () {
    lang = lang === 'en' ? 'pt' : 'en';
    if (lang === 'en') params.set('lang', 'en'); else params.delete('lang');
    var query = params.toString();
    history.replaceState(null, '', location.pathname + (query ? '?' + query : '') + location.hash);
    apply();
  });

  apply();
})();
