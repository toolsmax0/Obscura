// ==UserScript==
// @name         Obscura-GoldfishTounaments
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Information is Power
// @author       toolsmax
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// @require      https://code.jquery.com/jquery-3.7.0.min.js
// @match        https://www.mtggoldfish.com/tournament_searches/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// ==/UserScript==

$(() => {
    "use strict";
    let set = GM_getValue("set", {});
    function check() {
      let tr = $(this);
      let url = tr.find("a").attr("href");
      console.log(url);
      if (url in set) tr.find("a").css("color","gray");
      else set[url] = "";
    }
    $("tbody").children().each(check);
    GM_setValue("set", set);
  });
  