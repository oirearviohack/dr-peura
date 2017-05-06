console.log( "loading js" );

// "session"
userName = "";

// TODO: Move this to oda-phr
theData = [];

function storeFeedback(happyOrSad) {
  var time = moment().format();
  theData.push({'time': time, 'result': happyOrSad});
}

function loadResults() {
  return theData;
}

function renderResultsPage() {
  var results = loadResults();
  var $resultContainer = $('div#results');
  results.forEach(function(element) {
    console.log(element);
    var time = moment(element.time).fromNow();
    $item = $('<div>' + element.result + ' (' + time + ')</div>');
    $resultContainer.append($item);
  });
}

function clearResultsPage() {
  var $resultContainer = $('div#results');
  $resultContainer.html('');
}

function selectPage(pageName) {
  var $pages = $('div.page');
  var $selected = $('div.' + pageName);

  $pages.hide();
  $selected.show();

  if (pageName == 'results-page') {
    renderResultsPage();
  } else {
    clearResultsPage();
  }
}

$( document ).ready(function() {
    console.log("ready!");

    $('a.menu-item').click( function() {
      var gotoPageName = $(this).attr("id");
      selectPage(gotoPageName);
      console.log("Menu selected: " + gotoPageName);
    });

    $('form#login-form input.mui-btn').click( function() {
      var $userNameElement = $('form.login-form input');
      var username = $userNameElement.attr('value');
      userName = username;
      selectPage('feedback-page');
      return false;
    });

    var $thankYouText = $('#thankYouText');
    $thankYouText.hide();

    var $feedbackButtons = $('button.feedback');
    $feedbackButtons.click( function() {
      var buttonId = $(this).attr("id");
      console.log("clikced: " + buttonId);

      if (buttonId.indexOf('happy') > -1) {
        storeFeedback('happy');
      } else {
        storeFeedback('sad');
      }

      $feedbackButtons.attr("disabled", true);
      $thankYouText.show();

      setTimeout(function() {
        $feedbackButtons.attr("disabled", false);
        $thankYouText.hide();
      }, 1500);
    });
    console.log($feedbackButtons);

    selectPage('login-page');
});
