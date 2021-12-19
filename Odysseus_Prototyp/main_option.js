var story = new inkjs.Story(storyContent);

var storyContainer = document.getElementById("story");

function continueStory() {

  while(story.canContinue) {

    // Get ink to generate the next paragraph
    var paragraphText = story.Continue();

    // Create paragraph element (initially hidden)
    var paragraphElement = document.createElement('p');
    paragraphElement.innerHTML = paragraphText;
    storyContainer.appendChild(paragraphElement);

    // Create HTML choices from ink choices
    story.currentChoices.forEach(function(choice) {

      // Create paragraph with anchor element
      var choiceParagraphElement = document.createElement('p');
      choiceParagraphElement.classList.add("choice");
      choiceParagraphElement.innerHTML = `<a href='#'>${choice.text}</a>`
      storyContainer.appendChild(choiceParagraphElement);

      // Click on choice
      var choiceAnchorEl = choiceParagraphElement.querySelectorAll("a")[0];
      choiceAnchorEl.addEventListener("click", function(event) {

          // Don't follow <a> link
          event.preventDefault();

          // Remove all existing choices
          removeAll("p.choice");

          // Tell the story where to go next
          story.ChooseChoiceIndex(choice.index);

          // Loop
          continueStory();
      });

    });

  }

}

// Remove all elements that match the given selector. Used for removing choices after
// you've picked one, as well as for the CLEAR and RESTART tags.
function removeAll(selector)
{
    var allElements = storyContainer.querySelectorAll(selector);
    for(var i=0; i<allElements.length; i++) {
        var el = allElements[i];
        el.parentNode.removeChild(el);
    }
}

continueStory();
