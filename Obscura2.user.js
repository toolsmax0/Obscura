// ==UserScript==
// @name         Obscura2
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Information is Power
// @author       toolsmax
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// @require      https://code.jquery.com/jquery-3.6.1.min.js
// @match        https://mtgdecks.net/Standard/arena*
// @match        https://mtgdecks.net/Standard/BO3*
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
    return;
  }
  if (daysBetween(date, odate) > 0) {
    console.log("New day, flushing dict");
    GM_setValue("date", date);
    flushDict();
  }
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

//delete items that are more than 1 day away from date
function flushDict() {
  var dict = getDict();
  var date = GM_getValue("date", "");
  console.log("date: " + date);
  for (var key in dict) {
    if (daysBetween(date, dict[key]) > 1) {
      delete dict[key];
    }
  }
  setDict(dict);
}

$(() => {
  "use strict";
  $(".clickable tr:has(td)").each(function () {
    var tr = $(this);
    var url = tr.find("a").attr("href");
    if (url == undefined) return;
    var time = trimTime(tr.children().eq(10).children().eq(0).text());
    checkDate(time);
    var dict = getDict();
    if (url in dict) {
      tr.children().eq(4).text("");
      return;
    }
    dict[url] = time;
    setDict(dict);
  });
});
