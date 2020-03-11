function writeLocationName( location ) {
    let locationName = "";
    if ( location["Province/State"] == "") {
        locationName += location["Country/Region"];
    } else {
        locationName += '<em>' + location["Province/State"] + ',</em>&nbsp;' + location["Country/Region"];
    } 
    return locationName
}


function drawLocation( location, scale ) {

    let locationHTML = "";

    // Get the number of cases, and scale it by the specific math function 
    // that was supplied as the 'scale' argument.
    let numberOfCases = location["Confirmed"];
    let fontSize = scale(numberOfCases)

    let status = "";
    if ( location["Deaths"] == 0 ){
        status = ' no-death';
    }

    // build the HTML string
    locationHTML += '<div class="location' + status + '">';

    locationHTML += '<div class="name" style="font-size:' + fontSize +'px">';
    locationHTML += writeLocationName(location);
    locationHTML += '</div></div>';

    return locationHTML;
}


$(document).ready(function() {

    let html = "";

    /* 
    * Coronavirus data from https://github.com/CSSEGISandData/COVID-19/blob/master/csse_covid_19_data/csse_covid_19_daily_reports/03-10-2020.csv
    * converted to JSON format via
    * https://www.csvjson.com/csv2json
    */

    $.getJSON('js/coronavirus_data_10MAR2020.json', function(data) {
    
        let logarithmicScale = function( numberOfCases ) { return Math.log(numberOfCases) * 10; };
        let linearScale = function( numberOfCases ) { return numberOfCases / 100; };

        $.each(data, function(i, location){
            
            if (location["Confirmed"] !== 0){
                html += drawLocation(location, logarithmicScale);
            }
        });

        $('main').append(html);
    });

});