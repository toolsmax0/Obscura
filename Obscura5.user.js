// ==UserScript==
// @name         Obscura5
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Information is Power
// @author       toolsmax
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// @require      https://code.jquery.com/jquery-3.7.0.min.js
// @match        https://mtgdecks.net/*/tournaments*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// ==/UserScript==

$(() => {
  "use strict";
  let set = GM_getValue("set", {});
  function check() {
    let tr = $(this);
    let url = tr.find("a").attr("href");
    console.log(url);
    if (url in set) tr.children().eq(1).text("");
    else set[url] = "";
  }
  $(".clickable tr:has(td)").each(check);
  GM_setValue("set", set);
});
