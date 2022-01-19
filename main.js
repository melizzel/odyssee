(function (storyContent) {
  // Create ink story from the content using inkjs
  var story = new inkjs.Story(storyContent);

  var savePointObj = {
    savePoint: "",
    images: [],
    images2: [],
    backgroundImage: "",
  };

  var tagsState = {
    images: [],
    images2: [],
    backgroundImage: "",
  };

  function createSavePoint() {
    savePointObj.savePoint = story.state.toJson();
    savePointObj.images = [...tagsState.images];
    savePointObj.images2 = [...tagsState.images2];
    savePointObj.backgroundImage = tagsState.backgroundImage;
  }

  var storyContainer = document.querySelector("#story");
  var outerScrollContainer = document.querySelector(".outerContainer");
  var imageContainer = document.querySelector(".imageContainer");
  var imageContainer2 = document.querySelector(".imageContainer2");

  // Global tags - those at the top of the ink file
  // We support:
  //  # theme: dark
  //  # author: Your Name
  var globalTags = story.globalTags;
  if (globalTags) {
    for (var i = 0; i < story.globalTags.length; i++) {
      var globalTag = story.globalTags[i];
      var splitTag = splitPropertyTag(globalTag);

      // THEME: dark
      if (splitTag && splitTag.property == "theme") {
        globalTagTheme = splitTag.val;
      }

      // author: Your Name
      else if (splitTag && splitTag.property == "author") {
        var byline = document.querySelector(".byline");
        byline.innerHTML = "by " + splitTag.val;
      }
    }
  }

  // page features setup
  var hasSave = loadSavePoint();
  setupButtons(hasSave);

  // Set initial save point
  createSavePoint();

  // Kick off the start of the story!
  continueStory(true);

  // Funktion für #IMAGE
  function addImage(imgSrc, delay) {
    var imageElement = document.createElement("img");
    imageElement.src = imgSrc;
    imageContainer.appendChild(imageElement);

    showAfter(delay, imageElement);

    tagsState.images.push(imgSrc);
  }

  function clearImages() {
    removeImage("img");
    tagsState.images.length = 0;
  }

  function restoreImages(images) {
    clearImages();
    images.forEach(function (imgSrc) {
      addImage(imgSrc, 0);
    });
  }

  // Funktion für #IMAGE2
  function addImage2(imgSrc, delay) {
    var imageElement = document.createElement("img");
    imageElement.src = imgSrc;
    imageContainer2.appendChild(imageElement);

    showAfter(delay, imageElement);

    tagsState.images2.push(imgSrc);
  }

  function clearImages2() {
    removeImage2("img");
    tagsState.images2.length = 0;
  }

  function restoreImages2(images) {
    clearImages2();
    images.forEach(function (imgSrc) {
      addImage2(imgSrc, 0);
    });
  }

  // Funktion für #BACKGROUNDIMAGE
  function setBackgroundImage(imgSrc) {
    outerScrollContainer.style.backgroundImage = "url(" + imgSrc + ")";
    tagsState.backgroundImage = imgSrc;
  }

  // Main story processing function. Each time this is called it generates
  // all the next content up as far as the next set of choices.
  function continueStory(firstTime) {
    var paragraphIndex = 0;
    var delay = 0.0;

    // Mute Button
    var muteButton = document.getElementById("mute");
    muteButton.onclick = toggleAudioMute;

    function toggleAudioMute() {
      if (!audio.muted) {
        muteButton.src = "/images/speaker_icon.svg";
        audio.muted = true;
      } else {
        muteButton.src = "/images/mute_icon.svg";
        audio.muted = false;
      }
    }

    // Don't over-scroll past new content
    var previousBottomEdge = firstTime ? 0 : contentBottomEdgeY();

    // Generate story text - loop through available content
    while (story.canContinue) {
      // Get ink to generate the next paragraph
      var paragraphText = story.Continue();
      var tags = story.currentTags;

      // Any special tags included with this line
      var customClasses = [];
      for (var i = 0; i < tags.length; i++) {
        var tag = tags[i];

        // Detect tags of the form "X: Y". Currently used for IMAGE and CLASS but could be
        // customised to be used for other things too.
        var splitTag = splitPropertyTag(tag);

        // AUDIO: src
        if (splitTag && splitTag.property == "AUDIO") {
          if ("audio" in this) {
            this.audio.pause();
            this.audio.removeAttribute("src");
            this.audio.load();
          }
          this.audio = new Audio(splitTag.val);
          this.audio.play();
        }

        // CLEARAUDIO: stoppt alle Audiodateien & blendet sie langsam aus.
        else if (tag == "CLEARAUDIO") {
          if ("audio" in this) {
            var oldVolume = this.audio.volume;
            var actVolume = oldVolume;
            var audioInterval = setInterval(function () {
              actVolume -= 0.1;
              if (actVolume < 0) {
                clearInterval(audioInterval);
                this.audio.pause();
                this.audio.volume = oldVolume;
              } else {
                this.audio.volume = actVolume;
              }
            }, 100);
          }
        }

        // AUDIOLOOP: src
        else if (splitTag && splitTag.property == "AUDIOLOOP") {
          if ("audioLoop" in this) {
            this.audioLoop.pause();
            this.audioLoop.removeAttribute("src");
            this.audioLoop.load();
          }
          this.audioLoop = new Audio(splitTag.val);
          this.audioLoop.play();
          this.audioLoop.loop = true;
        }

        // IMAGE: src
        if (splitTag && splitTag.property == "IMAGE") {
          addImage(splitTag.val, delay);
          delay += 200.0;
        }

        // IMAGE2: src
        if (splitTag && splitTag.property == "IMAGE2") {
          addImage2(splitTag.val, delay);
          delay += 200.0;
        }

        // CLEARIMAGE: Entfert #IMAGE
        else if (tag == "CLEARIMAGE") {
          clearImages();
        }

        // CLEARIMAGE2: Entfert #IMAGE2
        else if (tag == "CLEARIMAGE2") {
          clearImages2();
        }

        // LINK: url
        else if (splitTag && splitTag.property == "LINK") {
          window.location.href = splitTag.val;
        }

        // LINKOPEN: url
        else if (splitTag && splitTag.property == "LINKOPEN") {
          window.open(splitTag.val);
        }

        //BACKGROUND: src
        else if (splitTag && splitTag.property == "BACKGROUND") {
          setBackgroundImage(splitTag.val);
        }

        // CLASS: className
        else if (splitTag && splitTag.property == "CLASS") {
          customClasses.push(splitTag.val);
        }

        // CLEAR - removes all existing content.
        // RESTART - clears everything and restarts the story from the beginning
        else if (tag == "CLEAR" || tag == "RESTART") {
          removeAll("p");
          removeAll("img");
          removeImage("img");
          removeImage2("img");

          // Comment out this line if you want to leave the header visible when clearing
          setVisible(".header", false);

          if (tag == "RESTART") {
            restart();
            return;
          }
        }
      }

      // Create paragraph element (initially hidden)
      var paragraphElement = document.createElement("p");
      paragraphElement.innerHTML = paragraphText;
      storyContainer.appendChild(paragraphElement);

      // Add any custom classes derived from ink tags
      for (var i = 0; i < customClasses.length; i++)
        paragraphElement.classList.add(customClasses[i]);

      // Fade in paragraph after a short delay
      showAfter(delay, paragraphElement);
      delay += 200.0;
    }

    // Create HTML choices from ink choices
    story.currentChoices.forEach(function (choice) {
      // Create paragraph with anchor element
      var choiceParagraphElement = document.createElement("p");
      choiceParagraphElement.classList.add("choice");
      choiceParagraphElement.innerHTML = `<a href='#'>${choice.text}</a>`;
      storyContainer.appendChild(choiceParagraphElement);

      // Fade choice in after a short delay
      showAfter(delay, choiceParagraphElement);
      delay += 200.0;

      // Click on choice
      var choiceAnchorEl = choiceParagraphElement.querySelectorAll("a")[0];
      choiceAnchorEl.addEventListener("click", function (event) {
        // Don't follow <a> link
        event.preventDefault();

        // Remove all existing choices
        removeAll(".choice");

        // Tell the story where to go next
        story.ChooseChoiceIndex(choice.index);

        // This is where the save button will save from
        createSavePoint();

        // Aaand loop
        continueStory();
      });
    });

    // Extend height to fit
    // We do this manually so that removing elements and creating new ones doesn't
    // cause the height (and therefore scroll) to jump backwards temporarily.
    storyContainer.style.height = contentBottomEdgeY() + "px";

    if (!firstTime) scrollDown(previousBottomEdge);
  }

  function restart() {
    story.ResetState();

    setVisible(".header", true);

    // set save point to here
    createSavePoint();

    continueStory(true);

    outerScrollContainer.scrollTo(0, 0);
  }

  // -----------------------------------
  // Various Helper functions
  // -----------------------------------

  // Fades in an element after a specified delay
  function showAfter(delay, el) {
    el.classList.add("hide");
    setTimeout(function () {
      el.classList.remove("hide");
    }, delay);
  }

  // Scrolls the page down, but no further than the bottom edge of what you could
  // see previously, so it doesn't go too far.
  function scrollDown(previousBottomEdge) {
    // Line up top of screen with the bottom of where the previous content ended
    var target = previousBottomEdge;

    // Can't go further than the very bottom of the page
    var limit =
      outerScrollContainer.scrollHeight - outerScrollContainer.clientHeight;
    if (target > limit) target = limit;

    var start = outerScrollContainer.scrollTop;

    var dist = target - start;
    var duration = 300 + (300 * dist) / 100;
    var startTime = null;
    function step(time) {
      if (startTime == null) startTime = time;
      var t = (time - startTime) / duration;
      var lerp = 3 * t * t - 2 * t * t * t; // ease in/out
      outerScrollContainer.scrollTo(0, (1.0 - lerp) * start + lerp * target);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // The Y coordinate of the bottom end of all the story content, used
  // for growing the container, and deciding how far to scroll.
  function contentBottomEdgeY() {
    var bottomElement = storyContainer.lastElementChild;
    return bottomElement
      ? bottomElement.offsetTop + bottomElement.offsetHeight
      : 0;
  }

  // Remove all elements that match the given selector. Used for removing choices after
  // you've picked one, as well as for the CLEAR and RESTART tags.
  function removeAll(selector) {
    var allElements = storyContainer.querySelectorAll(selector);
    for (var i = 0; i < allElements.length; i++) {
      var el = allElements[i];
      el.parentNode.removeChild(el);
    }
  }

  // Entfernt #IMAGE
  function removeImage(selector) {
    var allElements = imageContainer.querySelectorAll(selector);
    for (var i = 0; i < allElements.length; i++) {
      var el = allElements[i];
      el.parentNode.removeChild(el);
    }
  }

  // Entfernt #IMAGE2
  function removeImage2(selector) {
    var allElements = imageContainer2.querySelectorAll(selector);
    for (var i = 0; i < allElements.length; i++) {
      var el = allElements[i];
      el.parentNode.removeChild(el);
    }
  }

  // Used for hiding and showing the header when you CLEAR or RESTART the story respectively.
  function setVisible(selector, visible) {
    var allElements = storyContainer.querySelectorAll(selector);
    for (var i = 0; i < allElements.length; i++) {
      var el = allElements[i];
      if (!visible) el.classList.add("invisible");
      else el.classList.remove("invisible");
    }
  }

  // Helper for parsing out tags of the form:
  //  # PROPERTY: value
  // e.g. IMAGE: source path
  function splitPropertyTag(tag) {
    var propertySplitIdx = tag.indexOf(":");
    if (propertySplitIdx != null) {
      var property = tag.substr(0, propertySplitIdx).trim();
      var val = tag.substr(propertySplitIdx + 1).trim();
      return {
        property: property,
        val: val,
      };
    }

    return null;
  }

  // Loads save state if exists in the browser memory
  function loadSavePoint() {
    try {
      let savedState = window.localStorage.getItem("save-state-obj");
      if (savedState) {
        var spObj = JSON.parse(savedState);
        story.state.LoadJson(spObj.savePoint);
        restoreImages(spObj.images);
        restoreImages2(spObj.images2);
        setBackgroundImage(spObj.backgroundImage);
        return true;
      }
    } catch (e) {
      console.debug("Couldn't load save state");
    }
    return false;
  }

  // Used to hook up the functionality for global functionality buttons
  function setupButtons(hasSave) {
    let rewindEl = document.getElementById("rewind");
    if (rewindEl)
      rewindEl.addEventListener("click", function (event) {
        removeAll("p");
        removeAll("img");
        removeImage("img");
        removeImage2("img");
        setVisible(".header", false);
        restart();
      });

    let saveEl = document.getElementById("save");
    if (saveEl)
      saveEl.addEventListener("click", function (event) {
        try {
          var spJson = JSON.stringify(savePointObj);
          window.localStorage.setItem("save-state-obj", spJson);
          document.getElementById("reload").removeAttribute("disabled");
        } catch (e) {
          console.warn("Couldn't save state");
        }
      });

    let reloadEl = document.getElementById("reload");
    if (!hasSave) {
      reloadEl.setAttribute("disabled", "disabled");
    }
    reloadEl.addEventListener("click", function (event) {
      if (reloadEl.getAttribute("disabled")) return;

      removeAll("p");
      removeAll("img");
      removeImage("img");
      removeImage2("img");
      loadSavePoint();
      continueStory(true);
    });
  }
})(storyContent);
