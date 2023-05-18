// ==UserScript==
// @name         Trophy
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.17lands.com/trophies
// @require      https://code.jquery.com/jquery-3.6.3.min.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=17lands.com
// @grant        none
// ==/UserScript==

$("h2").click(() => {
  "use strict";
  $(".mana-symbols").toggle();
  $("tbody").find("a").each(function(){
    let href = $(this).attr("href");
    //split href by '/' and find the second element
    let deckId = href.split("/")[2];
    $(this).attr("href", `/pool/${deckId}`);
  })
});
