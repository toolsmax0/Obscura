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

function checkDate(date) {
  var odate = GM_getValue("date", "");
  if (odate == "") {
    GM_setValue("date", date);
    return 0;
  }
  var days = daysBetween(date, odate);
  if (days > 0) {
    console.log("New day, flushing dict");
    GM_setValue("date", date);
    flushDict();
  }
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
  var date = GM_getValue("date", "");
  console.log("date: " + date);
  for (var key in dict) {
    if (daysBetween(date, dict[key]) > 3) {
      delete dict[key];
    }
  }
  setDict(dict);
}

$(() => {
  "use strict";
  var table = $(".clickable:first tbody:first");
  table.children().has("td").remove();
  table.parent().removeClass("clickable");
  var next = location.href;
  function iterate(data) {
    next = $(data).find(".next").attr("href");
    console.log("next: " + next);
    $(data)
      .find(".clickable tr:has(td)")
      .each(function () {
        var tr = $(this);
        var url = tr.find("a").attr("href");
        if (url == undefined) return;
        tr.find("a").attr("href",location.href);
        var time = trimTime(tr.children().eq(10).children().eq(0).text());
        if (checkDate(time) < -3) {
          next = null;
          return false;
        }
        var dict = getDict();
        if (url in dict) return;
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
        table.append(tr);
        dict[url] = time;
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
});
