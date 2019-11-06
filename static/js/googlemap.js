var map;
var directionsService;
var directionsRenderer;
var autoDriveSteps = new Array();
//var speedFactor = 0.03;
var speedFactor = 1;
var carBsPositions=[];
var distanceService;
var timeInterval=500;
var previous=0;
var recordCount=0;

const bs1={lat: 47.243492, lng: -122.438045};
const bs2 ={lat:47.243492,lng:-122.440107};
const bs3 ={lat:47.241992,lng:-122.439076};
const bs4={lat:47.241992, lng:-122.441138};

var bsSignals=[];


const iconCar="http://maps.google.com/mapfiles/kml/shapes/truck.png";
const iconBaseStation ="http://maps.google.com/mapfiles/kml/shapes/target.png";


const threshold= -80;


$(function() {
    $("#preference").sortable();
    $("#preference").disableSelection();
});



// Initialize and add the map
function initMap() {

// The map, centered at uwt
map = new google.maps.Map(
  document.getElementById('map'), {zoom: 16, center: bs1});

//markers on map
var marker1 = new google.maps.Marker({position: bs1, map: map,  label:"base   station   1"});
var marker2 = new google.maps.Marker({position: bs2, map: map,  label:"base   station   2"});
var marker3 = new google.maps.Marker({position: bs3, map: map,  label:"base   station   3"});
var marker4 = new google.maps.Marker({position: bs4, map: map,  label:"base   station   4"});

//init signals
for (var i = 0; i <4 ; i++) {
    bsSignals.push(getRandomSignal());
}


//render markers
var bs1Circle = new google.maps.Circle({
  strokeColor: '#FF0000',
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: '#FF0000',
  fillOpacity: 0.35,
  map: map,
  center: bs1,
  radius: 150
});

var bs2Circle = new google.maps.Circle({
        strokeColor: '#0000FF',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#0000FF',
        fillOpacity: 0.35,
        map: map,
        center: bs2,
        radius: 150
    });

var bs3Circle = new google.maps.Circle({
        strokeColor: '#00FF00',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#00FF00',
        fillOpacity: 0.35,
        map: map,
        center: bs3,
        radius: 150
    });

var bs4Circle = new google.maps.Circle({
    strokeColor: '#FFFF00',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FFFF00',
    fillOpacity: 0.35,
    map: map,
    center: bs4,
    radius: 150
});

//var sortedIDs = $( "#demo1" ).sortable( "toArray" );

}








// Using Directions Service find the route between the starting and ending points
function setRoutes(speed) {
  //start:47.242939, -122.437686
  //end:47.242602, -122.440834
  speedFactor= speed? parseInt(speed) : 1;
    var start="47.242939, -122.437686";
    //var end="47.242602, -122.440834";
    var end="47.243976, -122.441662";
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    distanceService = new google.maps.DistanceMatrixService();
    directionsRenderer.setMap(map);
    var request = {
      origin: start,
      destination: end,
      travelMode: 'DRIVING'
    };
    directionsService.route(request, function(result, status) {
      if (status == 'OK') {

        // directionsrenderer renders the directions obtained previously by the directions service
        directionsRenderer.setDirections(result);
        // calculate positions for the animation steps
        // the result is an array of LatLng, stored in autoDriveSteps
        autoDriveSteps = new Array();
        var remainingSeconds = 0;
        var leg = result.routes[0].legs[0]; // supporting single route, single legs currently
        leg.steps.forEach(function(step) {
            var stepSeconds = step.duration.value;
            var nextStopSeconds = speedFactor - remainingSeconds;
            while (nextStopSeconds <= stepSeconds) {
                var nextStopLatLng = getPointBetween(step.start_location, step.end_location, nextStopSeconds / stepSeconds);
                autoDriveSteps.push(nextStopLatLng);
                nextStopSeconds += speedFactor;
            }
            remainingSeconds = stepSeconds + speedFactor - nextStopSeconds;
        });
        if (remainingSeconds > 0) {
            autoDriveSteps.push(leg.end_location);
        }

        var carMark = new google.maps.Marker({map:map,icon:iconCar});
        var connection = new google.maps.Polyline({
          path: [bs1],
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 2,
          map:map
        });

        startRouteAnimation(carMark,connection);

      }
    });

}

    // helper method to calculate a point between A and B at some ratio
function getPointBetween(a, b, ratio) {
    return new google.maps.LatLng(a.lat() + (b.lat() - a.lat()) * ratio, a.lng() + (b.lng() - a.lng()) * ratio);
}

function getConnectedBs(position) {
    var bsList=[];

    if (getDistance(position,bs1)<150 && bsSignals[0]['signalStrength']>=threshold){
        bsList.push(1)
    }
    if (getDistance(position,bs2)<150 && bsSignals[1]['signalStrength']>=threshold){
        bsList.push(2)
    }
    if (getDistance(position,bs3)<150 && bsSignals[2]['signalStrength']>=threshold){
        bsList.push(3)
    }
    if (getDistance(position,bs4)<150 && bsSignals[3]['signalStrength']>=threshold){
        bsList.push(4)
    }
    return bsList
}

function renderDistances(position) {
    //show distances
    carBs1Distance=getDistance(bs1,position);
    carBs2Distance=getDistance(bs2,position);
    carBs3Distance=getDistance(bs3,position);
    carBs4Distance=getDistance(bs4,position);
    document.getElementById("distance1").innerHTML = Math.floor(carBs1Distance)+" meters";
    document.getElementById("distance2").innerHTML = Math.floor(carBs2Distance)+" meters";
    document.getElementById("distance3").innerHTML = Math.floor(carBs3Distance)+" meters";
    document.getElementById("distance4").innerHTML = Math.floor(carBs4Distance)+" meters";

    for (var i = 1; i <5 ; i++) {
        if (eval("carBs"+i+"Distance")>150){
            document.getElementById("distance"+i).innerHTML = "out of range";
        }
    }

}

function renderSSR() {
    for (var i = 1; i <5 ; i++) {
        if (bsSignals[i-1]['signalStrength']>=-80){

            var data=bsSignals[i-1]['signalStrength'];
            var ratio=(((data+80)/50)*100).toFixed(0);

            document.getElementById("SSR"+i).innerHTML = "<div class=\"progress\"><div class=\"progress-bar\" role=\"progressbar\" style=\"width:"+
                ratio+
                "%;\">"+
                data+
                "</div></div>";
        }else{
            document.getElementById("SSR"+i).innerHTML = "poor connection";
        }

    }
}

var rad = function(x) {
    return x * Math.PI / 180;
};

var getDistance = function(p1, p2) {
    var R = 6378137; // Earth’s mean radius in meter
    var dLat = rad(p2.lat - p1.lat);
    var dLong = rad(p2.lng - p1.lng);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d; // returns the distance in meter
};

    // start the route simulation
function startRouteAnimation(marker,connection) {
    var autoDriveTimer = setInterval(function () {
            // stop the timer if the route is finished
            if (autoDriveSteps.length === 0) {
                clearInterval(autoDriveTimer);
            } else {

                connection.setMap(null);

                // move marker to the next position (always the first in the array)
                marker.setPosition(autoDriveSteps[0]);

                var newbs1Signal=getVariableParams();
                var newbs2Signal=getVariableParams();
                var newbs3Signal=getVariableParams();
                var newbs4Signal=getVariableParams();

                for (var i = 1; i <5 ; i++) {
                     bsSignals[i-1]= Object.assign({},bsSignals[i-1],eval("newbs"+i+"Signal"));
                }

                var bsList=getConnectedBs(autoDriveSteps[0].toJSON());
                var bsPositions=[];

                bsList.forEach((value => {
                    bsPositions.push(eval("bs"+value));
                }));

                if (bsPositions.includes(carBsPositions[0])){
                    carBsPositions=[carBsPositions[0]];

                }else{
                    var requestData={"signals":[],"preference":[]};
                    requestData['preference']=$( "#preference" ).sortable( "toArray" );

                    for (var i = 0; i <4 ; i++) {
                        if (bsList && bsList.includes(i+1)){
                            bsSignals[i]['id']=i+1;
                            requestData['signals'].push(bsSignals[i]);
                        }
                    }

                    $.ajax({
                        url: 'http://nbiot-handoff.appspot.com/getbs',
                        // url: 'http://127.0.0.1:5000/getbs',
                        type: 'post',
                        headers:{"content-type":"Application/json"},
                        data: JSON.stringify(requestData),
                        success: function (data) {
                            if (data!=previous){
                                recordCount+=1;
                                $("#record").html($("#record").html()+"("+recordCount+") "+"switch to base station "+data.toString()+";<br/>");
                                previous=data;
                            }

                            if (data.toString()==="1"){
                                carBsPositions=[bs1];
                            }else if(data.toString()==="2"){
                                carBsPositions=[bs2];
                            }else if(data.toString()==="3"){
                                carBsPositions=[bs3];
                            }
                            else {
                                carBsPositions=[bs4];
                            }
                        }
                    });

                }









                //render distances on map
                renderDistances(autoDriveSteps[0].toJSON());
                //render SSR on map
                renderSSR();


                carBsPositions.push(autoDriveSteps[0]);
                // remove the processed position
                autoDriveSteps.shift();



                connection = new google.maps.Polyline({
                  path: carBsPositions,
                  geodesic: true,
                  strokeColor: '#FF0000',
                  strokeOpacity: 1.0,
                  strokeWeight: 2,
                  map:map
                });


            }
        },
        timeInterval);
}
