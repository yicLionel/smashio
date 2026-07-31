/* GitHub contribution graph for Smashio */
(function () {
  "use strict";

  var USER = "yicLionel";
  var ENDPOINTS = [
    "https://github-contributions-api.jogruber.de/v4/" + USER,
    "https://github-contributions-api.deno.dev/v4/" + USER,
  ];
  var DAYS = 365; // 展示最近一年的贡献
  var WEEKS = 53; // 365 天约 53 周

  var root = document.getElementById("gh-graph");
  var totalEl = document.getElementById("gh-total");
  if (!root || !totalEl) return;

  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var start = new Date(today);
  start.setDate(start.getDate() - (DAYS - 1));

  // 对齐到起点所在周的周日，保证每列是一整周
  var weekStart = new Date(start);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function key(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function fetchContributions(i) {
    if (i >= ENDPOINTS.length) {
      root.innerHTML = '<p class="gh-error">Could not load GitHub contributions.</p>';
      return;
    }
    fetch(ENDPOINTS[i])
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        render(data.contributions);
      })
      .catch(function () {
        fetchContributions(i + 1);
      });
  }

  function render(list) {
    var map = {};
    var total = 0;
    list.forEach(function (c) {
      map[c.date] = c;
      if (c.date >= key(start) && c.date <= key(today)) total += c.count;
    });

    totalEl.textContent = total + " contributions in the last year";

    var grid = document.createElement("div");
    grid.className = "gh-grid";

    for (var w = 0; w < WEEKS; w++) {
      var col = document.createElement("div");
      col.className = "gh-col";
      for (var dow = 0; dow < 7; dow++) {
        var d = new Date(weekStart);
        d.setDate(d.getDate() + w * 7 + dow);
        var entry = map[key(d)];
        var inRange = d >= start && d <= today;
        var count = inRange && entry ? entry.count : 0;

        var cell = document.createElement("span");
        cell.className = "gh-cell";
        cell.setAttribute("data-l", inRange && entry ? entry.level : 0);
        cell.title =
          (count === 0 ? "No contributions" : count + (count === 1 ? " contribution" : " contributions")) +
          " on " + key(d);
        col.appendChild(cell);
      }
      grid.appendChild(col);
    }

    root.innerHTML = "";
    root.appendChild(grid);
  }

  fetchContributions(0);
})();
