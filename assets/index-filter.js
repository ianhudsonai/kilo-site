// The search box on /alimentos/ and /exercicios/: type part of a name and only the matching rows stay. Without JavaScript the
// full lists are simply all there; this adds the box. Nothing is sent anywhere.
(function () {
  var script = document.currentScript;
  var jump = document.querySelector('ul.jump');
  var groups = Array.prototype.slice.call(document.querySelectorAll('section.group'));
  if (!script || !jump || !groups.length) return;

  // Lowercase, no accents: "pao" finds "Pão".
  function plain(text) { return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }

  var rows = [];
  groups.forEach(function (group) {
    Array.prototype.forEach.call(group.querySelectorAll('ul.list li'), function (li) {
      var name = li.querySelector('b');
      rows.push({ li: li, group: group, text: plain((name || li).textContent) });
    });
  });

  var box = document.createElement('div');
  box.className = 'finder';
  box.innerHTML = '<label for="finder-input"></label><input type="search" id="finder-input" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search"><p class="none" role="status"></p>';
  var label = box.querySelector('label'), input = box.querySelector('input'), none = box.querySelector('.none');
  label.textContent = script.getAttribute('data-label');
  var noneText = script.getAttribute('data-none');
  jump.parentNode.insertBefore(box, jump);

  input.addEventListener('input', function () {
    var words = plain(input.value).split(/\s+/).filter(Boolean);
    var shown = 0, groupShown = new Map();
    rows.forEach(function (row) {
      var match = words.every(function (word) { return row.text.indexOf(word) >= 0; });
      row.li.hidden = !match;
      if (match) { shown++; groupShown.set(row.group, true); }
    });
    groups.forEach(function (group) { group.hidden = !groupShown.get(group); });
    jump.hidden = words.length > 0;
    // The message is written into an always-present status line, so screen readers announce it.
    none.textContent = shown > 0 ? '' : noneText;
  });
})();
