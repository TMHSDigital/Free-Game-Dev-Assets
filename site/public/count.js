/*
 * Cookie-less usage counts (#120), sent to GoatCounter's /count endpoint
 * (https://www.goatcounter.com/help/countjs-host). Self-hosted instead of
 * GoatCounter's count.js so script-src stays 'self'; the CSP allows
 * connect-src to the endpoint only (shared.mjs ANALYTICS_ENDPOINT).
 *
 * What is sent: the page path (no query string), its title and the referrer
 * on each page view, plus named events from the catalog (app.js countView:
 * a search that found nothing, and which filters were set). No cookies, no
 * storage, no identifiers. Nothing is sent when the browser asks not to be
 * tracked (Do Not Track or Global Privacy Control), on localhost or a file,
 * or under automation.
 */
(function () {
  "use strict";
  var ENDPOINT = "https://tmhs.goatcounter.com/count";

  function off() {
    try {
      if (navigator.doNotTrack === "1" || window.doNotTrack === "1" || navigator.globalPrivacyControl === true) return true;
      if (navigator.webdriver) return true;
      var host = location.hostname;
      if (location.protocol === "file:" || host === "" || host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
      return false;
    } catch (e) {
      return true;
    }
  }

  function send(params) {
    if (off()) return;
    var parts = [];
    for (var k in params) {
      if (Object.prototype.hasOwnProperty.call(params, k) && params[k] !== "") {
        parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(params[k]));
      }
    }
    parts.push("rnd=" + Math.random().toString(36).slice(2));
    var url = ENDPOINT + "?" + parts.join("&");
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(url)) return;
    } catch (e) {
      // Fall through to fetch.
    }
    try {
      fetch(url, { method: "POST", keepalive: true, mode: "no-cors", credentials: "omit" }).catch(function () {});
    } catch (e) {
      // Counting is best effort; it never breaks the page.
    }
  }

  window.fgdaCount = {
    event: function (name) {
      send({ p: String(name).slice(0, 200), t: String(name).slice(0, 200), e: "true" });
    },
  };

  send({ p: location.pathname, t: document.title, r: document.referrer });
})();
