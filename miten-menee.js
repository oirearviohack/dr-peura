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

// TODO: Implement learning algorithm here to forward user to professional care.
function analyzeResults() {
  var sadCount = theData.slice().reverse().slice(0,5).filter(function(item) {
    return item.result == "sad";
  }).length

  console.log("sadCount: " + sadCount);

  if (sadCount >= 5) {
    selectPage("call-help-page");
  }
}

function renderResultsPage() {
  clearResultsPage();

  // slice makes a copy of the array:
  var results = loadResults().slice().reverse();
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
    moment.locale('fi');
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

    var $feedbackButtons = $('img.feedback');
    $feedbackButtons.click( function() {
      var imgId = $(this).attr("id");
      console.log("clikced: " + imgId);

      if (imgId.indexOf('happy') > -1) {
        storeFeedback('happy');
      } else {
        storeFeedback('sad');
      }

      $feedbackButtons.attr("disabled", true);
      $thankYouText.show();

      setTimeout(function() {
        $feedbackButtons.attr("disabled", false);
        $thankYouText.hide();
        analyzeResults();
      }, 500);
    });
    console.log($feedbackButtons);

    selectPage('login-page');
});
