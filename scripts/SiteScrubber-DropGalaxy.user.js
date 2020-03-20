// ==UserScript==
// @name         SiteScrubber - DropGalaxy.in
// @namespace    SiteScrubber
// @version      0.2
// @description  Scrub site of ugliness and ease the process of downloading DropGalaxy.in
// @author       PrimePlaya24
// @icon         https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/icons/DropGalaxy_favicon.png
// @homepageURL  https://github.com/PrimePlaya24/dl-site-scrubber
// @supportURL   https://github.com/PrimePlaya24/dl-site-scrubber/issues
// @updateURL    https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/scripts/SiteScrubber-DropGalaxy.meta.js
// @downloadURL  https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/scripts/SiteScrubber-DropGalaxy.user.js
// @match        https://dropgalaxy.com/*
// @require      https://code.jquery.com/jquery-1.9.1.min.js
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // styling
    $(document).ready(function() {
        $("div.fileInfo").css("background-color", "#323232");
        $("body > #container").css("background-color", "#212121");
        $("body").css("background-color", "#121212");
        $("html").css("background-color", "#121212");
        $("body").css("color", "white");
    });

    function clean_scripts() {
        var scripts = $("script");
        for (var l = 0; l < scripts.length; l++) {
            if (!scripts[l].src.includes("google") && !scripts[l].src.includes("gstatic")) { // && scripts[l].src != "") {
                scripts[l].remove();
            }
        }
    }
    

    // Modified script to immediately show the download button
    // Original: https://dropgalaxy.com/js/countdown.js


    $(document).ready(function() {
        $('#countdown').each(function(i, e) {
            var downloadbtn = $(e).parent().find('.downloadbtn');
            $(downloadbtn).attr('disabled', false);
            // $(e).fadeOut();
            $('.downloadbtn').attr('disabled', false);
        });
    });

    // End of modified script

    $(document).ready(function() {
        // Clean up
        clean_scripts();

        $("nav").remove();
        $("#gdpr-cookie-notice").remove();
        $("#warning").remove();
        $(".downloadPage > .col-md-12").remove();
        $(".row > .col-md-8").remove();
        $(".adsbygoogle").remove();
        $(".adsbox").remove();
        $("form > div.mt-5.text-center").remove()
        $("body > div > div.row").addClass("justify-content-center");
        $("body > div > div.row > div.col-md-4.mt-5").removeClass("col-md-4").addClass("col-md-8");
        $("#adblock_check").remove();
        $("#adblock_detected").remove();
        $("footer").remove();
        $("body > div.container.pt-5.page.downloadPage > div > div.col-md-12.py-3").remove();
        $("div.mt-5").removeClass("mt-5");


        // If on the final download page, automatically click the download button for you.
        if ($("h1.text-primary")[0]) {
            $("a.btn-block")[0].click();
            $("a.btn-block").mouseenter(function () {
                $(this).data('timeout', setTimeout(function () {
                    $("a.btn-block")[0].click();;
                }, 2000));
            }).mouseleave(function () {
                clearTimeout($(this).data('timeout'));
            });
            setTimeout(function() {
                $("div.container").append($("<div class=\"alert alert-warning mt-5 text-center\">TO PREVENT MALICIOUS REDIRECT, <b>HOVER</b> OVER THE BUTTON FOR 2 SECONDS TO SUBMIT CLEANLY</div>"));
            }, 5000);
        }

    });
})();