/* google maps -----------------------------------------------------*/
 // Define map as global scope
var map,cachedGeoJson,
			colorValues = [
	
				"green", //1
				"orange", //2
				"red", //3
			];


function initialize() {

  /* position Amsterdam */
  var latlng = new google.maps.LatLng(47.6097, -122.331);

  var mapOptions = {
    center: latlng,
    scrollWheel: false,
    zoom: 8
  };
  
    var marker = new google.maps.Marker({    //Only enable if market.setMap(map) uncomment
    position: latlng,
    url: '/',
    animation: google.maps.Animation.DROP
  });
  

  /* KML 
  var ctaLayer = new google.maps.KmlLayer({
    url: 'https://dl.dropboxusercontent.com/u/78586688/SInfoUMTS08022011.kml'
  });
   ctaLayer.setMap(map); */
 
  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions); //var removed from here to define global scope by declaring it outside of all functions
 
 // marker.setMap(map); 

   // Load a GeoJSON from the same server as our demo.
 // map.data.loadGeoJson('https://dl.dropboxusercontent.com/u/78586688/Cluster.json');

  // Add some style.
  map.data.setStyle(function(feature) {
    return /** @type {google.maps.Data.StyleOptions} */({
      fillColor: feature.getProperty('color'),
      strokeWeight: 1
    });
  });
 //MarkerCluster
 //   map.data.loadGeoJson('https://dl.dropboxusercontent.com/u/78586688/sites.json');
	// Load GeoJSON.
    var cluster = $.getJSON("layers/Cluster.json"); //same as map.data.loadGeoJson();
    cluster.then(function(data){
        cachedGeoJson = data; //save the geojson in case we want to update its values
        map.data.addGeoJson(cachedGeoJson,{idPropertyName:"ClusterID"});  //idPropertyName identify with getId

    });

    //style functions
    var setColorStyleFn = function(feature) {
      var kpi = feature.getProperty('KPI_1');
      var color;
      if (kpi > 2){
        color = colorValues[0];				      
      } else if (kpi < 2){
        color = colorValues[1];				      
      } else {
        color = colorValues[2];				      
      }   
      console.log( kpi)
    return {
          fillColor: color,
          strokeWeight: 1
        };
    };
  			
    // Set the stroke width, and fill color for each polygon, with default colors at first
    map.data.setStyle(setColorStyleFn);  
//map.data.setMap(null);
            $('#radio1').click(function(){
                 map.data.setMap($(this).is(':checked') ? map : null);
            });
             $('#radio2').click(function(){
                 map.data.setMap($('#radio1').is(':checked') ? map : null);
            });   



    //get the legend container, create a legend, add a legend renderer fn, define css on general.css
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
    
   
    
 //MarkerSites
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


//var mc = new MarkerClusterer(map, [], mcOptions); 
 
};

//Search site and move map in its location
function moveCenter() {
    //var lat = parseFloat(document.getElementById('markerLat').value);
    //var lng = parseFloat(document.getElementById('markerLng').value);
    //var newLatLng = new google.maps.LatLng(lat, lng);
   // marker.setPosition(newLatLng)
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


google.maps.event.addDomListener(window, 'load', initialize);




/* end google maps -----------------------------------------------------*/