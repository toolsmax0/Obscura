// ==UserScript==
// @name         Obscura3
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Information is Power
// @author       toolsmax
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// @require      https://code.jquery.com/jquery-3.6.1.min.js
// @match        https://mtgdecks.net/Standard/arena
// @match        https://mtgdecks.net/Standard/BO3
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// ==/UserScript==

function getDict() {
  return GM_getValue("dict", {});
}

function setDict(dict) {
  GM_setValue("dict", dict);
}

var odate = GM_getValue("date", "");

function checkDate(date) {
  if (odate == "") {
    GM_setValue("date", date);
    odate = date;
    return 0;
  }
  var days = daysBetween(date, odate);
  if (daysBetween(date,GM_getValue("date",date)) > 0) {
    GM_setValue("date", date);
  
  return days;
}

function trimTime(time) {
  return time.replace(/\t/g, "").replace(/\n/g, "");
}

function daysBetween(time, time2) {
  var oneDay = 24 * 60 * 60 * 1000;
  var firstDate = new Date(time);
  var secondDate = new Date(time2);

  return (firstDate.getTime() - secondDate.getTime()) / oneDay;
}

function flushDict() {
  var dict = getDict();
  var date = odate;
  console.log("date: " + date);
  for (var key in dict) {
    if (daysBetween(date, dict[key].time) > 3) {
      delete dict[key];
    }
  }
  setDict(dict);
}

$(() => {
  "use strict";
  var table = $(".clickable:first tbody:first");
  table.children().has("td").remove();
  table.parent().off("click");
  table.parent().removeClass("clickable");
  // $("h1:first").click(() => {
  //   $("table").off("click");
  //   $("table").removeClass("clickable");
  // });
  table
    .parent()
    .after(
      "<table id='Obscura' cellpadding='0' cellspacing='0' class='table table-striped hidden-xs'></table>"
    );
  table.parent().remove();
  $("#Obscura").append(table);
  table = $("#Obscura tbody");
  var next = location.href;
  function iterate(data) {
    next = $(data).find(".next").attr("href");
    $(data)
      .find("tbody:first tr:has(td)")
      .each(function () {
        var tr = $(this);
        var url = tr.find("a").attr("href");
        var text = tr.children().eq(0).text();
        if (url == undefined) return;
        var time = trimTime(tr.children(".small").text());
        if (checkDate(time) < -3) {
          next = null;
          return false;
        }
        var dict = getDict();
        if (url in dict && text == dict[url].text) return;
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
        table.append(tr);
        dict[url] = {};
        dict[url].time = time;
        dict[url].text = text;
        setDict(dict);
      });
  }
  function rec() {
    if (next == null) {
      $("h1").append(" Completed");
      return;
    }
    $.get(next, iterate).then(rec);
  }
  rec();
  flushDict();
});
