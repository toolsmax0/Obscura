// ==UserScript==
// @name         Obscura6
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Information is Power
// @author       toolsmax
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// @require      https://code.jquery.com/jquery-3.6.3.min.js
// @match        https://aetherhub.com/MTGA-Decks/*/
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// ==/UserScript==

let threshold = 60;

function GetColors(data, type, url) {
  if (type === "display" || type === "filter") {
    var white = "";
    var blue = "";
    var black = "";
    var red = "";
    var green = "";
    var colorless = "";
    if (url === "Deck") {
      if (data[0] > 0) white = '<i class="ms ms-w ms-cost ms-shadow"></i>';
      if (data[1] > 0) blue = '<i class="ms ms-u ms-cost ms-shadow"></i>';
      if (data[2] > 0) black = '<i class="ms ms-b ms-cost ms-shadow"></i>';
      if (data[3] > 0) red = '<i class="ms ms-r ms-cost ms-shadow"></i>';
      if (data[4] > 0) green = '<i class="ms ms-g ms-cost ms-shadow"></i>';
      if (data[5] > 0)
        colorless = '<i class="ms ms-c colorless ms-cost ms-shadow"></i>';
    } else {
      if (data[0] > 4) white = '<i class="ms ms-w ms-cost ms-shadow"></i>';
      if (data[1] > 4) blue = '<i class="ms ms-u ms-cost ms-shadow"></i>';
      if (data[2] > 4) black = '<i class="ms ms-b ms-cost ms-shadow"></i>';
      if (data[3] > 4) red = '<i class="ms ms-r ms-cost ms-shadow"></i>';
      if (data[4] > 4) green = '<i class="ms ms-g ms-cost ms-shadow"></i>';
      if (
        data[5] > 0 ||
        (data[0] < 5 &&
          data[1] < 5 &&
          data[2] < 5 &&
          data[3] < 5 &&
          data[4] < 5)
      )
        colorless = '<i class="ms ms-c colorless ms-cost ms-shadow"></i>';
    }
    return white + blue + black + red + green + colorless;
  }
}

$(() => {
  "use strict";
  let mem = GM_getValue("mem", {});
  let dest = mem[location.href];
  let head = $("h2");
  let next = location.href;
  let table = $("tbody");
  mem[location.href] = table.find("a:first").attr("href");
  GM_setValue("mem", mem);
  table.children().remove();
  function iterate(data) {
    next = $(data).find(".pagination a:last").attr("href");
    if (dest == null) next = null;
    let flag = false;
    $(data)
      .find("tbody tr")
      .each(function () {
        let url = $(this).find("a:first").attr("href");
        if (url == dest) {
          flag = true;
          next = null;
        }
        if (flag) return;
        let s = $(this).children().eq(3).text();
        let winrate = parseInt(s.split("%")[0]);
        if (winrate < threshold) return;
        let colors = $(this).find(".metalist-colors");
        colors.html(
          GetColors(colors.attr("data-colors").split("|"), "display", "meta")
        );
        let id = url.split("-").pop();
        $.get("/Deck/MtgoDeckExport/" + id, (data) => {
          GM_xmlhttpRequest({
            method: "POST",
            url: "http://localhost:7191",
            data: data,
            onload: (response) => {
              $(this).children().eq(4).text(response.responseText);
            },
          });
        });
        let id2 = url.split("/").pop();
        let isClicked = false;
        function click() {
          if (isClicked) {
            $(this).next().toggle();
            return;
          }
          isClicked = true;
          $(this).after("<td colspan = '5'></td>");
          $(this).next().load("/Deck/"+id2+"/Gallery/");

        }
        $(this).click(click);
        table.append($(this));
      });
  }
  function rec() {
    if (next == null) {
      head.append(" Compleated");
      return;
    }
    $.get(next, iterate).then(rec);
  }
  rec();
  $();
});
