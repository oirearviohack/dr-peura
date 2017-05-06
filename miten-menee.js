console.log( "loading js" );

// "session"
userName = "";

function storeFeedback(happyOrSad, callback) {
  var time = moment().format();
  var jsonData = createObservation(happyOrSad);

  console.log("Storing " + happyOrSad + "!");
  // POST https://oda.medidemo.fi/phr/baseDstu3/Observation?_format=json&_pretty=true
  // theData.push({'time': time, 'result': happyOrSad});

  $.ajax({
      type: "POST",
      url: "https://oda.medidemo.fi/phr/baseDstu3/Observation?_format=json&_pretty=true",
      // The key needs to match your method's input parameter (case-sensitive).
      data: JSON.stringify(jsonData),
      contentType: "application/fhir+json; charset=UTF-8",
      dataType: "json",
      success: callback,
      failure: function(errMsg) {
          alert(errMsg);
      }
  });
}

// https://oda.medidemo.fi/phr/baseDstu3/Observation?code=http://snomed.info/sct|49727002&_pretty=true

function createObservation(result) {
  return {
    "resourceType": "Observation",
    "meta": {
      "versionId": "1"
    },
    "code": {
      "coding": [
        {
          "system": "https://github.com/oirearviohack/dr-peura",
          "code": "1",
          "display": "Miten menee"
        }
      ],
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

function loadResults(callback) {
  var url ="https://oda.medidemo.fi/phr/baseDstu3/Observation?patient=Patient%2F" + userName + "&code=https%3A%2F%2Fgithub.com%2Foirearviohack%2Fdr-peura%7C1&_count=1000&_pretty=true"

  // https%3A%2F%2Fgithub.com%2Foirearviohack%2Fdr-peura%7C1
  // patient=Patient%2FPATIENT1
  // patient=Patient/PATIENT1&_format=json&_pretty=true
  // https://oda.medidemo.fi/phr/baseDstu3/Observation?patient=Patient/PATIENT1&code=https://github.com/oirearviohack/dr-peura|1&_pretty=true

  $.getJSON(url, function(result) {
    var resultsArray = result.entry;
    console.log(result.entry);

    var dataArray = resultsArray.map(function(item) {
      return { result: item.resource.valueString, time: item.resource.effectiveDateTime };
    });

    callback(dataArray);
  });
}


// TODO: Implement learning algorithm here to forward user to professional care.
function analyzeResults() {
  loadResults(function(results) {
    var sadCount = results.slice().reverse().slice(0,5).filter(function(item) {
      return item.result == "sad";
    }).length

    console.log("sadCount: " + sadCount);

    if (sadCount >= 5) {
      selectPage("call-help-page");
    }
  });
}

function renderResultsPage() {
  clearResultsPage();

  // slice makes a copy of the array:
  loadResults(function (results) {
    results.slice().reverse();
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
      var $userNameElement = $('input#user-name');
      userName = $userNameElement.val();
      console.log("Login as " + userName, $userNameElement);
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
        storeFeedback('happy', function(result) {
          console.log("RESULT: ", result);
        });
      } else {
        storeFeedback('sad', function(result) {
          console.log("RESULT: ", result);
        });
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
