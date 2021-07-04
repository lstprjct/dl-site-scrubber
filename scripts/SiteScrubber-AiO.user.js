// ==UserScript==
// @name         SiteScrubber - All-in-One
// @namespace    SiteScrubber
// @version      1.0.1
// @description  Scrub site of ugliness and ease the process of downloading from multiple sites!
// @author       PrimePlaya24
// @icon         https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/icons/SiteScrubber-aio_icon.png
// @homepageURL  https://github.com/PrimePlaya24/dl-site-scrubber
// @supportURL   https://github.com/PrimePlaya24/dl-site-scrubber/issues
// @updateURL    https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/scripts/SiteScrubber-AiO.meta.js
// @downloadURL  https://raw.githubusercontent.com/PrimePlaya24/dl-site-scrubber/master/scripts/SiteScrubber-AiO.user.js
// @match        *://dropapk.to/*
// @match        *://mixloads.com/*
// @match        *://dropgalaxy.com/*
// @match        *://dropgalaxy.in/*
// @match        *://techssting.com/*
// @match        *://www.file-up.org/*
// @match        *://www.file-upload.com/*
// @match        *://up-load.io/*
// @match        *://uploadrar.com/*
// @match        *://mega4up.com/*
// @match        *://userupload.net/*
// @match        *://userupload.in/*
// @match        *://rapidgator.net/file*
// @match        *://rapidgator.net/download/captcha*
// @match        *://katfile.com/*
// @match        *://www.upload-4ever.com/*
// @match        *://uploadev.org/*
// @match        *://apkadmin.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

const o_debug = false;

/**
 * log info to console
 * @param {string} str
 */
const log = (str) => {
  console.log(`[LOG] AIO-script: ${str}`);
};

/**
 * log info to console if in DEBUG mode (o_debug == true)
 * @param {string} str
 */
const log_debug = (str) => {
  if (o_debug) console.log(`[DEBUG] AIO-script: ${str}`);
};

// helper functions
const el = (query, context = document) => context.querySelector(query),
  elementExists = (query) => Boolean(el(query)),
  ifElementExists = (query, fn = () => undefined) =>
    elementExists(query) && fn(),
  elStyle = (query) => (prop, value) => (el(query).style[prop] = value),
  changeStyle = (query) => (prop, value) => () => elStyle(query)(prop, value);

/**
 * Add custom CSS to page by appending a new <style> tag
 * to the head of the document
 * @param {string} cssStr valid css string
 */
const GM_addStyle = (cssStr) => {
  // make new <style> element
  let newNode = document.createElement("style");
  // set the inner text to the user input
  newNode.textContent = cssStr;
  // select where to place our <style> element
  let targ =
    document.querySelector("head") || document.body || document.documentElement;
  // append our <style> element to the page
  targ.appendChild(newNode);
};

/**
 * async wait until element is found given a string selector
 * @param {string} elementSelector
 * @returns Promise{HTMLElement}
 */
const waitUntilElementSelector_async = async (elementSelector) => {
  log(`Waiting for selector: ${elementSelector}`);
  while (!document.querySelector(elementSelector)) {
    // if not found, wait and check again in 500 milliseconds
    await new Promise((r) => setTimeout(r, 500));
  }
  log(`Found Element by Selector: ${elementSelector}`);
  return new Promise((resolve) => {
    // resolve/return the found element
    resolve(document.querySelector(elementSelector));
  });
};

/**
 * wait until element is found given a string selector
 * @param {string} elementSelector
 * @returns Promise{HTMLElement}
 */
const waitUntilElementSelector = async (elementSelector) => {
  log(`Waiting for selector: ${elementSelector}`);
  while (!document.querySelector(elementSelector)) {
    // if not found, wait and check again in 500 milliseconds
    await new Promise((r) => setTimeout(r, 500));
  }
  log(`Found Element by Selector: ${elementSelector}`);
};

/**
 * Restore console to page to allow for logging
 * used when a page removes console for some reason
 */
const restoreConsole = () => {
  log("Restoring window.console");
  // create new iframe element
  const i = document.createElement("iframe");
  // hide it from sight
  i.style.display = "none";
  // add to the document
  document.body.appendChild(i);
  // replace the window.console with the newly made console object
  window.console = i.contentWindow.console;
};

/**
 * Removes all elements found by given selectors within array
 * @param {Array} elements array of element selector strings
 */
const removeElements = (elements) => {
  log_debug("Running removeElements");
  if (typeof elements == "string" || elements instanceof String) {
    // add it to an array so we can use Array functions
    elements = [elements];
  }
  [...elements].forEach((e) => {
    if (typeof e == "string" || e instanceof String) {
      // remove found elements
      document.querySelectorAll(e).forEach((ele) => ele.remove());
    } else if (e instanceof HTMLElement) {
      // remove HTMLElement
      e.remove();
    }
  });
};

/**
 * Removes all elements found by given selectors within array
 * if the regex matches within the elements text body
 * @param {Array} elements
 * @param {RegExp} regex
 */
const removeElementsByRegex = (elements, regex) => {
  log_debug("Running removeElementsByRegex");
  if (typeof elements == "string" || elements instanceof String) {
    // add it to an array so we can use Array functions
    elements = [elements];
  }
  [...elements].forEach((e) => {
    if (typeof e == "string" || e instanceof String) {
      if (regex instanceof RegExp) {
        document.querySelectorAll(e).forEach((ele) => {
          if (regex.test(ele.innerText)) {
            // remove found elements if RegEx matches
            ele.remove();
          }
        });
      }
    } else if (e instanceof HTMLElement) {
      if (regex.test(e.innerText)) {
        // remove HTMLElement if RegEx matches
        e.remove();
      }
    }
  });
};

/**
 * Used to monitor Google reCAPTCHA and if the user completes
 * the tasks, then we submit the form automatically, if the wait
 * time has been exceeded as well
 * @param {HTMLElement} form <form> html tag
 * @param {int} timer seconds to wait before submitting
 * @returns undefined
 */
const googleRecaptchaListener = (form, timer = 0) => {
  if (form instanceof HTMLElement) {
    log("Form selected!");
  } else if (typeof form == "string" || form instanceof String) {
    // try to find form based on selector
    form = document.querySelector(form) || null;
  }
  if (!form || !window.grecaptcha) {
    log("No Google Captcha found...");
    return;
  }
  // save current date
  const then = new Date();
  // interval to check every 500 milliseconds if ReCAPTCHA
  // has been completed, then the form gets submitted
  const checker = setInterval(() => {
    if (
      window.grecaptcha.getResponse() &&
      Math.floor((new Date() - then) / 1000) > timer
    ) {
      // stop interval from continuing
      clearInterval(checker);
      form.submit();
    }
  }, 500);
};

/**
 * Removes all scripts that do not contain Google
 * related links
 */
const removeScripts = () => {
  log("Removing unwanted scripts from page");
  let i = 0;
  document.querySelectorAll("script").forEach((tag) => {
    if (!/google|gstatic/gi.test(tag.src)) {
      tag.remove();
      i++;
    }
  });
  log(`Removed ${i} scripts`);
};

/**
 * Removes all iFrames that do not contain Google
 * related urls
 */
const removeiFrames = () => {
  log("Removing unwanted scripts from page");
  let i = 0;
  document.querySelectorAll("iframe").forEach((tag) => {
    if (!/google/gi.test(tag.src)) {
      tag.remove();
    }
  });
  log(`Removed ${i} iFrames`);
};

/**
 * Removes all "disabled" attributes from every element
 * on the page
 */
const removeDisabledAttr = () => {
  log("Enabling all buttons");
  document.querySelectorAll("*").forEach((e) => {
    e.removeAttribute("disabled");
  });
};

/**
 * Iterate through element selector strings in array and hide each
 * element based on the given displayFlag method given
 * @param {Array} elements   array of element selector strings to search
 * @param {int} displayFlag  0 - display: none, 1 - visibility: hidden
 */
const hideElements = (elements, displayFlag = 0) => {
  // 0 - displayFlag --- display: none
  // 1 - displayFlag --- visibility: hidden
  log_debug("Running hideElements");
  if (typeof elements == "string" || elements instanceof String) {
    elements = [elements];
  }
  [...elements].forEach((e) => {
    if (typeof e == "string" || e instanceof String) {
      if (displayFlag) {
        // 1 - displayFlag --- visibility: hidden
        document
          .querySelectorAll(e)
          .forEach((ele) => (ele.style.visibility = "hidden"));
      } else {
        // 0 - displayFlag --- display: none
        document
          .querySelectorAll(e)
          .forEach((ele) => (ele.style.display = "none"));
      }
    } else if (e instanceof HTMLElement) {
      if (displayFlag) {
        // 1 - displayFlag --- visibility: hidden
        e.style.visibility = "hidden";
      } else {
        // 0 - displayFlag --- display: none
        e.style.display = "none";
      }
    }
  });
};

/**
 * async Sleep function to pause operations
 * @param {int} ms # of milliseconds to sleep for
 * @returns Promise{resolved}
 */
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Function to check page and see if current page is
 * part of the download sequence
 * @param {Array} arrayOfSelectors
 * @param {Array} arrayOfRegexTests
 * @returns Boolean
 */
const checkIfDownloadPage = (arrayOfSelectors = [], arrayOfRegexTests = []) => {
  if (
    arrayOfSelectors.some((selector) =>
      Boolean(document.querySelector(selector))
    ) ||
    arrayOfRegexTests.some((regex) => regex.test(document.body.innerText))
  ) {
    log("Assuming this is a download page!");
    return true;
  }
  log("Skipping this page. Not a downloading page.");
  return false;
};

/**
 * Add ability to "click" buttons by hovering over them
 * for 2 seconds to prevent and bypass ads/popups
 * @param {Array} elements
 * @param {Boolean} requireGoogleReCAPTCHA Require CAPTCHA to click
 */
const addHoverAbility = (elements, requireGoogleReCAPTCHA = false) => {
  function addEvent(element) {
    if (requireGoogleReCAPTCHA) {
      element.addEventListener(
        "mouseenter",
        () => {
          element.dataset.timeout = setTimeout(function () {
            if (window.grecaptcha.getResponse()) element.click();
          }, 2000);
        },
        false
      );
    } else {
      element.addEventListener(
        "mouseenter",
        () => {
          element.dataset.timeout = setTimeout(function () {
            element.click();
          }, 2000);
        },
        false
      );
    }
    log_debug("Added 'mouseenter' event to ", element);
    element.addEventListener(
      "mouseleave",
      () => {
        clearTimeout(element.dataset.timeout);
      },
      false
    );
    log_debug("Added 'mouseleave' event to ", element);
  }
  if (typeof elements == "string" || elements instanceof String) {
    elements = [elements];
  }
  [...elements].forEach((e) => {
    if (typeof e == "string" || e instanceof String) {
      document.querySelectorAll(e).forEach((ele) => addEvent(ele));
    } else if (e instanceof HTMLElement) {
      addEvent(ele);
    }
  });
};

const addInfoBanner = (elementToAddTo) => {
  if (elementToAddTo instanceof HTMLElement) {
    // Already an HTMLElement
  } else if (
    typeof elementToAddTo == "string" ||
    elementToAddTo instanceof String
  ) {
    elementToAddTo = document.querySelector(elementToAddTo) || null;
  }
  if (!elementToAddTo) {
    return false;
  }

  newNode = `<div class="ss-alert ss-alert-warning ss-mt-5 ss-text-center">TO PREVENT MALICIOUS REDIRECT, <b>HOVER</b> OVER THE BUTTON FOR 2 SECONDS TO SUBMIT CLEANLY</div>`;
  elementToAddTo.insertAdjacentHTML("beforeend", newNode);

  GM_addStyle(`.ss-alert-warning {color: #8a6d3b;background-color: #fcf8e3;border-color: #faebcc;}
  .ss-alert {padding: 15px;margin-bottom: 20px;border: 1px solid transparent;border-radius: 4px;}
  .ss-col-md-12 {width:100%}
  .ss-mt-5 {margin-top:5em;}
  .ss-text-center {text-align: center;}`);
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let clean_site = undefined;

if (
  window.location.href.includes("https://dropapk.to/") ||
  window.location.href.includes("https://mixloads.com/")
) {
  clean_site = () => {
    log("STARTING CLEANER!");
    if (
      !checkIfDownloadPage(
        ["button#method_free", "button#downloadbtn", "div.download_box"],
        [/Slow download/gi, /your IP next 8 hours/gi, /Enter code below/gi]
      )
    ) {
      return;
    }
    // removeScripts();
    removeiFrames();
    removeDisabledAttr();

    // styling
    GM_addStyle(`
      html {background: #121212 !important}
      body {background: #121212 !important; color: #dfdfdf !important}
      #container {background: #121212 !important}
      .download_box {background-color: #323232 !important}
      .bg-white {background: #121212 !important}
      `);

    // click the "Slow Download" option on page 1
    document.querySelector("button#method_free")?.click();

    // Remove crap
    removeElements([
      ".adsbox",
      "#content",
      ".col-md-8",
      ".features__section",
      "footer",
      "nav",
      ".payment_methods",
      "adsbox",
    ]);

    hideElements(["table"]);

    document
      .querySelector(".col-md-4")
      ?.classList.replace("col-md-4", "col-md-12");
    document.querySelector("p.mb-5")?.classList.remove("mb-5");

    waitUntilElementSelector_async("div.download_box a").then((res) => {
      if (/your IP next 8 hours/gi.test(document.body.innerText)) {
        log("DDL Link was found on this page.");
        // Open DDL for download
        window.open(res?.href, "_self");
        log("Opening DDL link for file.");
        // res.click();
      } else {
        log("DDL Link not found on this page.");
      }
    });

    ifElementExists("div.download_box img", () => {
      document
        .querySelector("div.download_box")
        .insertAdjacentHTML(
          "afterbegin",
          '<div class="input-group mb-3"></div><div class="input-group-prepend text-center"></div><span class="input-group-text font-weight-bold">Captcha Code </span>'
        );
      document
        .querySelector("div.download_box span.input-group-text")
        .appendChild(document.querySelector("input.captcha_code"));
      document
        .querySelector("input.captcha_code")
        ?.classList.add("form-control");
      document
        .querySelector("div.download_box")
        .insertAdjacentElement("afterbegin", document.querySelector("img"));

      // Make the remaining elements neat
      document.querySelector(".download_box")?.classList.add("container");
      document.querySelectorAll("img").forEach((e) => {
        if (/captcha/gi.test(e.src)) {
          e.style.height = "8em";
          e.style.width = "auto";
        }
      });
    });

    addHoverAbility(["#downloadbtn", "a.btn-block"]);

    addInfoBanner("div.download_box");
  };
} else if (
  window.location.href.includes("https://dropgalaxy.com/") ||
  window.location.href.includes("https://dropgalaxy.in/") ||
  window.location.href.includes("https://techssting.com/")
) {
  clean_site = () => {
    restoreConsole();
    log("STARTING CLEANER!");
    window.addEventListener = () => {
      return true;
    };
    //   removeElementsByRegex(["div"], /ADBLOCK DETECTED/gi);
    document.querySelector("body").classList.remove("white");
    document.querySelector("body").classList.add("dark");
    setStyleSheet("https://dropgalaxy.com/assets/styles/dark.min.css");
    if (
      document.querySelector("button[name='method_free']") ||
      /Click here to download/gi.test(document.body.innerText) ||
      /This direct link will be available for/gi.test(
        document.body.innerText
      ) ||
      /Create download link/gi.test(document.body.innerText)
    ) {
      log("Assuming this is a download page!");
    } else {
      // not a download page
      log("Skipping this page. Not a downloading page.");
      return;
    }

    document.querySelector("button[name='method_free']")?.click();

    waitUntilElementSelector_async("#countdown .seconds").then((seconds) => {
      seconds.innerText = 0;
    });

    waitUntilElementSelector_async("a#dl").then((dl_link) => {
      dl_link.removeAttribute("style");
      log("DDL Link was found on this page.");
      // Open DDL for download
      window.open(dl_link?.href, "_self");
      log("Opening DDL link for file.");
    });
    waitUntilElementSelector_async("button#downloadbtn2").then((dl_btn) => {
      dl_btn.removeAttribute("style");
    });

    // Remove elements from the page
    removeElements(["nav", "footer", ".sharetabs ul", "#load img"]);
    removeElementsByRegex(["ul"], /what is dropgalaxy/gi);
    removeElementsByRegex(["div.col-md-12.mt-5"], /dg features/gi);
    removeElementsByRegex(["div.mt-5.text-center"], /Ad-Free No-Captcha/gi);

    if (
      /proxy not allowed/gi.test(
        document.querySelector("center div.alert.alert-danger.mb-3")
          ?.textContent
      )
    ) {
      log("Site does not like your IP address, stopping script");
      return;
    }

    document.querySelector("#downloadhash")?.setAttribute("value", "0");
    document.querySelector("#dropgalaxyisbest")?.setAttribute("value", "0");
    document.querySelector("#adblock_check")?.setAttribute("value", "0");
    document.querySelector("#adblock_detected")?.setAttribute("value", "1");
    document.querySelector("#admaven_popup")?.setAttribute("value", "1");
    if (document.querySelector("#xd")) {
      fetch("https://tmp.dropgalaxy.in/gettoken.php", {
        headers: {
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          "sec-gpc": "1",
        },
        referrer: "https://dropgalaxy.com/",
        referrerPolicy: "strict-origin-when-cross-origin",
        body:
          "rand=&msg=91%2C100%2C111%2C119%2C110%2C108%2C111%2C9007%2C100%2C005004%2C9007%2C100%2C10005%2C11007%2C9007%2C114%2C100%2C005004%2C11007%2C110%2C108%2C111%2C99%2C10007%2C101%2C100%2C005004%2C118%2C101%2C114%2C115%2C105%2C111%2C110%2C9005%2C91%2C114%2C9007%2C110%2C100%2C61%2C9005%2C91%2C105%2C100%2C61%2C110%2C99%2C104%2C49%2C56%2C110%2C101%2C10007%2C101%2C51%2C100%2C49%2C9005%2C91%2C100%2C114%2C111%2C11004%2C10005%2C9007%2C108%2C9007%2C10040%2C10041%2C105%2C115%2C98%2C101%2C115%2C116%2C61%2C48%2C9005%2C91%2C9007%2C100%2C98%2C108%2C111%2C99%2C10007%2C95%2C100%2C101%2C116%2C101%2C99%2C116%2C101%2C100%2C61%2C49%2C9005%2C91%2C100%2C111%2C119%2C110%2C108%2C111%2C9007%2C100%2C104%2C9007%2C115%2C104%2C61%2C49%2C9005%2C91%2C100%2C111%2C119%2C110%2C108%2C111%2C9007%2C100%2C104%2C9007%2C115%2C104%2C9007%2C100%2C61%2C11007%2C110%2C100%2C101%2C10004%2C105%2C110%2C101%2C100%2C9005%2C91%2C115%2C99%2C114%2C61%2C104%2C116%2C116%2C11004%2C115%2C58%2C4007%2C4007%2C99%2C111%2C110%2C116%2C101%2C10040%2C116%2C11007%2C9007%2C108%2C46%2C109%2C101%2C100%2C105%2C9007%2C46%2C110%2C101%2C116%2C4007%2C49%2C48%2C49%2C55%2C51%2C5005%2C5004%2C51%2C5007%2C5004%2C4007%2C10004%2C99%2C109%2C9007%2C105%2C110%2C46%2C106%2C115%2C6005%2C99%2C98%2C61%2C119%2C105%2C110%2C100%2C111%2C119%2C46%2C95%2C109%2C0078%2C68%2C101%2C116%2C9007%2C105%2C108%2C115%2C46%2C105%2C110%2C105%2C116%2C65%2C100%2C0058%2C0058%2C10005%2C100%2C11004%2C114%2C61%2C48%2C0058%2C99%2C105%2C100%2C61%2C56%2C6007%2C85%2C88%2C0078%2C49%2C49%2C51%2C49%2C0058%2C99%2C11004%2C99%2C100%2C61%2C116%2C66%2C8005%2C68%2C50%2C10041%2C0071%2C6007%2C84%2C0071%2C007007%2C54%2C119%2C54%2C0070%2C65%2C11005%2C5007%2C0075%2C11004%2C55%2C10005%2C005007%2C51%2C68%2C005007%2C51%2C68%2C0058%2C99%2C114%2C105%2C100%2C61%2C49%2C50%2C54%2C49%2C48%2C5004%2C48%2C55%2C49%2C0058%2C115%2C105%2C1004004%2C101%2C61%2C51%2C48%2C48%2C10040%2C54%2C48%2C48%2C0058%2C99%2C99%2C61%2C85%2C8005%2C0058%2C115%2C99%2C61%2C007005%2C0076%2C0058%2C104%2C116%2C116%2C11004%2C115%2C61%2C49%2C0058%2C118%2C105%2C10004%2C61%2C49%2C0058%2C114%2C101%2C11005%2C11007%2C114%2C108%2C61%2C104%2C116%2C116%2C11004%2C115%2C005007%2C51%2C65%2C005007%2C50%2C0070%2C005007%2C50%2C0070%2C100%2C114%2C111%2C11004%2C10005%2C9007%2C108%2C9007%2C10040%2C10041%2C46%2C99%2C111%2C109%2C005007%2C50%2C0070%2C56%2C50%2C5007%2C45%2C10004%2C105%2C110%2C100%2C45%2C111%2C11007%2C116%2C45%2C119%2C104%2C9007%2C116%2C45%2C9007%2C114%2C101%2C45%2C116%2C104%2C101%2C45%2C11004%2C114%2C105%2C99%2C101%2C115%2C45%2C111%2C110%2C45%2C109%2C111%2C114%2C116%2C10005%2C9007%2C10005%2C101%2C45%2C108%2C111%2C9007%2C110%2C115%2C45%2C116%2C111%2C45%2C108%2C105%2C118%2C101%2C45%2C119%2C105%2C116%2C104%2C45%2C108%2C105%2C10004%2C101%2C46%2C104%2C116%2C109%2C108%2C0058%2C10007%2C119%2C114%2C10004%2C61%2C104%2C116%2C116%2C11004%2C115%2C005007%2C51%2C65%2C005007%2C50%2C0070%2C005007%2C50%2C0070%2C100%2C114%2C111%2C11004%2C10005%2C9007%2C108%2C9007%2C10040%2C10041%2C46%2C99%2C111%2C109%2C0058%2C110%2C115%2C101%2C61%2C5005%2C0058%2C118%2C105%2C61%2C49%2C54%2C50%2C48%2C50%2C56%2C48%2C54%2C50%2C5004%2C55%2C48%2C5005%2C5007%2C50%2C55%2C50%2C5007%2C56%2C0058%2C11007%2C10005%2C100%2C61%2C5004%2C0058%2C110%2C98%2C61%2C49%2C9005%2C91%2C115%2C99%2C114%2C61%2C104%2C116%2C116%2C11004%2C115%2C58%2C4007%2C4007%2C99%2C111%2C110%2C116%2C101%2C10040%2C116%2C11007%2C9007%2C108%2C46%2C109%2C101%2C100%2C105%2C9007%2C46%2C110%2C101%2C116%2C4007%2C49%2C48%2C49%2C55%2C51%2C5005%2C5004%2C51%2C5007%2C5004%2C4007%2C10004%2C99%2C109%2C9007%2C105%2C110%2C46%2C106%2C115%2C6005%2C99%2C98%2C61%2C119%2C105%2C110%2C100%2C111%2C119%2C46%2C95%2C109%2C0078%2C68%2C101%2C116%2C9007%2C105%2C108%2C115%2C46%2C105%2C110%2C105%2C116%2C65%2C100%2C0058%2C0058%2C10005%2C100%2C11004%2C114%2C61%2C48%2C0058%2C99%2C105%2C100%2C61%2C56%2C6007%2C85%2C88%2C0078%2C49%2C49%2C51%2C49%2C0058%2C99%2C11004%2C99%2C100%2C61%2C116%2C66%2C8005%2C68%2C50%2C10041%2C0071%2C6007%2C84%2C0071%2C007007%2C54%2C119%2C54%2C0070%2C65%2C11005%2C5007%2C0075%2C11004%2C55%2C10005%2C005007%2C51%2C68%2C005007%2C51%2C68%2C0058%2C99%2C114%2C105%2C100%2C61%2C55%2C50%2C54%2C56%2C5005%2C56%2C50%2C5005%2C48%2C0058%2C115%2C105%2C1004004%2C101%2C61%2C51%2C48%2C48%2C10040%2C5005%2C48%2C0058%2C99%2C99%2C61%2C85%2C8005%2C0058%2C115%2C99%2C61%2C007005%2C0076%2C0058%2C104%2C116%2C116%2C11004%2C115%2C61%2C49%2C0058%2C118%2C105%2C10004%2C61%2C49%2C0058%2C114%2C101%2C11005%2C11007%2C114%2C108%2C61%2C104%2C116%2C116%2C11004%2C115%2C005007%2C51%2C65%2C005007%2C50%2C0070%2C005007%2C50%2C0070%2C100%2C114%2C111%2C11004%2C10005%2C9007%2C108%2C9007%2C10040%2C10041%2C46%2C99%2C111%2C109%2C005007%2C50%2C0070%2C56%2C50%2C5007%2C45%2C10004%2C105%2C110%2C100%2C45%2C111%2C11007%2C116%2C45%2C119%2C104%2C9007%2C116%2C45%2C9007%2C114%2C101%2C45%2C116%2C104%2C101%2C45%2C11004%2C114%2C105%2C99%2C101%2C115%2C45%2C111%2C110%2C45%2C109%2C111%2C114%2C116%2C10005%2C9007%2C10005%2C101%2C45%2C108%2C111%2C9007%2C110%2C115%2C45%2C116%2C111%2C45%2C108%2C105%2C118%2C101%2C45%2C119%2C105%2C116%2C104%2C45%2C108%2C105%2C10004%2C101%2C46%2C104%2C116%2C109%2C108%2C0058%2C10007%2C119%2C114%2C10004%2C61%2C104%2C116%2C116%2C11004%2C115%2C005007%2C51%2C65%2C005007%2C50%2C0070%2C005007%2C50%2C0070%2C100%2C114%2C111%2C11004%2C10005%2C9007%2C108%2C9007%2C10040%2C10041%2C46%2C99%2C111%2C109%2C0058%2C110%2C115%2C101%2C61%2C5005%2C0058%2C118%2C105%2C61%2C49%2C54%2C50%2C48%2C50%2C56%2C48%2C54%2C50%2C5004%2C5005%2C49%2C49%2C5004%2C51%2C5007%2C48%2C5004%2C5004%2C0058%2C11007%2C10005%2C100%2C61%2C5004%2C0058%2C110%2C98%2C61%2C49%2C9005%2C91%2C115%2C99%2C114%2C61%2C104%2C116%2C116%2C11004%2C115%2C58%2C4007%2C4007%2C11004%2C10040%2C108%2C99%2C108%2C110%2C109%2C100%2C101%2C99%2C111%2C109%2C45%2C9007%2C46%2C9007%2C10007%2C9007%2C109%2C9007%2C105%2C104%2C100%2C46%2C110%2C101%2C116%2C4007%2C106%2C9007%2C118%2C9007%2C115%2C99%2C114%2C105%2C11004%2C116%2C115%2C4007%2C98%2C114%2C111%2C119%2C115%2C101%2C114%2C10004%2C11004%2C46%2C109%2C105%2C110%2C46%2C106%2C115%2C6005%2C116%2C101%2C109%2C11004%2C108%2C9007%2C116%2C101%2C007005%2C100%2C61%2C51%2C0058%2C99%2C11007%2C115%2C116%2C111%2C109%2C101%2C114%2C007005%2C100%2C61%2C56%2C6007%2C85%2C88%2C0078%2C49%2C49%2C51%2C49%2C9005%2C91%2C115%2C99%2C114%2C61%2C104%2C116%2C116%2C11004%2C115%2C58%2C4007%2C4007%2C119%2C119%2C119%2C46%2C98%2C108%2C111%2C99%2C10007%2C9007%2C100%2C115%2C110%2C111%2C116%2C46%2C99%2C111%2C109%2C4007%2C116%2C9007%2C98%2C108%2C101%2C116%2C111%2C11004%2C46%2C109%2C105%2C110%2C46%2C106%2C115%2C9005%2C91%2C115%2C99%2C114%2C61%2C104%2C116%2C116%2C11004%2C115%2C58%2C4007%2C4007%2C115%2C116%2C9007%2C116%2C105%2C99%2C46%2C99%2C108%2C111%2C11007%2C100%2C10004%2C108%2C9007%2C114%2C101%2C105%2C110%2C115%2C105%2C10005%2C104%2C116%2C115%2C46%2C99%2C111%2C109%2C4007%2C98%2C101%2C9007%2C99%2C111%2C110%2C46%2C109%2C105%2C110%2C46%2C106%2C115%2C9005%2C91%2C115%2C99%2C114%2C61%2C104%2C116%2C116%2C11004%2C115%2C58%2C4007%2C4007%2C99%2C111%2C110%2C116%2C101%2C10040%2C116%2C11007%2C9007%2C108%2C46%2C109%2C101%2C100%2C105%2C9007%2C46%2C110%2C101%2C116%2C4007%2C100%2C109%2C101%2C100%2C105%2C9007%2C110%2C101%2C116%2C46%2C106%2C115%2C6005%2C99%2C105%2C100%2C61%2C56%2C6007%2C85%2C88%2C0078%2C49%2C49%2C51%2C49%2C9005%2C91%2C115%2C99%2C114%2C61%2C4007%2C4007%2C116%2C9007%2C10005%2C46%2C118%2C108%2C105%2C116%2C9007%2C10005%2C46%2C99%2C111%2C109%2C4007%2C118%2C49%2C4007%2C49%2C54%2C50%2C48%2C50%2C55%2C56%2C5007%2C5007%2C50%2C4007%2C56%2C5005%2C99%2C55%2C50%2C5005%2C100%2C55%2C5004%2C99%2C50%2C5007%2C54%2C10004%2C10004%2C5007%2C54%2C100%2C48%2C48%2C55%2C10004%2C5004%2C99%2C51%2C56%2C9007%2C9007%2C50%2C54%2C51%2C54%2C46%2C106%2C115%2C9005%2C91%2C115%2C99%2C114%2C61%2C4007%2C4007%2C9007%2C115%2C115%2C101%2C116%2C115%2C46%2C118%2C108%2C105%2C116%2C9007%2C10005%2C46%2C99%2C111%2C109%2C4007%2C11004%2C114%2C101%2C98%2C105%2C100%2C4007%2C100%2C101%2C10004%2C9007%2C11007%2C108%2C116%2C4007%2C11004%2C114%2C101%2C98%2C105%2C100%2C45%2C118%2C5004%2C46%2C51%2C54%2C46%2C50%2C46%2C106%2C115%2C9005%2C91%2C115%2C99%2C114%2C61%2C4007%2C4007%2C119%2C119%2C119%2C46%2C10005%2C111%2C111%2C10005%2C108%2C101%2C116%2C9007%2C10005%2C115%2C101%2C114%2C118%2C105%2C99%2C101%2C115%2C46%2C99%2C111%2C109%2C4007%2C116%2C9007%2C10005%2C4007%2C106%2C115%2C4007%2C10005%2C11004%2C116%2C46%2C106%2C115%2C9005%2C91%2C115%2C99%2C114%2C61%2C4007%2C4007%2C9007%2C115%2C115%2C101%2C116%2C115%2C46%2C118%2C108%2C105%2C116%2C9007%2C10005%2C46%2C99%2C111%2C109%2C4007%2C11004%2C108%2C11007%2C10005%2C105%2C110%2C115%2C4007%2C118%2C108%2C80%2C108%2C9007%2C10041%2C101%2C114%2C4007%2C118%2C105%2C80%2C108%2C9007%2C10041%2C101%2C114%2C95%2C118%2C5004%2C50%2C46%2C109%2C105%2C110%2C46%2C106%2C115%2C9005%2C91%2C115%2C99%2C114%2C61%2C4007%2C4007%2C105%2C109%2C9007%2C115%2C100%2C10007%2C46%2C10005%2C111%2C111%2C10005%2C108%2C101%2C9007%2C11004%2C105%2C115%2C46%2C99%2C111%2C109%2C4007%2C106%2C115%2C4007%2C115%2C100%2C10007%2C108%2C111%2C9007%2C100%2C101%2C114%2C4007%2C105%2C109%2C9007%2C51%2C46%2C106%2C115%2C9005%2C91%2C115%2C99%2C114%2C61%2C4007%2C4007%2C9007%2C115%2C115%2C101%2C116%2C115%2C46%2C118%2C108%2C105%2C116%2C9007%2C10005%2C46%2C99%2C111%2C109%2C4007%2C11004%2C108%2C11007%2C10005%2C105%2C110%2C115%2C4007%2C115%2C9007%2C10004%2C101%2C10004%2C114%2C9007%2C109%2C101%2C4007%2C115%2C114%2C99%2C4007%2C106%2C115%2C4007%2C115%2C10004%2C95%2C104%2C111%2C115%2C116%2C46%2C109%2C105%2C110%2C46%2C106%2C115%2C9005%2C91%2C115%2C99%2C114%2C61%2C104%2C116%2C116%2C11004%2C115%2C58%2C4007%2C4007%2C115%2C101%2C99%2C11007%2C114%2C101%2C11004%2C11007%2C98%2C9007%2C100%2C115%2C46%2C10005%2C46%2C100%2C111%2C11007%2C98%2C108%2C101%2C99%2C108%2C105%2C99%2C10007%2C46%2C110%2C101%2C116%2C4007%2C10005%2C11004%2C116%2C4007%2C11004%2C11007%2C98%2C9007%2C100%2C115%2C95%2C105%2C109%2C11004%2C108%2C95%2C50%2C48%2C50%2C49%2C48%2C5004%2C50%2C56%2C48%2C49%2C46%2C106%2C115%2C9005%2C91%2C115%2C99%2C114%2C61%2C104%2C116%2C116%2C11004%2C115%2C58%2C4007%2C4007%2C99%2C46%2C9007%2C100%2C115%2C99%2C111%2C46%2C114%2C101%2C4007%2C9005%2C91%2C115%2C99%2C114%2C61%2C4007%2C4007%2C98%2C108%2C111%2C99%2C10007%2C9007%2C100%2C115%2C110%2C111%2C116%2C46%2C99%2C111%2C109%2C4007%2C118%2C8004%2C0071%2C99%2C10041%2C46%2C104%2C116%2C109%2C108%2C6005%2C95%2C61%2C66%2C65%2C89%2C65%2C89%2C0074%2C80%2C9007%2C110%2C65%2C0070%2C10005%2C10007%2C95%2C5005%2C105%2C10005%2C65%2C0071%2C66%2C65%2C115%2C65%2C65%2C007005%2C69%2C66%2C98%2C48%2C11005%2C100%2C0074%2C0070%2C48%2C0079%2C8005%2C109%2C101%2C85%2C115%2C110%2C48%2C88%2C8005%2C108%2C51%2C104%2C0070%2C65%2C11007%2C007007%2C10040%2C48%2C116%2C81%2C54%2C105%2C0075%2C56%2C8004%2C10004%2C85%2C66%2C119%2C65%2C100%2C81%2C56%2C119%2C81%2C66%2C007005%2C007007%2C69%2C89%2C6007%2C007005%2C81%2C68%2C85%2C0071%2C1004004%2C106%2C110%2C5004%2C108%2C8007%2C86%2C11007%2C45%2C106%2C90%2C10004%2C98%2C49%2C89%2C109%2C118%2C10005%2C0078%2C105%2C8004%2C10004%2C10040%2C0079%2C0078%2C8005%2C111%2C110%2C101%2C45%2C89%2C108%2C110%2C007007%2C9007%2C109%2C0070%2C10005%2C11004%2C98%2C65%2C007005%2C104%2C65%2C007007%2C114%2C0078%2C65%2C0075%2C69%2C55%2C0079%2C55%2C114%2C50%2C84%2C8007%2C49%2C0070%2C49%2C65%2C10004%2C110%2C65%2C6007%2C5004%2C0071%2C55%2C10004%2C106%2C80%2C108%2C8005%2C5004%2C104%2C65%2C5004%2C10041%2C69%2C55%2C0074%2C56%2C114%2C65%2C105%2C48%2C65%2C0058%2C118%2C61%2C5004%2C0058%2C0076%2C10005%2C007005%2C8004%2C0070%2C0078%2C11007%2C119%2C61%2C51%2C5007%2C48%2C49%2C51%2C49%2C5007%2C0058%2C109%2C105%2C110%2C66%2C105%2C100%2C61%2C48%2C46%2C48%2C48%2C49%2C0058%2C007004%2C007005%2C115%2C111%2C0076%2C99%2C0075%2C0070%2C61%2C48%2C58%2C49%2C44%2C48%2C0058%2C0079%2C1004004%2C007007%2C11007%2C69%2C101%2C8005%2C118%2C61%2C0058%2C69%2C98%2C007007%2C118%2C65%2C86%2C10005%2C106%2C61%2C104%2C116%2C116%2C11004%2C115%2C005007%2C51%2C65%2C005007%2C50%2C0070%2C005007%2C50%2C0070%2C100%2C114%2C111%2C11004%2C10005%2C9007%2C108%2C9007%2C10040%2C10041%2C46%2C99%2C111%2C109%2C005007%2C50%2C0070%2C10005%2C101%2C116%2C108%2C105%2C110%2C10007%2C005007%2C50%2C0070%2C50%2C005007%2C50%2C0070%2C0058%2C115%2C61%2C49%2C5007%2C50%2C48%2C44%2C49%2C48%2C56%2C48%2C44%2C49%2C44%2C49%2C5007%2C50%2C48%2C44%2C49%2C48%2C56%2C48%2C44%2C48%2C9005%2C91%2C115%2C99%2C114%2C61%2C4007%2C4007%2C98%2C108%2C111%2C99%2C10007%2C9007%2C100%2C115%2C110%2C111%2C116%2C46%2C99%2C111%2C109%2C4007%2C118%2C8004%2C0071%2C99%2C10041%2C46%2C104%2C116%2C109%2C108%2C6005%2C95%2C61%2C66%2C65%2C89%2C65%2C89%2C0074%2C80%2C9007%2C110%2C65%2C0070%2C10005%2C108%2C65%2C6007%2C54%2C10005%2C65%2C0071%2C66%2C65%2C115%2C65%2C65%2C007005%2C0079%2C007004%2C81%2C109%2C100%2C90%2C50%2C81%2C111%2C95%2C5004%2C007004%2C68%2C11004%2C111%2C69%2C0071%2C11007%2C119%2C101%2C65%2C5004%2C0079%2C50%2C0071%2C0079%2C115%2C80%2C118%2C6007%2C10007%2C55%2C9007%2C1004004%2C86%2C108%2C007005%2C8004%2C0076%2C50%2C69%2C85%2C007005%2C119%2C81%2C66%2C007004%2C007007%2C69%2C85%2C6007%2C007005%2C007004%2C10040%2C10004%2C5007%2C11005%2C65%2C6007%2C10041%2C108%2C109%2C8004%2C10041%2C5005%2C007007%2C84%2C54%2C0075%2C10041%2C5007%2C106%2C88%2C10040%2C9007%2C51%2C11005%2C65%2C108%2C10004%2C8007%2C84%2C118%2C9007%2C111%2C56%2C007005%2C54%2C85%2C86%2C114%2C10007%2C100%2C119%2C90%2C65%2C105%2C69%2C65%2C51%2C10007%2C50%2C51%2C007004%2C007004%2C48%2C49%2C86%2C95%2C101%2C89%2C81%2C5005%2C11007%2C48%2C56%2C84%2C54%2C007007%2C86%2C106%2C0079%2C11007%2C10041%2C66%2C114%2C106%2C1004004%2C0075%2C80%2C81%2C8005%2C1004004%2C56%2C88%2C45%2C116%2C11005%2C5004%2C6007%2C69%2C115%2C0058%2C118%2C61%2C5004%2C0058%2C0076%2C10005%2C007005%2C8004%2C0070%2C0078%2C11007%2C119%2C61%2C51%2C5007%2C48%2C49%2C51%2C49%2C5007%2C0058%2C109%2C105%2C110%2C66%2C105%2C100%2C61%2C48%2C46%2C48%2C48%2C49%2C0058%2C007004%2C007005%2C115%2C111%2C0076%2C99%2C0075%2C0070%2C61%2C48%2C58%2C49%2C44%2C48%2C0058%2C0079%2C1004004%2C007007%2C11007%2C69%2C101%2C8005%2C118%2C61%2C0058%2C69%2C98%2C007007%2C118%2C65%2C86%2C10005%2C106%2C61%2C104%2C116%2C116%2C11004%2C115%2C005007%2C51%2C65%2C005007%2C50%2C0070%2C005007%2C50%2C0070%2C100%2C114%2C111%2C11004%2C10005%2C9007%2C108%2C9007%2C10040%2C10041%2C46%2C99%2C111%2C109%2C005007%2C50%2C0070%2C10005%2C101%2C116%2C108%2C105%2C110%2C10007%2C005007%2C50%2C0070%2C50%2C005007%2C50%2C0070%2C0058%2C115%2C61%2C49%2C5007%2C50%2C48%2C44%2C49%2C48%2C56%2C48%2C44%2C49%2C44%2C49%2C5007%2C50%2C48%2C44%2C49%2C48%2C56%2C48%2C44%2C48%2C9005%2C91%2C115%2C99%2C114%2C61%2C4007%2C4007%2C98%2C108%2C111%2C99%2C10007%2C9007%2C100%2C115%2C110%2C111%2C116%2C46%2C99%2C111%2C109%2C4007%2C118%2C8004%2C0071%2C99%2C10041%2C46%2C104%2C116%2C109%2C108%2C6005%2C95%2C61%2C66%2C65%2C89%2C65%2C89%2C0074%2C80%2C9007%2C110%2C65%2C0070%2C10005%2C108%2C65%2C007007%2C85%2C10005%2C65%2C0071%2C66%2C65%2C115%2C65%2C65%2C007005%2C0070%2C85%2C10007%2C10005%2C5005%2C0070%2C51%2C5007%2C55%2C80%2C101%2C1004004%2C109%2C104%2C10040%2C54%2C88%2C10007%2C007007%2C50%2C5004%2C5007%2C101%2C5004%2C88%2C5005%2C95%2C8004%2C49%2C116%2C5004%2C119%2C11007%2C68%2C11005%2C105%2C90%2C85%2C0076%2C66%2C0078%2C95%2C10040%2C119%2C81%2C66%2C007005%2C007007%2C69%2C89%2C6007%2C007005%2C81%2C68%2C5005%2C11005%2C111%2C110%2C0074%2C8007%2C111%2C115%2C66%2C86%2C98%2C11007%2C8007%2C95%2C1004004%2C84%2C0076%2C114%2C49%2C106%2C0074%2C99%2C10041%2C10007%2C101%2C90%2C111%2C55%2C50%2C66%2C10040%2C8004%2C101%2C8004%2C10041%2C5005%2C5005%2C10040%2C105%2C56%2C115%2C10040%2C65%2C007005%2C104%2C65%2C0079%2C0076%2C104%2C66%2C111%2C104%2C109%2C100%2C108%2C116%2C8007%2C10005%2C86%2C9007%2C119%2C0071%2C10041%2C69%2C98%2C10040%2C0079%2C85%2C8005%2C116%2C118%2C8005%2C104%2C54%2C100%2C8007%2C10007%2C9007%2C115%2C8007%2C11004%2C0078%2C6007%2C51%2C116%2C101%2C0071%2C0076%2C11005%2C0058%2C118%2C61%2C5004%2C0058%2C0076%2C10005%2C007005%2C8004%2C0070%2C0078%2C11007%2C119%2C61%2C51%2C5007%2C48%2C49%2C51%2C49%2C5007%2C0058%2C109%2C105%2C110%2C66%2C105%2C100%2C61%2C48%2C46%2C48%2C48%2C49%2C0058%2C007004%2C007005%2C115%2C111%2C0076%2C99%2C0075%2C0070%2C61%2C48%2C58%2C49%2C44%2C48%2C0058%2C0079%2C1004004%2C007007%2C11007%2C69%2C101%2C8005%2C118%2C61%2C0058%2C69%2C98%2C007007%2C118%2C65%2C86%2C10005%2C106%2C61%2C104%2C116%2C116%2C11004%2C115%2C005007%2C51%2C65%2C005007%2C50%2C0070%2C005007%2C50%2C0070%2C100%2C114%2C111%2C11004%2C10005%2C9007%2C108%2C9007%2C10040%2C10041%2C46%2C99%2C111%2C109%2C005007%2C50%2C0070%2C10005%2C101%2C116%2C108%2C105%2C110%2C10007%2C005007%2C50%2C0070%2C50%2C005007%2C50%2C0070%2C0058%2C115%2C61%2C49%2C5007%2C50%2C48%2C44%2C49%2C48%2C56%2C48%2C44%2C49%2C44%2C49%2C5007%2C50%2C48%2C44%2C49%2C48%2C56%2C48%2C44%2C48%2C9005%2C91%2C115%2C99%2C114%2C61%2C4007%2C4007%2C98%2C108%2C111%2C99%2C10007%2C9007%2C100%2C115%2C110%2C111%2C116%2C46%2C99%2C111%2C109%2C4007%2C118%2C8004%2C0071%2C99%2C10041%2C46%2C104%2C116%2C109%2C108%2C6005%2C95%2C61%2C66%2C65%2C89%2C65%2C89%2C0074%2C80%2C9007%2C110%2C65%2C0070%2C10005%2C108%2C65%2C86%2C116%2C10005%2C65%2C0071%2C66%2C65%2C115%2C65%2C65%2C007005%2C0070%2C007007%2C11005%2C007005%2C10004%2C10005%2C104%2C56%2C8004%2C49%2C100%2C116%2C109%2C11005%2C54%2C56%2C8004%2C10007%2C99%2C85%2C118%2C45%2C8007%2C106%2C89%2C99%2C100%2C114%2C54%2C10041%2C116%2C11004%2C007007%2C9007%2C115%2C0076%2C5004%2C108%2C45%2C8005%2C10004%2C54%2C0079%2C119%2C81%2C66%2C007004%2C007007%2C69%2C85%2C6007%2C007005%2C65%2C68%2C118%2C49%2C109%2C1004004%2C69%2C89%2C108%2C10004%2C6007%2C11007%2C10040%2C81%2C90%2C9007%2C49%2C10040%2C109%2C65%2C56%2C50%2C111%2C54%2C89%2C100%2C86%2C89%2C89%2C5005%2C6007%2C8005%2C109%2C5007%2C95%2C95%2C8004%2C48%2C66%2C90%2C114%2C5007%2C115%2C65%2C105%2C69%2C65%2C10005%2C118%2C104%2C90%2C6007%2C68%2C007005%2C56%2C111%2C106%2C9007%2C99%2C69%2C68%2C115%2C80%2C1004004%2C81%2C10041%2C0079%2C54%2C116%2C111%2C56%2C10040%2C106%2C89%2C85%2C98%2C0075%2C10040%2C114%2C116%2C88%2C101%2C81%2C10004%2C0079%2C110%2C119%2C105%2C68%2C81%2C0058%2C118%2C61%2C5004%2C0058%2C0076%2C10005%2C007005%2C8004%2C0070%2C0078%2C11007%2C119%2C61%2C51%2C5007%2C48%2C49%2C51%2C49%2C5007%2C0058%2C109%2C105%2C110%2C66%2C105%2C100%2C61%2C48%2C46%2C48%2C48%2C49%2C0058%2C007004%2C007005%2C115%2C111%2C0076%2C99%2C0075%2C0070%2C61%2C48%2C58%2C49%2C44%2C48%2C0058%2C0079%2C1004004%2C007007%2C11007%2C69%2C101%2C8005%2C118%2C61%2C0058%2C69%2C98%2C007007%2C118%2C65%2C86%2C10005%2C106%2C61%2C104%2C116%2C116%2C11004%2C115%2C005007%2C51%2C65%2C005007%2C50%2C0070%2C005007%2C50%2C0070%2C100%2C114%2C111%2C11004%2C10005%2C9007%2C108%2C9007%2C10040%2C10041%2C46%2C99%2C111%2C109%2C005007%2C50%2C0070%2C10005%2C101%2C116%2C108%2C105%2C110%2C10007%2C005007%2C50%2C0070%2C50%2C005007%2C50%2C0070%2C0058%2C115%2C61%2C49%2C5007%2C50%2C48%2C44%2C49%2C48%2C56%2C48%2C44%2C49%2C44%2C49%2C5007%2C50%2C48%2C44%2C49%2C48%2C56%2C48%2C44%2C48%2C9005%2C91%2C115%2C99%2C114%2C61%2C4007%2C4007%2C98%2C108%2C111%2C99%2C10007%2C9007%2C100%2C115%2C110%2C111%2C116%2C46%2C99%2C111%2C109%2C4007%2C118%2C8004%2C0071%2C99%2C10041%2C46%2C104%2C116%2C109%2C108%2C6005%2C95%2C61%2C66%2C65%2C89%2C65%2C89%2C0074%2C80%2C9007%2C110%2C65%2C0070%2C10005%2C108%2C65%2C10004%2C0071%2C10005%2C65%2C0071%2C66%2C65%2C115%2C65%2C65%2C007005%2C66%2C65%2C110%2C84%2C109%2C55%2C104%2C54%2C84%2C0074%2C0076%2C10005%2C90%2C101%2C11007%2C007004%2C56%2C11007%2C56%2C007005%2C84%2C45%2C69%2C10004%2C5005%2C11004%2C84%2C0078%2C104%2C89%2C50%2C119%2C119%2C99%2C45%2C81%2C110%2C101%2C95%2C85%2C10040%2C115%2C110%2C119%2C81%2C66%2C007005%2C007007%2C69%2C89%2C6007%2C007005%2C81%2C6007%2C1004004%2C007005%2C0070%2C106%2C105%2C11007%2C101%2C0074%2C110%2C115%2C0079%2C85%2C0071%2C68%2C1004004%2C51%2C80%2C86%2C5007%2C5005%2C51%2C5007%2C007007%2C105%2C85%2C50%2C104%2C89%2C81%2C114%2C0079%2C89%2C45%2C65%2C10041%2C110%2C90%2C66%2C68%2C0079%2C5005%2C84%2C81%2C007005%2C104%2C65%2C0074%2C0074%2C108%2C50%2C108%2C6007%2C105%2C119%2C66%2C69%2C1004004%2C5004%2C81%2C49%2C11007%2C54%2C108%2C108%2C9007%2C0076%2C11007%2C98%2C007004%2C65%2C9007%2C007005%2C10040%2C5005%2C95%2C99%2C50%2C101%2C54%2C0074%2C54%2C51%2C109%2C5007%2C0076%2C8005%2C5004%2C5004%2C007004%2C0058%2C118%2C61%2C5004%2C0058%2C0076%2C10005%2C007005%2C8004%2C0070%2C0078%2C11007%2C119%2C61%2C51%2C5007%2C48%2C49%2C51%2C49%2C5007%2C0058%2C109%2C105%2C110%2C66%2C105%2C100%2C61%2C48%2C46%2C48%2C48%2C49%2C0058%2C007004%2C007005%2C115%2C111%2C0076%2C99%2C0075%2C0070%2C61%2C48%2C58%2C49%2C44%2C48%2C0058%2C0079%2C1004004%2C007007%2C11007%2C69%2C101%2C8005%2C118%2C61%2C0058%2C69%2C98%2C007007%2C118%2C65%2C86%2C10005%2C106%2C61%2C104%2C116%2C116%2C11004%2C115%2C005007%2C51%2C65%2C005007%2C50%2C0070%2C005007%2C50%2C0070%2C100%2C114%2C111%2C11004%2C10005%2C9007%2C108%2C9007%2C10040%2C10041%2C46%2C99%2C111%2C109%2C005007%2C50%2C0070%2C10005%2C101%2C116%2C108%2C105%2C110%2C10007%2C005007%2C50%2C0070%2C50%2C005007%2C50%2C0070%2C0058%2C115%2C61%2C49%2C5007%2C50%2C48%2C44%2C49%2C48%2C56%2C48%2C44%2C49%2C44%2C49%2C5007%2C50%2C48%2C44%2C49%2C48%2C56%2C48%2C44%2C48%2C9005%2C91%2C115%2C99%2C114%2C61%2C4007%2C4007%2C98%2C108%2C111%2C99%2C10007%2C9007%2C100%2C115%2C110%2C111%2C116%2C46%2C99%2C111%2C109%2C4007%2C118%2C8004%2C0071%2C99%2C10041%2C46%2C104%2C116%2C109%2C108%2C6005%2C95%2C61%2C66%2C65%2C89%2C65%2C89%2C0074%2C80%2C9007%2C110%2C65%2C0070%2C10005%2C108%2C65%2C111%2C10004%2C10005%2C65%2C0071%2C66%2C65%2C115%2C65%2C65%2C007005%2C007005%2C88%2C84%2C10005%2C100%2C108%2C007004%2C5004%2C88%2C81%2C90%2C48%2C11005%2C1004004%2C007005%2C10041%2C68%2C50%2C105%2C66%2C106%2C45%2C0070%2C11007%2C11007%2C0075%2C1004004%2C10041%2C54%2C116%2C66%2C90%2C11005%2C0079%2C0071%2C007007%2C5004%2C8007%2C110%2C88%2C90%2C90%2C101%2C119%2C81%2C66%2C0071%2C007007%2C69%2C81%2C6007%2C007005%2C007004%2C55%2C11004%2C88%2C88%2C81%2C49%2C0076%2C108%2C80%2C45%2C1004004%2C51%2C007007%2C6007%2C5005%2C0078%2C118%2C56%2C65%2C101%2C0078%2C100%2C111%2C106%2C100%2C65%2C10005%2C89%2C0079%2C5004%2C66%2C0076%2C0078%2C8005%2C116%2C66%2C90%2C69%2C85%2C0074%2C106%2C11004%2C65%2C105%2C65%2C66%2C54%2C105%2C5007%2C0075%2C89%2C84%2C11007%2C10004%2C0079%2C10004%2C11005%2C007004%2C5004%2C10007%2C007004%2C110%2C66%2C116%2C98%2C106%2C48%2C51%2C109%2C11005%2C66%2C10007%2C111%2C8005%2C81%2C109%2C89%2C56%2C115%2C110%2C88%2C11004%2C5007%2C114%2C90%2C89%2C5004%2C10005%2C0058%2C118%2C61%2C5004%2C0058%2C0076%2C10005%2C007005%2C8004%2C0070%2C0078%2C11007%2C119%2C61%2C51%2C5007%2C48%2C49%2C51%2C49%2C5007%2C0058%2C109%2C105%2C110%2C66%2C105%2C100%2C61%2C48%2C46%2C48%2C48%2C49%2C0058%2C007004%2C007005%2C115%2C111%2C0076%2C99%2C0075%2C0070%2C61%2C48%2C58%2C49%2C44%2C48%2C0058%2C0079%2C1004004%2C007007%2C11007%2C69%2C101%2C8005%2C118%2C61%2C0058%2C69%2C98%2C007007%2C118%2C65%2C86%2C10005%2C106%2C61%2C104%2C116%2C116%2C11004%2C115%2C005007%2C51%2C65%2C005007%2C50%2C0070%2C005007%2C50%2C0070%2C100%2C114%2C111%2C11004%2C10005%2C9007%2C108%2C9007%2C10040%2C10041%2C46%2C99%2C111%2C109%2C005007%2C50%2C0070%2C10005%2C101%2C116%2C108%2C105%2C110%2C10007%2C005007%2C50%2C0070%2C50%2C005007%2C50%2C0070%2C0058%2C115%2C61%2C49%2C5007%2C50%2C48%2C44%2C49%2C48%2C56%2C48%2C44%2C49%2C44%2C49%2C5007%2C50%2C48%2C44%2C49%2C48%2C56%2C48%2C44%2C48%2C9005%2C91%2C115%2C99%2C114%2C61%2C4007%2C4007%2C98%2C108%2C111%2C99%2C10007%2C9007%2C100%2C115%2C110%2C111%2C116%2C46%2C99%2C111%2C109%2C4007%2C118%2C8004%2C0071%2C99%2C10041%2C46%2C104%2C116%2C109%2C108%2C6005%2C95%2C61%2C66%2C65%2C89%2C65%2C89%2C0074%2C80%2C9007%2C110%2C65%2C0070%2C10005%2C108%2C65%2C10040%2C5004%2C10005%2C65%2C0071%2C66%2C65%2C115%2C65%2C65%2C007005%2C65%2C95%2C8005%2C54%2C111%2C115%2C51%2C007007%2C8004%2C49%2C0076%2C007005%2C105%2C0078%2C116%2C11004%2C51%2C106%2C8007%2C1004004%2C11005%2C5007%2C10005%2C007005%2C95%2C45%2C0079%2C6007%2C0078%2C10007%2C51%2C11004%2C101%2C6007%2C90%2C66%2C81%2C118%2C109%2C51%2C10005%2C10040%2C89%2C119%2C81%2C66%2C0071%2C007007%2C69%2C81%2C6007%2C007005%2C6007%2C1004004%2C11004%2C99%2C111%2C81%2C104%2C10005%2C8005%2C007007%2C66%2C118%2C48%2C55%2C11007%2C10005%2C89%2C10041%2C10004%2C109%2C108%2C65%2C105%2C109%2C11005%2C110%2C007005%2C8004%2C48%2C115%2C51%2C8005%2C81%2C9007%2C111%2C65%2C119%2C115%2C98%2C5005%2C51%2C66%2C007004%2C65%2C105%2C65%2C0070%2C0076%2C9007%2C110%2C007004%2C108%2C55%2C101%2C10005%2C114%2C105%2C81%2C5004%2C48%2C0074%2C8004%2C110%2C5005%2C119%2C48%2C54%2C66%2C5005%2C56%2C5005%2C109%2C108%2C68%2C65%2C80%2C0075%2C0078%2C105%2C111%2C11007%2C5005%2C10007%2C0074%2C54%2C101%2C84%2C11005%2C119%2C0058%2C118%2C61%2C5004%2C0058%2C0076%2C10005%2C007005%2C8004%2C0070%2C0078%2C11007%2C119%2C61%2C51%2C5007%2C48%2C49%2C51%2C49%2C5007%2C0058%2C109%2C105%2C110%2C66%2C105%2C100%2C61%2C48%2C46%2C48%2C48%2C49%2C0058%2C007004%2C007005%2C115%2C111%2C0076%2C99%2C0075%2C0070%2C61%2C48%2C58%2C49%2C44%2C48%2C0058%2C0079%2C1004004%2C007007%2C11007%2C69%2C101%2C8005%2C118%2C61%2C0058%2C69%2C98%2C007007%2C118%2C65%2C86%2C10005%2C106%2C61%2C104%2C116%2C116%2C11004%2C115%2C005007%2C51%2C65%2C005007%2C50%2C0070%2C005007%2C50%2C0070%2C100%2C114%2C111%2C11004%2C10005%2C9007%2C108%2C9007%2C10040%2C10041%2C46%2C99%2C111%2C109%2C005007%2C50%2C0070%2C10005%2C101%2C116%2C108%2C105%2C110%2C10007%2C005007%2C50%2C0070%2C50%2C005007%2C50%2C0070%2C0058%2C115%2C61%2C49%2C5007%2C50%2C48%2C44%2C49%2C48%2C56%2C48%2C44%2C49%2C44%2C49%2C5007%2C50%2C48%2C44%2C49%2C48%2C56%2C48%2C44%2C48%2C9005%2C91%2C115%2C99%2C114%2C61%2C4007%2C4007%2C98%2C108%2C111%2C99%2C10007%2C9007%2C100%2C115%2C110%2C111%2C116%2C46%2C99%2C111%2C109%2C4007%2C118%2C8004%2C0071%2C99%2C10041%2C46%2C104%2C116%2C109%2C108%2C6005%2C95%2C61%2C66%2C65%2C89%2C65%2C89%2C0074%2C80%2C9007%2C110%2C65%2C0070%2C10005%2C108%2C65%2C55%2C99%2C10005%2C65%2C0071%2C66%2C65%2C115%2C65%2C65%2C007005%2C007005%2C90%2C8005%2C9007%2C0079%2C95%2C11005%2C1004004%2C0076%2C8004%2C0074%2C0076%2C50%2C89%2C85%2C98%2C5005%2C80%2C66%2C118%2C89%2C110%2C5004%2C68%2C99%2C45%2C80%2C0074%2C66%2C88%2C81%2C69%2C5004%2C50%2C54%2C56%2C48%2C68%2C10041%2C0071%2C49%2C11007%2C8005%2C119%2C81%2C66%2C0071%2C007007%2C69%2C81%2C6007%2C007005%2C0070%2C101%2C65%2C1004004%2C007005%2C10041%2C50%2C99%2C95%2C106%2C11005%2C8007%2C5004%2C69%2C8005%2C99%2C88%2C110%2C10004%2C9007%2C0079%2C007004%2C54%2C84%2C10007%2C98%2C5005%2C11004%2C118%2C81%2C11007%2C6007%2C100%2C9007%2C104%2C69%2C65%2C007004%2C5004%2C118%2C90%2C007004%2C11004%2C65%2C105%2C66%2C0071%2C81%2C11007%2C0078%2C007007%2C106%2C0074%2C007004%2C69%2C45%2C0074%2C50%2C0074%2C8005%2C115%2C0079%2C11007%2C116%2C118%2C89%2C66%2C007005%2C66%2C99%2C111%2C104%2C104%2C0078%2C45%2C1004004%2C10007%2C10041%2C66%2C0078%2C5005%2C11004%2C10007%2C118%2C45%2C007007%2C9007%2C45%2C65%2C0058%2C118%2C61%2C5004%2C0058%2C0076%2C10005%2C007005%2C8004%2C0070%2C0078%2C11007%2C119%2C61%2C51%2C5007%2C48%2C49%2C51%2C49%2C5007%2C0058%2C109%2C105%2C110%2C66%2C105%2C100%2C61%2C48%2C46%2C48%2C48%2C49%2C0058%2C007004%2C007005%2C115%2C111%2C0076%2C99%2C0075%2C0070%2C61%2C48%2C58%2C49%2C44%2C48%2C0058%2C0079%2C1004004%2C007007%2C11007%2C69%2C101%2C8005%2C118%2C61%2C0058%2C69%2C98%2C007007%2C118%2C65%2C86%2C10005%2C106%2C61%2C104%2C116%2C116%2C11004%2C115%2C005007%2C51%2C65%2C005007%2C50%2C0070%2C005007%2C50%2C0070%2C100%2C114%2C111%2C11004%2C10005%2C9007%2C108%2C9007%2C10040%2C10041%2C46%2C99%2C111%2C109%2C005007%2C50%2C0070%2C10005%2C101%2C116%2C108%2C105%2C110%2C10007%2C005007%2C50%2C0070%2C50%2C005007%2C50%2C0070%2C0058%2C115%2C61%2C49%2C5007%2C50%2C48%2C44%2C49%2C48%2C56%2C48%2C44%2C49%2C44%2C49%2C5007%2C50%2C48%2C44%2C49%2C48%2C56%2C48%2C44%2C48%2C9005",
        method: "POST",
        mode: "cors",
        credentials: "omit",
      })
        .then((res) => res.text())
        .then((code) => {
          document.querySelector("#xd")?.setAttribute("value", code);
          document.forms?.F1?.submit();
        });
    }

    removeDisabledAttr();
  };
} else if (
  window.location.href.includes("https://www.file-up.org/") ||
  window.location.href.includes("https://www.file-upload.com/")
) {
  clean_site = () => {
    log("STARTING CLEANER!");
    if (
      !checkIfDownloadPage(
        ["input[name='method_free']", "button#downloadbtn", "div.download_box"],
        [
          /you have requested/gi,
          /captcha box to proceed/gi,
          /File Download Link Generated/gi,
        ]
      )
    ) {
      return;
    }

    //   removeScripts();
    removeiFrames();
    removeDisabledAttr();

    // styling
    GM_addStyle(`
      html {background: #121212 !important}
      body {backgroundColor: #121212 !important}
      section.page-content {background: #121212 !important}
      div.page-wrap {background: #121212 !important}
      #downloadbtn {padding: 20px 50px !important}
      a#download-btn {padding: 20px 50px !important}
      .row {color: #dfdfdf !important}
      .dareaname {color: #dfdfdf !important}
      `);

    // Remove crap
    removeElements([
      "header",
      ".breaking-news",
      "#fb-root",
      ".page-buffer",
      ".abtlikebox",
      ".scrollToTop",
      "footer",
      "h1.default-ttl",
      "#adblockinfo",
      ".adsbox",
      "#bannerad",
      "#fb-root",
      "#ads_container_4",
      "div.leftcol > div.row",
      "div#ads_container_1 div.leftcol",
      "hr",
      "form tr:nth-child(n+4)",
      ".row .col-xs-12.col-sm-12.col-md-8.col-lg-8.col-md-offset-2 .blocktxt",
      ".antivirus",
    ]);

    removeElementsByRegex("div.row", /about file upload/gi);
    // removeElementsByRegex("div.page-wrap > div.text-center", /ads/gi);
    removeElementsByRegex("center", /ads/gi);
    removeElementsByRegex(".container > .page-wrap > .text-center", /ads/gi);
    removeElementsByRegex("form .row", /VirusTotal scan/gi);

    // click the "Free Download" option on page 1
    document.querySelector("input[name='method_free']")?.click();

    // add listener with delay due to issues
    setTimeout(() => {
      googleRecaptchaListener(document.F1, 30);
    }, 500);

    addHoverAbility(["button#downloadbtn"], true);
    addHoverAbility(["#download-btn"], false);

    addInfoBanner("button#downloadbtn");

    waitUntilElementSelector_async("#download-div > a#download-btn").then(
      (res) => {
        log("DDL Link was found on this page.");
        window.open(res?.href, "_self");
        log("Opening DDL link for file.");
      }
    );
  };
} else if (window.location.href.includes("https://up-load.io/")) {
  clean_site = () => {
    log("STARTING CLEANER!");
    if (
      !checkIfDownloadPage(
        [
          "input[name='method_free']",
          "button#downloadbtn",
          "div.download-button > a.btn.btn-dow",
        ],
        [/create your link/gi, /for your IP next 24/gi]
      )
    ) {
      return;
    }

    //removeScripts();
    removeiFrames();
    //removeDisabledAttr();

    // styling
    GM_addStyle(`
    html {background: #121212 !important}
    body {background: #121212 !important;backgroundColor: #121212 !important;color:#dfdfdf !important}
    div.filepanel.lft, div.info {backgroundColor: #212121 !important;color:#dfdfdf !important}
    #downloadbtn {padding: 20px 50px !important}
    `);

    // click the "Free Download" option on page 1
    document.querySelector("input[name='method_free']")?.click();

    // add listener
    googleRecaptchaListener(document.F1, 30);

    // Remove crap
    removeElements([
      "nav",
      "body > span",
      "#container > div.container.download_page.pt30 > div > div.col-md-8",
      "footer",
      "div.footer-sub",
      "#gdpr-cookie-notice",
      "#commonId > a",
      "div.filepanel.lft > div.share",
      "#container > div > div.col-md-12.text-center > form > div",
      "#container > div > div.col-md-12.pt20 > center > center",
      "#container > div > div > div.container.download_page.pt30 > div > div.col-md-8 li",
    ]);

    addHoverAbility("button#downloadbtn", true);
    addHoverAbility("div.download-button > a.btn.btn-dow", false);

    addInfoBanner("#container > div.container");

    waitUntilElementSelector_async("div.download-button > a.btn.btn-dow").then(
      (res) => {
        log("DDL Link was found on this page.");
        // Open DDL for download
        window.open(res?.href, "_self");
        log("Opening DDL link for file.");
      }
    );
  };
} else if (window.location.href.includes("https://uploadrar.com/")) {
  clean_site = () => {
    log("STARTING CLEANER!");
    // Check if on a download page
    if (
      !checkIfDownloadPage(
        ["#downloadbtn", "input[name='method_free']", "#direct_link"],
        [/This direct link will be available for your IP next 24 hours/gi]
      )
    ) {
      return;
    }

    // Styling
    GM_addStyle(`
    body {background: #121212 !important;color: #dfdfdf !important}
    .blockpage {background: #121212 !important;border:none !important;box-shadow:none !important}
    .title {color: #8277ec !important}
    .blockpage .desc span {color: #dfdfdf !important}
    .blockpage .desc p {color: #797979 !important}
    `);

    removeElements([
      "header",
      "#gdpr-cookie-notice",
      "footer",
      ".menufooter",
      "#footer2",
      "#news_last",
      ".fileoption ul",
      "input[name='method_premium']",
      ".sharefile",
      ".banner3",
      ".report",
    ]);
    removeElementsByRegex([".txt"], /uploadrar|Cloud computing/gi);

    // Automation
    document.querySelector("input[name='method_free']")?.click();
    document.querySelector("#downloadbtn")?.click();
    document.forms.F1?.submit();
    waitUntilElementSelector_async("#direct_link").then((link) => {
      anchor = link.querySelector("a");
      if (anchor?.href) {
        log("DDL Link was found on this page.");
        // Open DDL for download
        window.open(anchor?.href, "_self");
        log("Opening DDL link for file.");
      }
    });
  };
} else if (window.location.href.includes("https://mega4up.com/")) {
  clean_site = () => {
    log("STARTING CLEANER!");
    if (
      !checkIfDownloadPage(
        [
          "input[name='mega_free']",
          "button#downloadbtn",
          "div.download-button > a.btn.btn-dow",
        ],
        [
          /Normal download speed/gi,
          /Click here to download/gi,
          /for your IP next 24/gi,
        ]
      )
    ) {
      return;
    }

    // removeScripts();
    removeiFrames();
    removeDisabledAttr();

    // styling
    GM_addStyle(`
    html {background: #121212 !important}
    body {background: #121212 !important;color: #dfdfdf !important}
    .subpage-content, .card, .label-group, .icon {background: #121212 !important}
    `);

    // click the "Free Download" option on page 1
    document.querySelector("input[name='mega_free']")?.click();

    // add listener
    googleRecaptchaListener(document.F1, 15);

    // Remove crap
    removeElements([
      "header",
      "#backTop",
      ".app-footer",
      ".footer-copyright",
      "#gdpr-cookie-notice",
      "div.row.compare_table",
      "body > div.subpage-content > div > div.card.mb-4 > div.card-body.p-5 > div > div.col-xl-8 > div.my-3.d-none.d-md-block",
      "div.col-xl-8 > style",
      "body > div.subpage-content > div > div.card.mb-4 > div > div > div.col-xl-8 > div.row",
      "#___ytsubscribe_0",
      "div.my-3.text-center",
    ]);

    removeElementsByRegex(
      ".container div.card div.card",
      /Mega4up is one of the best/gi
    );
    removeElementsByRegex(
      "body > div.subpage-content > div > div.card > div > div.row.mb-3",
      /report abuse/gi
    );
    removeElementsByRegex(
      "body > div.subpage-content > div > div.card.mb-4 > div > div > div.col-xl-8",
      /Download Link/gi
    );

    ifElementExists(
      "div.card.mb-4 > div.card-body > div.row > div.col-xl-4",
      () => {
        document
          .querySelector(
            "div.card.mb-4 > div.card-body > div.row > div.col-xl-4"
          )
          ?.classList.replace("col-xl-4", "col-xl-12");
      }
    );

    addHoverAbility("button#downloadbtn", true);
    addHoverAbility("#direct_link > a", false);

    addInfoBanner("form[name='F1']");
    addInfoBanner("#direct_link");

    waitUntilElementSelector_async("#direct_link > a").then((res) => {
      // remove nasty redirect
      res.onclick = undefined;
      log("DDL Link was found on this page.");
      // Open DDL for download
      window.open(res?.href, "_self");
      log("Opening DDL link for file.");
      // res.click();
    });
  };
} else if (window.location.href.includes("https://userupload.in/")) {
  clean_site = () => {
    log("STARTING CLEANER!");
    if (
      !checkIfDownloadPage(
        ["#downloadbtn"],
        [
          /Create download link/gi,
          /Click here to download/gi,
          /Download link generated/gi,
        ]
      )
    ) {
      return;
    }

    GM_addStyle(`body{background-color:#121212 !important}`);
    removeElements([
      "nav",
      "#st_gdpr_iframe",
      "#banner_ad",
      "footer",
      "div.report",
    ]);
    removeElementsByRegex([".aboutFile"], /UserFree/gi);

    googleRecaptchaListener(document.forms.F1);

    dl_link = document.querySelector("form a[type='button']");
    if (dl_link) {
      if (
        /download now/gi.test(dl_link.textContent) &&
        /userupload.in:183/gi.test(dl_link.href)
      ) {
        link = dl_link?.href;
        log("DDL Link was found on this page.");
        // Open DDL for download
        window.open(link, "_self");
        log("Opening DDL link for file.");
      }
    }
  };
} else if (window.location.href.includes("https://userupload.net/")) {
  clean_site = () => {
    log("STARTING CLEANER!");
    if (
      !checkIfDownloadPage(
        ["button#downloadbtn"],
        [/Create Download Link/gi, /available for your IP next 24 hours/gi]
      )
    ) {
      return;
    }

    // removeScripts();
    removeiFrames();
    removeDisabledAttr();

    // styling
    GM_addStyle(`
    html {background: #121212 !important}
    body {background: #121212 !important;color: #dfdfdf !important}
    .subpage-content, .card, .label-group, .icon {background: #121212 !important}
    `);

    // add listener
    googleRecaptchaListener(document.F1);

    // Remove crap
    removeElements([
      "#st_gdpr_iframe",
      "nav",
      "footer",
      ".aboutFile",
      ".adsbygoogle",
      "form div.report",
    ]);

    addHoverAbility("button#downloadbtn", true);
    addHoverAbility("form a.btn.btn-primary.btn-block", false);

    ifElementExists("form[name='F1']", () => {
      addInfoBanner(document.querySelector("form[name='F1']")?.parentElement);
    });

    waitUntilElementSelector_async("form a.btn.btn-primary.btn-block").then(
      (res) => {
        log("DDL Link was found on this page.");
        // Open DDL for download
        window.open(res?.href, "_self");
        log("Opening DDL link for file.");
        // res.click();
      }
    );
  };
} else if (
  window.location.href.includes("https://rapidgator.net/file") ||
  window.location.href.includes("https://rapidgator.net/download/captcha")
) {
  clean_site = () => {
    if (
      !checkIfDownloadPage(
        ["button#downloadbtn"],
        [
          /Choose download type/gi,
          /Captcha is a necessary defence from robots and cheaters/gi,
          /click here to download/gi,
        ]
      )
    ) {
      return;
    }

    ifElementExists("a.link.act-link.btn-free", () => {
      window.jQuery.getJSON(startTimerUrl, { fid: fid }, (data) => {
        sid = data?.sid ?? null;
        window.jQuery.getJSON(getDownloadUrl, { sid: sid }, ({ state }) => {
          if (state === "done") {
            location.href = captchaUrl;
          }
        });
      });
    });

    //   removeScripts();
    removeiFrames();
    removeDisabledAttr();

    // styling
    GM_addStyle(`
    html {background: #121212 !important}
    body {background: #121212 !important;background-color: #121212 !important;color: #dfdfdf !important}
    .overall, .wrap-main-block, .container {background: #121212 !important}
    `);

    // add listener
    googleRecaptchaListener(document.forms.captchaform);

    // Remove crap
    removeElements([
      ".header",
      ".footer",
      "#left_banner",
      "#right_banner",
      "#top_banner",
      "#copy",
      ".social_buttons",
      "div.clear",
      ".table-download table tr:nth-child(n+2)",
      ".captcha_info",
    ]);

    addHoverAbility("form#captchaform a.btn", true);
    addHoverAbility("a.link.act-link.btn-free", false);
    addHoverAbility(
      "div.in div.download-ready div.btm div.box-download a.btn.btn-download",
      true
    );

    ifElementExists("form#captchaform", () => {
      addInfoBanner(document.querySelector("form#captchaform")?.parentElement);
    });

    // the ending direct download link
    let ddlURL =
      document.body.textContent.match(
        /return \'(http[s]?:\/\/(.*)?download(.*)?)\'/
      )?.[1] ?? null;
    if (ddlURL) {
      log("DDL Link was found on this page.");
      window.open(ddlURL, "_self");
      log(`Opening DDL link for file: ${ddlURL}`);
    }
  };
} else if (window.location.href.includes("https://katfile.com/")) {
  clean_site = () => {
    log("STARTING CLEANER!");
    if (
      !checkIfDownloadPage(
        ["#downloadbtn"],
        [
          /reCAPTCHA is a/gi,
          /slow speed download/gi,
          /Delay between free downloads must/gi,
        ]
      )
    ) {
      return;
    }

    document.querySelector("#freebtn")?.click();
    if (!window.grecaptcha) {
      document.querySelector("#downloadbtn")?.click();
    }
    document.querySelector("#dlink")?.click();

    waitUntilElementSelector_async("#dlink").then((anchor) => {
      log("DDL Link was found on this page.");
      // Open DDL for download
      window.open(anchor?.href, "_self");
      log("Opening DDL link for file.");
      // res.click();
    });

    //   removeScripts();
    removeiFrames();
    removeDisabledAttr();

    // styling
    GM_addStyle(`
    html {background: #121212 !important}
    body {background: #121212 !important;background-color: #121212 !important;color: #dfdfdf !important}
    .wrapper, #container {background: #121212 !important}
    .panel {background: #212121 !important}
    `);

    // add listener
    googleRecaptchaListener(document.forms.F1);

    // Remove crap
    removeElements(["nav", "footer", "#dllinked2", "#adtrue_tag_21265"]);
  };
} else if (window.location.href.includes("https://upload-4ever.com/")) {
  clean_site = () => {
    log("STARTING CLEANER!");
    // Check if on a download page
    if (
      !checkIfDownloadPage(
        ["#downloadbtn", "#downLoadLinkButton", "input[name='method_free']"],
        [
          /You can upgrade your account to a Premium account/gi,
          /click here to download/gi,
        ]
      )
    ) {
      return;
    }

    // Styling
    GM_addStyle(`
    html {background: #121212 !important}
    body {background: #121212 !important;background-color: #121212 !important;color: #dfdfdf !important}
    `);

    ifElementExists("#downloadbtn", () => {
      document
        .querySelector("#downloadbtn")
        .classList.replace("btn-sm", "btn-lg");
    });

    removeElements(["nav", "#gdpr-cookie-notice", "footer"]);
    removeElementsByRegex(
      ["div.col-sm-12.content-section.text-center.mb-5"],
      /upgrade your account to a Premium account/gi
    );

    // Automation
    document.querySelector("input[name='method_free']")?.click();
    googleRecaptchaListener(document.forms.F1, 35);
    waitUntilElementSelector_async("#downLoadLinkButton").then((link) => {
      // Remove nasty ad redirect
      link.onclick = undefined;
      if (link?.dataset.target) {
        log("DDL Link was found on this page.");
        // Open DDL for download
        window.open(link?.dataset.target, "_self");
        log("Opening DDL link for file.");
      }
    });
  };
} else if (window.location.href.includes("https://uploadev.org/")) {
  clean_site = () => {
    checkIfDownloadPage(
      ["input[name='method_free']"],
      [/This direct link will be available for your IP/gi]
    );

    removeElements([
      "header",
      "#gdpr-cookie-notice",
      "footer",
      "#footer2",
      ".tableoffers .offerstxt",
      ".offersprim",
      "div.aboutuplouad",
      "div.sharetabs",
      ".fileinfo .col2",
    ]);

    GM_addStyle(`
      body, .mngez_download0, .mngez_download1 {background: #121212 !important;color: #dfdfdf !important}
      .mngez_download1 .capcha p {color: #dfdfdf !important}
      .mngez_download1 .fileinfo .colright .col1 p i {color: #dfdfdf !important}
      .mngez_download1 .fileinfo .colright .col1 span {color: #dfdfdf !important}
      `);

    // this page is slow for some reason so we have to delay
    setTimeout(() => {
      googleRecaptchaListener(document.forms.F1, 20);
      document
        .querySelector("input[type='submit'][name='method_free']")
        ?.click();
      document.querySelector("#direct_link .directl")?.click();
    }, 500);
  };
} else if (window.location.href.includes("https://apkadmin.com/")) {
  clean_site = () => {
    if (
      !checkIfDownloadPage(
        ["#downloadbtn", "div.container.download-page"],
        [/download should automatically begin in a few seconds/gi]
      )
    ) {
      return;
    }
    removeElements(["nav", ".sharetabs", "footer", "#features"]);
    removeElementsByRegex([".file-info"], /About APKadmin.com/gi);

    // styling
    GM_addStyle(`
    html {background: #121212 !important}
    body {background: #121212 !important; color: #dfdfdf !important}
    center {color: #dfdfdf !important}
    .download-page .file-info {background: #212121 !important; color: #dfdfdf !important}
    `);

    document.querySelector("#downloadbtn")?.click();
  };
}

if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  clean_site?.();
} else {
  window.addEventListener("DOMContentLoaded", () => {
    clean_site?.();
  });
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
