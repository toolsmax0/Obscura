// ==UserScript==
// @name         Obscura7
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Information is Power
// @author       toolsmax
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// @require      https://code.jquery.com/jquery-3.7.0.min.js
// @match        https://mtgdecks.net/*-tournament-*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// ==/UserScript==

$(() => {
  "use strict";
  var table = $(".clickable:first tbody:first");
  table.parent().removeClass("clickable");
  table.parent().off("click");
  $("h1:first").click(() => {
    table.parent().off("click");
    table.parent().removeClass("clickable");
  });

  table.find("tr:has(td)").each(function () {
    var tr = $(this);
    var url = tr.find("a").attr("href");
    let isClicked = false;
    function click() {
      if (isClicked) {
        $(this).next().toggle();
        return;
      }
      isClicked = true;
      $(this).after("<td colspan = '13'></td>");
      $(this)
        .next()
        .load(url + "/visual .visualView");
    }
    tr.click(click);
    //when hover set  background: #57583c!important; color: #fff!important; restore the color when mouseout
    tr.hover(
      function () {
        $(this).css("background", "#57583c");
        $(this).css("color", "#fff");
      },
      function () {
        $(this).css("background", "");
        $(this).css("color", "");
      }
    );
  });
});
