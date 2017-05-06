console.log( "loading js" );

// "session"
userName = "";

// TODO: Move this to oda-phr
theData = [];

function storeFeedback(happyOrSad, callback) {
  var time = moment().format();
  var jsonData = createObservation(happyOrSad);

  console.log("Storing " + happyOrSad + "!");
  // POST https://oda.medidemo.fi/phr/baseDstu3/Observation?_format=json&_pretty=true
  // theData.push({'time': time, 'result': happyOrSad});
  $.post(
    "https://oda.medidemo.fi/phr/baseDstu3/Observation?_format=json&_pretty=true",
    jsonData,
    callback,
    "application/fhir+json; charset=UTF-8"
  );
}

function createObservation(result) {
  return {
    "resourceType": "Observation",
    "meta": {
      "versionId": "1"
    },
    "code": {
      "text": "Miten menee"
    },
    "status": "final",
    "subject": {
      "reference": "Patient/" + userName
    },
    "effectiveDateTime": moment().format(),
    "valueString": result
  }
}

function loadResults() {
  return theData;
}

// TODO: Implement learning algorithm here to forward user to professional care.
function analyzeResults() {
  var sadCount = theData.slice().reverse().slice(0,10).filter(function(item) {
    return item.result == "sad";
  }).length

  console.log("sadCount: " + sadCount);

  if (sadCount > 5) {
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
    var face = "";
    if (element.result === "happy") {
      face="Hymynaama.png";
    } else if (element.result === "sad") {
      face="Surunaama.png";
    }
    $item = $('<div>' + '<img src=' + face + '>' + ' ' + time + '</div>');
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

    var $feedbackButtons = $('button.feedback');
    $feedbackButtons.click( function() {
      var buttonId = $(this).attr("id");
      console.log("clikced: " + buttonId);

      if (buttonId.indexOf('happy') > -1) {
        storeFeedback('happy', function() {
          console.log("Stored happy");
        });
      } else {
        storeFeedback('sad', function() {
          console.log("Stored sad");
        });
      }

      $feedbackButtons.attr("disabled", true);
      $thankYouText.show();

      setTimeout(function() {
        $feedbackButtons.attr("disabled", false);
        $thankYouText.hide();
        analyzeResults();
      }, 1500);
    });
    console.log($feedbackButtons);

    selectPage('login-page');
});
