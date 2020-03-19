// ==UserScript==
// @name         SiteScrubber - MixLoads.com
// @namespace    SiteScrubber
// @version      0.1
// @description  Scrub site of ugliness and ease the process of downloading from MixLoads.com
// @author       PrimePlaya24
// @icon         https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/icons/mixloads.com_favicon.png
// @homepageURL  https://github.com/PrimePlaya24/dl-site-scrubber
// @supportURL   https://github.com/PrimePlaya24/dl-site-scrubber/issues
// @updateURL    https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/scripts/SiteScrubber-DropAPK.meta.js
// @downloadURL  https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/scripts/SiteScrubber-DropAPK.user.js
// @match        https://mixloads.com/*
// @require      https://code.jquery.com/jquery-1.9.1.min.js
// @run-at       document-start
// @grant        none
// ==/UserScript==


// SAME SETUP AS DROPAPK.TO!!

(function() {
    'use strict';

    // styling
    $(document).ready(function() {
        $("div.download_box").css("background-color", "#323232");
        $("body > #container").css("background-color", "#121212");
        $("body").css("background-color", "#121212");
        $("html").css("background-color", "#121212");
        $("body").css("color", "white");
    });

    $(document).ready(function() {
        if ($("#method_free")[0]) {
            $("#method_free")[0].click();
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
        $("p.mb-5").removeClass("mb-5");

        // Make the remaining elements neat
        $(".download_box").addClass("container");
        $(".download_box > img").css("width", "auto");
        $(".download_box > img").css("height", "40%");

        if ($("img")[0]) {
            var clean_input = $("<div class=\"input-group mb-3\"></div").add($("<div class=\"input-group-prepend text-center\"></div>").add(($("<span class=\"input-group-text font-weight-bold\">Captcha Code </span>")).append($("input.captcha_code").addClass("form-control"))));


            $("div.download_box").prepend($(clean_input));
            $("div.download_box").prepend($("img").css("height", "8em"));

            $("#downloadbtn").mouseenter(function () {
                $(this).data('timeout', setTimeout(function () {
                    $("#downloadbtn")[0].click();
                }, 2000));
            }).mouseleave(function () {
                clearTimeout($(this).data('timeout'));
            });
        }

        $("table").remove();

        $("a.btn-block").mouseenter(function () {
            $(this).data('timeout', setTimeout(function () {
                $("a.btn-block")[0].click();
            }, 2000));
        }).mouseleave(function () {
            clearTimeout($(this).data('timeout'));
        });

        setTimeout(function() {
            $("div.download_box").append($("<div class=\"alert alert-warning mt-5 text-center\">TO PREVENT MALICIOUS REDIRECT, <b>HOVER</b> OVER THE BUTTON FOR 2 SECONDS TO SUBMIT CLEANLY</div>"));
        }, 8000);
    });
})();