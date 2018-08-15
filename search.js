var HTMLParser = require('node-html-parser');
var request = require('request');

var resultsList = [];

// #### LIST OF CARAVANS ####
// ##########################
var caravans = [
  {Brand: 'Adria', model: '462 PK'},
  {Brand: 'Adria', model: '552 PK'},
  {Brand: 'Adria', model: '542 PK'},
  {Brand: 'Burstner', model: '490 TK'},
  {Brand: 'Burstner', model: '495 TK'},
  {Brand: 'Burstner', model: 'Averso 480 TK'},
  {Brand: 'Dethleffs', model: '540 SK'},
  {Brand: 'Dethleffs', model: '500 TK'},
  {Brand: 'Knaus', model: '500 FDK'},
  {Brand: 'Knaus', model: '500 QDK'}
];


// #### REQUEST  OPTIONS ####
// ##########################
var options = {
  url: 'https://www.caravans.nl/search/routeSearch.php',
  jar: true,
  followAllRedirects: true,
  form:
    {
        Cat: 'caravan',
        CatID: 'caravan',
        ResetSearch: '0',
        verkoopverhuur: 'verkoop',
        soort: 'caravan',
        prijsVan: '2500',
        prijsTot: '25000',
        bouwjaarVan: '2001',
        gewichtTot: '1600',
        itemPerPage: '122'
    }
};


// #### START A SEARCH FOR THE FIRST CARAVAN ####
// ##############################################
searchCaravan(0);


// #### Function which takes the number of the
// #### object position in the caravans array
// #### as its single argument
function searchCaravan(element) {
  if (element < caravans.length) {
    options.form['Brand'] = caravans[element].Brand;
    options.form['model'] = caravans[element].model;
    request.post(options, function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
          var dom = HTMLParser.parse(body);
          var results = dom.querySelectorAll('.object');
          for (i = 0; i < results.length; i++) {
            // Parse html to dom again, but now for just this 1 caravan html part
            dom = HTMLParser.parse(results[i].innerHTML);
            var href = 'https://www.caravans.nl' + results[i].attributes.href;
            var title = dom.querySelector('h2').rawText;
            var img = dom.querySelector('.image img').attributes.src;
            var price = dom.querySelector('.price b').rawText;
            var buildyear = dom.querySelector('.info tr td strong').rawText;
            
            var caravan = {
              href: href,
              title: title,
              img: img,
              price: price,
              buildyear: buildyear
            }
            // Add found caravan to the results list array
            resultsList.push(caravan);
          }
          // Call this function again for the next caravan
          searchCaravan(this.elementAsy + 1);
        }
      }.bind({elementAsy:element})
    );
  }
  // No more caravans to process, so we can wrap up
  else {
    generateHtml(resultsList);
  }
}


// #### Generate HTML DOCUMENT
function generateHtml(arr) {
  var htmlDoc = `<!DOCTYPE html>
<head>
    <style>
        div.price {
            text-align: left;
            display: inline-block;
            margin-left: 5px;
        }
        div.year {
            text-align: right;
            display: inline-block;
            float: right;
            margin-right: 5px;
        }
        h4 {
            margin-top: 5px;
            margin-bottom: 5px;
            margin-left: 5px;
        }
        table { border-collapse: collapse; }
        tr { border: solid thin; }
    </style>
</head>
<html>
<body>
    <table style="width:250px;">`;

  // Add table row for each caravan
  for (i = 0; i < arr.length; i++) {
    htmlDoc += '<tr><td>';
    htmlDoc += '<h4>' + arr[i].title + '</h4>';
    htmlDoc += '<a href="' + arr[i].href + '">';
    htmlDoc += '<img src="' + arr[i].img + '"></a>';
    htmlDoc += '<div class="price"><strong>' + arr[i].price + '</strong></div>';
    htmlDoc += '<div class="year"><span>' + arr[i].buildyear + '</span></div>';
    htmlDoc += '</td></tr>';
  }

  // Output the html document
  htmlDoc += '</table></body></html>';
  console.log(htmlDoc);
}

