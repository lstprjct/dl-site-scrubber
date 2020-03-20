// ==UserScript==
// @name         SiteScrubber - Up-Load.io
// @namespace    SiteScrubber
// @version      0.2
// @description  Scrub site of ugliness and ease the process of downloading
// @author       PrimePlaya24
// @icon         https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/icons/Up-Load.io_favicon.png
// @homepageURL  https://github.com/PrimePlaya24/dl-site-scrubber
// @supportURL   https://github.com/PrimePlaya24/dl-site-scrubber/issues
// @updateURL    https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/scripts/SiteScrubber-Up-Load.io.meta.js
// @downloadURL  https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/scripts/SiteScrubber-Up-Load.io.user.js
// @match        https://up-load.io/download.htmlx
// @require      https://code.jquery.com/jquery-1.9.1.min.js
// @run-at       document-start
// @grant        none
// ==/UserScript==


(function() {
    'use strict';

    // styling
    $(document).ready(function() {
        $("div.info").css("background-color", "#323232");
        $("body > #container").css("background-color", "#212121");
        $("body").css("background-color", "#121212");
        $("html").css("background-color", "#121212");
        $("body").css("color", "white");
        $("span.dfilename").css("color", "#999999");
    });


    // window.onbeforescriptexecute = (e) => {
    // FIREFOX only sadly!
    window.addEventListener('beforescriptexecute', function(e) {
        if (!e.target.textContent) {
            return;
        }

        // Prevent execution of a script
        if (e.target.textContent.includes("nt.js")) {
            console.dir(e);
            e.preventDefault();
            e.stopPropagation();
            $(e.target).remove();
        }
    });

    function clean_scripts() {
        var scripts = $("script");
        for (var l = 0; l < scripts.length; l++) {
            if (!scripts[l].src.includes("google") && !scripts[l].src.includes("gstatic")) { // && scripts[l].src != "") {
                scripts[l].remove();
            }
        }
    }


    var clicked = false;
    function first_page() {
        if ($("#method_free")[0]) {
            $("#method_free").click();
            clicked = true;
        } else {

            $('.downloadbtn').attr('disabled', false);
            $("#downloadbtn").css("visibility", "visible");

            $("#downloadbtn").css("font-size", "35px").text("HOVER (2 secs) to DOWNLOAD");

            $("#downloadbtn").mouseenter(function () {
                $(this).data('timeout', setTimeout(function () {
                    $("#downloadbtn")[0].click();;
                }, 2000));
            }).mouseleave(function () {
                clearTimeout($(this).data('timeout'));
            });



            $("#container > div > div.col-md-8.text-center").remove();
            $("#container > div > div.col-md-4.text-center").remove();
            $("#container > div > div.clearfix").remove();
            $("#container > div > div.col-md-12.pt20 > div").remove();
            $("#container > div > div.col-md-12.pt20 > center > li > ol").remove();
            $("meta").remove();
            $("ins").remove();
            $("#gdpr-cookie-notice").remove();
            $("body > div.footer-sub").remove();
            $("nav").remove();
            $("footer").remove();
            $("#container > div > div.col-md-12.pt20 > center > li > ol").remove();
            $("#commonId > a").remove();
            $("#container > div.container.download_page.pt30 > div > div.col-md-8").remove();
            $("#container > div.footer-sub").remove();
            $("body > span").remove();
            $("#container > div style").remove();
            $("body").css("padding", "0 0 0 0");
            $("#container").css("padding", "0 0 0 0");
            $("#container > div > div > div:nth-child(7) > div:nth-child(1) > form > div.rightcol").css("margin", "0 0 0 0");
            // $("body > div:nth-child(2)").remove();

            $("body > div:nth-child(3)").remove();
            $("body > span").remove();
            $("div.share").remove();
            $("span.report").remove();
            $("div.ads").remove();
            $("div.adsbox").remove();
            $("#container > div > div > div:nth-child(4)").remove();
            $("#container").append($("<div class=\"alert alert-warning\">TO PREVENT MALICIOUS REDIRECT, <b>HOVER</b> OVER THE BUTTON FOR 2 SECONDS TO SUBMIT CLEANLY</div>"));

            window.s65c = undefined;
            window.ClipboardJS = undefined;
        }
    }


    setInterval(function() {
        first_page();
        clean_scripts();
    }, 550);


})();
