// ==UserScript==
// @name         SiteScrubber - DropAPK
// @namespace    SiteScrubber
// @version      0.1
// @description  Scrub site of ugliness and ease the process of downloading
// @author       PrimePlaya24
// @icon         https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/icons/dropapk_favicon.png
// @homepageURL  https://github.com/PrimePlaya24/dl-site-scrubber
// @supportURL   https://github.com/PrimePlaya24/dl-site-scrubber/issues
// @updateURL    https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/scripts/SiteScrubber-DropAPK.meta.js
// @downloadURL  https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/scripts/SiteScrubber-DropAPK.user.js
// @match        https://dropapk.to/*
// @require      https://code.jquery.com/jquery-1.9.1.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    function free() {
        var t = [document.getElementById("method_free")];
        if (t.length == 1) {
            t[0].click();
        }
    }

    // Remove crap
    $(".adsbox").remove();
    $("script").remove();
    $("#content").remove();
    $(".col-md-8").remove();
    $(".col-md-4").addClass("col-md-12");
    $(".col-md-4").removeClass("col-md-4");
    $(".features__section").remove();
    $("nav").remove();
    $("footer").remove();
    $(".payment_methods").remove();

    // Make the remaining elements neat
    $(".download_box").addClass("container");
    $(".download_box > img").css("width", "auto");
    $(".download_box > img").css("height", "40%");
    setTimeout(free(), 3000);



})();