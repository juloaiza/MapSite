/* google maps -----------------------------------------------------*/
 // Define map as global scope
var map,cachedGeoJson,
			colorValues = [
	
				"green", //1
				"orange", //2
				"red", //3
			];
var cluster = $.getJSON("layers/Cluster.json");
var features = null;           


function initialize() {
     /* position */
    var latlng = new google.maps.LatLng(47.6097, -122.331);
    var mapOptions = {
        center: latlng,
        scrollWheel: false,
        zoom: 8
    };
   map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
 
    // Load Sites
    sites();
   // create a legend
   legend();
   document.getElementById("put_geojson_string_here").value = cluster;
 }

/*It adds a listener to the window object, which as soon as the load event is triggered 
(i.e. "the page has finished loading") executes the function initialize.
Another option define  html <body onload="initialize();"> */
google.maps.event.addDomListener(window, 'load', initialize);

/* end google maps -----------------------------------------------------*/

function test(){
 console.log( "teststet")
}

 //Sites Layer
 function sites() {
 // getJson help me to read json file
    $.getJSON('layers/sites.json', function(data) {
        var markers = [];
        for (var i in data.features) {
          var latLng = new google.maps.LatLng(data.features[i].properties.Lat,data.features[i].properties.Long);
          var marker = new google.maps.Marker({
            position: latLng,
            title: data.features[i].properties.Site,
           icon : 'icons/radio-station-2.png'
          });
          markers.push(marker);

          // Wrapping the event listener inside an anonymous function pag92
          // that we immediately invoke and passes the variable i to.
         (function(i, marker) {

         // Creating the event listener. It now has access to the values of
        // i and marker as they were during its creation
        google.maps.event.addListener(marker, 'click', function() {
            var infowindow = new google.maps.InfoWindow({
                content: data.features[i].properties.Site
            });
            infowindow.open(map, marker);
            });
          })(i, marker);
        }
        // Adding the markers to the MarkerClusterer
        var mcOptions = {gridSize: 50, maxZoom: 14};
        var markerCluster = new MarkerClusterer(map, markers,mcOptions);
    });
}


//get the legend container, create a legend, add a legend renderer fn, define css on general.css
function legend() {
    var $legendContainer = $('#legend-container'),
        $legend = $('<div id="legend">').appendTo($legendContainer),
        renderLegend = function(colorValuesArray){
            $legend.empty();
            $.each(colorValuesArray,function(index, val){
                var $div = $('<div style="height:25px;">').append($('<div class="legend-color-box">').css({
                    backgroundColor:val,
                })).append($("<span>").css("lineHeight","23px").html("Zone " + index));
                  
                $legend.append($div);
            });	
        }
    
    //make a legend for the first time
    renderLegend(colorValues);    

    //add the legend to the map
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push($legendContainer[0]);  
}


//Search site and move map in its location
function moveCenter() {
     $.getJSON('layers/sites.json', function(data) {
        
        // the code you're looking for
        var site = document.getElementById('sear').value;
      
        // iterate over each element in the array
        for (var i = 0; i < data.features.length; i++){
          // look for the entry with a matching `code` value
            var jsite = data.features[i].properties.Site
          //  console.log( jsite.substring(0,7)) 
            if (jsite.substring(0,7) == site){
             // we found it
            var newLatLng = new google.maps.LatLng(data.features[i].properties.Lat,data.features[i].properties.Long);
            map.setCenter(newLatLng)
            map.setZoom(14)

            //break;
          }
        }
        //console.log( site)
    });
 }
 
// Remove layer
function clearMap(){
    if (!features)
        return;
    for (var i = 0; i < features.length; i++){
      map.data.remove(features[i]);
    }
} 

 //ShowCluster
function showFeature(layer, nkpi){
   clearMap();
//console.log( style)
console.log( nkpi)

    layer.then(function(data){
        cachedGeoJson = data; //save the geojson in case we want to update its values
        features = map.data.addGeoJson(cachedGeoJson,{idPropertyName:"ClusterID"});  //idPropertyName identify with getId

    });

     //style functions
    var setColorStyleFn = function(feature) {
      var kpi = feature.getProperty(nkpi);
      var color;
      if (kpi > 2){
        color = colorValues[0];				      
      } else if (kpi < 2){
        color = colorValues[1];				      
      } else {
        color = colorValues[2];				      
      }   
 //     console.log( kpi)
    return {
          fillColor: color,
          strokeWeight: 1
        };
    };   
    
    map.data.setStyle(setColorStyleFn);  
 
 //listen for click events
    map.data.addListener('click', function(event) {
        //show an infowindow on click   
        infoWindow = new google.maps.InfoWindow({
          content: ""
        });        
        infoWindow.setContent('<div style="line-height:1.35;overflow:hidden;white-space:nowrap;"> Cluster = '+
                                    event.feature.getId() +"<br/>Cluster Name = " + event.feature.getProperty("ClusterName") + "</div>");
        var anchor = new google.maps.MVCObject();
        anchor.set("position",event.latLng);
        infoWindow.open(map,anchor);
    });  
}
 

 
 
 
 
 