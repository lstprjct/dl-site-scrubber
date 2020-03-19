// ==UserScript==
// @name         SiteScrubber - Upload.ac
// @namespace    SiteScrubber
// @version      0.1
// @description  Scrub site of ugliness and ease the process of downloading from Upload.ac
// @author       PrimePlaya24
// @icon         https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/icons/upload.ac_favicon.png
// @homepageURL  https://github.com/PrimePlaya24/dl-site-scrubber
// @supportURL   https://github.com/PrimePlaya24/dl-site-scrubber/issues
// @updateURL    https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/scripts/SiteScrubber-Upload.ac.meta.js
// @downloadURL  https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/scripts/SiteScrubber-Upload.ac.user.js
// @match        https://upload.ac/*
// @require      https://code.jquery.com/jquery-1.9.1.min.js
// @run-at document-start
// @grant        none
// ==/UserScript==


(function() {
    'use strict';
    // styling
    $(document).ready(function() {
        $("div.fileInfo").css("background-color", "#323232");
        $($("div.row")[1]).css("background-color", "#212121");
        $("body").css("background-color", "#121212");
        $("html").css("background-color", "#121212");
        $("body").css("color", "white");
        if ($("a.btn-download")[0]) {
            setTimeout(function() {$("a.btn-download")[0].click();}, 1250);
        }
    });
    

    function clean() {
        var t = $("iframe")
        for (var l = 0; l < t.length; l++) {
            if (!t[l].src.includes("google") && !t[l].src.includes("gstatic")) {
                t[l].remove();
            }
        }

        var y = $("script");
        for (var k = 0; k < y.length; k++) {
            if (!y[k].src.includes("google")) {
                y[k].remove();
            }
        }

        $("nav").remove();
        window.J2CC = undefined;
        window.r800 = undefined;
        window.N3rr = undefined;
        window.f4DD = undefined;
        window.r8OO = undefined;
        // window.w8OO = undefined;
        // window.d7CC = undefined;
        // window.D7CC = undefined;
        // window.r7CC = undefined;
        // window.absda = undefined;
        /*
        window.aawChunk = undefined;
        window.firstAggOmg = undefined;
        window.docReady = undefined;
        // window.closure_memoize_cache_ = undefined;
        window.delComment = undefined;
        // window.canRunAds = false;
        // window.canShowAds = false;
        // window.isAdBlockActive = false;
        // window.adsbygoogle = undefined;*/
        // window.IntOnLoad = undefined;
        $("#adblockinfo").remove();
        $("#ak7ybt7800qgtb3fudk8k").remove();
        $("#userdata_el").remove();
        $(".adsBox").remove();
        $("#IL_INSEARCH").remove();
        $("#IL_IF_LEFT").remove();
        $("#IL_IF_RIGHT").remove();
        $(".IL_BASE").remove();
        $("img").remove();
        $("center").remove();
        $("nav").remove();
        $("style").remove();
        $("h3").remove();
        $("ins").remove();
        $("footer").remove();
        // $("body").children("div:first").remove();
        $("#addLinkBtn").remove();
        $("#myDownloadForm > div.container.download.pt50.pb50 > div > div > div > div:nth-child(2)").remove();
        $("div.fmore").remove();
        $("div.checkbox-info").remove();
        $("div.clearfix").remove();
        $("div.dl").removeClass("dl");
        $("div.dl-plus").remove();
        $("div.boxa").remove();
        $("p.finame").remove();
        for (var i = 0; i < $("div").length; i++) {
            if ($("div")[i].innerText.includes("ADBLOCK DETECTED")) {
                $($("div")[i]).remove();
            }
        }
        $($("body > div > a").parent()[0]).remove();
        $("body > div:empty").remove();
        $("#downloadBtnClick").remove();
        document.querySelector("#downloadbtn").style.display = "";


    }
    setInterval(clean, 250);
})();