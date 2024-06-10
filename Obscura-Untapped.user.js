// ==UserScript==
// @name         Obscura-Untapped
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Information is Power
// @author       toolsmax
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-idle
// @require      https://code.jquery.com/jquery-3.7.0.min.js
// @match        https://mtga.untapped.gg/meta?archetypeIds=*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// ==/UserScript==

$(async () => {
  "use strict";
  await new Promise((r) => setTimeout(r, 1000));
  const config = { attributes: true};

  const callback = async function () {
    await new Promise((r) => setTimeout(r, 1000));
    let set = GM_getValue("set", {});
    function check() {
      let a = $(this);
      let url = a.attr("href");
      console.log(url);
      if (url in set) a.remove();
      else set[url] = "";
    }
    console.log("Working");
    $(".iRhQrA a").each(check);
    GM_setValue("set", set);
  };

  callback();
  const observer = new MutationObserver(callback);
  console.log($(".iRhQrA").get(0));
  observer.observe($(".iRhQrA").get(0), config);
});
