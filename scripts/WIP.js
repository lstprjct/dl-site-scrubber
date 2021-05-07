// ==UserScript==
// @name         SiteScrubber - UploadShip.com
// @namespace    SiteScrubber
// @version      1.0
// @description  Scrub site of ugliness and ease the process of downloading from UploadShip.com
// @author       PrimePlaya24
// @icon         https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/icons/UploadShip.com_favicon.png
// @homepageURL  https://github.com/PrimePlaya24/dl-site-scrubber
// @supportURL   https://github.com/PrimePlaya24/dl-site-scrubber/issues
// @updateURL    https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/scripts/SiteScrubber-UploadShip.com.meta.js
// @downloadURL  https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/scripts/SiteScrubber-UploadShip.com.user.js
// @match        https://www.uploadship.com/*
// @require      https://code.jquery.com/jquery-3.5.1.min.js
// @run-at       document-body
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  var o_debug = true;

  const site = `<main id="ss_root" class="container"> <div id="header" class="row justify-content-center"> <h1 class="col-12 text-center">SiteScrubber - Clean Page</h1> <h4>Download your file clean and safely.</h4> </div><div id="dl_box" class="row justify-content-center"> <div style="line-height: 1.6;background-color: #111;border-radius: 12px;" class="col-8 text-center mt-5 mb-3"> <span class="display-5" id="filename">File name here...</span> </div><div class="col-12"> <div class="col-8 mx-auto my-3"> <table class="table table-striped table-dark mx-auto"> <tbody id="tblAdd"> </tbody> </table> </div></div><div id="timer" class="col-12 my-5 text-center"> <span id="auto_submit" class="h5">Time left until you can submit without error: </span> <span id="time" class="display-5"></span> </div><div id="add_here" class="col-12 text-center"></div><div class="col-12 text-center mt-3"> <button id="dl_button">Continue</button> </div></div></main> <script>window.isCaptchaChecked=false; $("#dl_button").on("click", function (){$("form").submit();}); </script>`;

  const format = `<script src="https://code.jquery.com/jquery-3.5.1.min.js" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script> <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"> <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous"></script> <style>html{background-color: #090909 !important;}body{background-color: #090909 !important; color: #dddddd !important;}h1{font-size: min(5vh, 50px) !important;}h4{font-size: min(2vh, 25px) !important; color: #787878 !important;}#header{background-color: #323232 !important; padding: 4vh 4vh 4vh 4vh !important; margin-top: 2% !important; border-radius: 5%/25% !important;}#dl_box{background-color: #232323 !important; margin-top: 25px !important; border-radius: 50px !important;}#dl_button{background: #3949ab !important; border-radius: 10px !important; padding: min(20px, 2vh) 45px !important; color: #dbe0ff !important; display: inline-block !important; font: normal bold min(4vh, 50px) "Calibri", sans-serif !important; text-align: center !important; margin: 40px 0 20px 0 !important;}#dl_button:hover{transition: all 0.3s ease !important; transform: scale(1.025) !important; background: #283593 !important; color: #cecece !important;}.container{border-radius: 50px !important;}#filename{font-size: min(5vh, 32px) !important; color: #d7ddff !important; line-height: 1.6; border-radius: 12px; padding: 8px;}</style>`;

  let finished = false;

  var siteRules = {
    fileup: {
      host: ["www.file-up.org"],
      check: ["#downloadbtn:contains('Download Link')"],
      goal: { download: "a.btn" },
      timer: 63,
      remove: { "div.cc-banner": "*", "body>div": "[id]" },
      constantRemove: true,
      exec: function () {
        // See if there was a page error
        console.log($("#pageErrors"));
        cleaner();
        $("#filename").html(file_info("small", ".apk"));
        $("div#add_here").append($("form").has(".g-recaptcha"));
        //$("body").children().not($("main")).remove();
      },
    },
  };

  function file_info(elem, text) {
    var output = $(elem).filter(function () {
      return $(this).text().toLowerCase().includes(text);
    });
    if (output) {
      return output.text();
    } else {
      return null;
    }
  }

  function autoSubmit() {
    if (
      captchaCheck() &&
      document.querySelector("#time").textContent === "0" &&
      !window.submitted
    ) {
      clearInterval(window.autoSubmit);
      window.submitted = true;
      $("#dl_button").click();
    } else if (captchaCheck()) {
      $("#auto_submit").html("Time until page AUTO-SUBMITS: ");
    } else {
      $("#auto_submit").html("Time left until you can submit without error: ");
    }
  }

  function cleaner() {
    log("Running cleaner!");
    $("link").remove();
    $("style").remove();
    $("head").append(format);
    var scripts = $("script");
    for (var l = 0; l < scripts.length; l++) {
      if (
        !scripts[l].src.includes("google") &&
        !scripts[l].src.includes("gstatic")
      ) {
        scripts[l].remove();
      }
    }
    // Auto check to submit when the page is ready
    window.autoSubmit = setInterval(autoSubmit, 1500);
  }

  function setGlobalVars(dict) {
    if (dict !== undefined) {
      $.each(dict, function (key, curr) {
        window[key] = curr;
      });
    }
  }

  function captchaCheck() {
    try {
      if (grecaptcha) {
        window.isCaptchaChecked =
          grecaptcha && grecaptcha.getResponse().length !== 0;
      }
    } catch (err) {}
    return window.isCaptchaChecked;
  }

  for (var i in siteRules) {
    // Create a RegExp to test if we are on this domain
    var testHosts = new RegExp(siteRules[i].host, "i");
    // If we are on one of the domains
    if (testHosts.test(document.domain)) {
      var currRule = siteRules[i];
      log(currRule);
      break;
    }
  }

  var applyRules = function () {
    if (currRule.check != undefined && !finished) {
      var run = false;
      $.each(currRule.check, (index, val) => {
        if ($(val).length > 0) {
          run = true;
        }
      });
      console.log(`Run: ${run}`);
    }

    $(document).ready($("body").prepend($(site)));

    // Run the script made for that certain website
    if (currRule.exec != undefined && !finished) {
      currRule.exec();
    }

    // Run function to remove all predescibed elements
    if (currRule.remove != undefined && !finished) {
      // Function for elements that need to constantly need to be removed
      // due to them being repopulated - max 250 tries

      if (currRule.constantRemove != undefined && !finished) {
        var count = 1;
        var interval = setInterval(function () {
          count += 1;
          $.each(currRule.remove, function (item, filter) {
            $(item).filter(filter).remove();
            //   log(
            //     `Removed ${item} with filter ${filter}. Interval - [${count}/250]`
            //   );
          });
        }, 500);
        if (count > 250) clearInterval(interval);
      } else {
        $.each(currRule.remove, function (item, filter) {
          $(item).filter(filter).remove();
          // log(`Removed ${item} with filter ${filter}.`);
        });
      }
    }

    if (currRule.goal != undefined && !finished) {
      $(document).ready(
        $.each(currRule.goal, (key, value) => {
          var goal = $(value).attr("href");
          console.log("GOAL222: " + goal);
          if (goal) {
            console.log("GOAL: " + goal);
            if ($(value).attr("href").includes(key)) {
              $("#dl_button").html("DOWNLOAD");
              $("#dl_button").on(
                "click",
                () => (window.location.href = $(value).href)
              );
              window.location.href = $(value).href;
            }
            finished = true;
          }
        })
      );
    }

    // Sets the timer to inform the user how long they have to wait so the
    // server does not reject their early request
    if (currRule.timer != undefined && !finished) {
      var display = $("#time")[0];
      if (display) {
        startTimer(currRule.timer, display);
      }
    }
  };

  function startTimer(duration, display) {
    var start = Date.now(),
      diff,
      seconds;
    function timer() {
      diff = duration - (((Date.now() - start) / 1000) | 0);
      seconds = diff | 0;
      if (seconds != 0) {
        display.textContent = seconds;
        if (diff <= 0) {
          start = Date.now() + 1000;
        }
      } else {
        display.textContent = 0;
        clearInterval(timerStart);
      }
    }
    timer();
    var timerStart = setInterval(timer, 1000);
  }

  // Generic log function
  function log(string) {
    if (o_debug) console.log(string);
  }

  // Google Chrome trick: sometimes the script is executed after that DOMContentLoaded was triggered, in this case we directly run our code
  if (document.readyState == "complete") {
    applyRules();
  } else {
    window.addEventListener("DOMContentLoaded", applyRules);
  }
})();
