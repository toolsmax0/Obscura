// ==UserScript==
// @name         Obscura
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       toolsmax
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// @require      https://code.jquery.com/jquery-3.6.1.min.js
// @match        https://aetherhub.com/Decks/Standard-BO1/?user=MTGA-Assistant-Meta&updated=365
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// ==/UserScript==

var mid = GM_getValue("mid", 0);
var flag = 0;
var lock = 0;
$(() => {
  "use strict";
  var table = $("tbody");

  console.log("mid:" + mid);
  table.click(check);
});

function check() {
  var pag = $(".pagination");
  pag.click(() => {
    lock = 0;
  });

  if (lock) {
    console.log("Locked, already run once on this list");
    return;
  }

  var time = $("[title='Time since last updated']");
  if (time.attr("class") != "sorting_desc") return;

  lock = 1;
  console.log("Check started");

  var table = $("tbody");
  table.children().each(function () {
    var tr = $(this);
    var id = +tr.attr("data-href");
    if (id == mid) {
      flag = 1;
    }
    if (flag) return;
    tr.children()
      .eq(5)
      .text(id > mid ? "New" : "Old");

    var a = tr.find("a");
    var url = a.attr("href");
    a.attr("href", "/Metagame/Standard-BO1/" + url);
    url = a.attr("href");

    function memory() {
      if ($(this).html().match(/meta/) != null) {
        tr.children().eq(2).attr("style", "white-space:nowrap");
        var nid = GM_getValue("mid", 0);
        if (id > nid) {
          GM_setValue("mid", id);
          console.log("new mid: " + id);
        }
      }
      tr.children().eq(6).text("OK");
    }
    tr.children()
      .eq(2)
      .load(url + " h5:first span:first", memory);
  });
}
