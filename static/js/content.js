var link = window.location.href;


function draw_stars(num_solid){
  var max = 5;
  var star_solid = String.fromCharCode(9733);
  var star_outline = String.fromCharCode(9734);
  return star_solid.repeat(num_solid) + star_outline.repeat(max-num_solid);
}

if(link.search("cars.com/vehicledetail/detail/") > 0){
  //returns cars.com id
  var id = link.split("/")[5];
  alert(id);
}

else if(link.search("truecar.com/prices-new/") > 0){
  var jsonld = JSON.parse(document.querySelector('script[type="application/ld+json"]').innerHTML);
  var brand = jsonld[0]["brand"]["name"];
  var year = jsonld[0]["releaseDate"];
  var model = jsonld[0]["model"];
  var body = "NONE";

  //truecar has sedans/coupes as different cars when NHTSA doesn't
  if(model.toLowerCase().search(" coupe")> 0){
    model = model.split(" ")[0];
    body = "COUPE";
  }
  else if(model.toLowerCase().search(" sedan") > 0){
    model = model.split(" ")[0];
    body = "SEDAN";
  }

  var vehicle_header = document.getElementById("vehicle_header");
  //special case when brand is scion
  if(brand.toLowerCase() == "scion"){
    brand = "toyota";
    model = "scion " + model;
  }
  var NHTSA_json_id = `https://www.nhtsa.gov/webapi/api/SafetyRatings/modelyear/${year}/make/${brand}/model/${model}?format=json`;

  function makevars(){
    var responseObj = JSON.parse(this.responseText);
    var NHTSA_count = responseObj.Count;
    if(NHTSA_count == 0){
      var textbox = document.createTextNode(NHTSA_json_id);//"No NHTSA data.");
      vehicle_header.appendChild(t);
    }
    else{
      var NHTSA_message = responseObj.Message;
      var NHTSA_descr = [];
      var NHTSA_id = [];
      for(c1 = 0; c1 < NHTSA_count; c1++){
        var vdescr = responseObj.Results[c1].VehicleDescription;
        var vid = responseObj.Results[c1].VehicleId;
        if(body == "NONE"){
          NHTSA_descr.push(vdescr);
          NHTSA_id.push(vid);
        }
        else if(body == "SEDAN" && vdescr.search("4 DR") > 0){
          NHTSA_descr.push(vdescr);
          NHTSA_id.push(vid);
        }
        else if(body == "COUPE" && vdescr.search("2 DR") > 0){
          NHTSA_descr.push(vdescr);
          NHTSA_id.push(vid);
        }
        if(NHTSA_id.length == 1){
          var NHTSA_json_data = `https://www.nhtsa.gov/webapi/api/SafetyRatings/VehicleId/${NHTSA_id[0]}?format=json`;
          function makedata(){
            var responseObj2 = JSON.parse(this.responseText);
            var NHTSA_data = {};
            NHTSA_data["Overall Rating"] = responseObj2.Results[0].OverallRating;
            NHTSA_data["Overall Front Crash Rating"] = responseObj2.Results[0].OverallFrontCrashRating;
            NHTSA_data["Overall Side Crash Rating"] = responseObj2.Results[0].OverallSideCrashRating;
            NHTSA_data["Side Crash Driverside Rating"] = responseObj2.Results[0].SideCrashDriversideRating;
            NHTSA_data["Side Crash Passengerside Rating"] = responseObj2.Results[0].SideCrashPassengersideRating;
            var text_data = "NHTSA DATA: <br />";
            for(key in NHTSA_data){
              text_data += key + ": " + draw_stars(NHTSA_data[key]) + "<br />";
            }
            text_data += "<br />";
            var textbox = document.createElement("div");
            textbox.id = "NHTSA_textbox";
            textbox.innerHTML = text_data;
            vehicle_header.appendChild(textbox);
          }
          var request2 = new XMLHttpRequest();
          request2.onload = makedata;
          request2.open('get', NHTSA_json_data,true);
          request2.send();
        }
      }
    }
  }
  var request = new XMLHttpRequest();
  request.onload = makevars;
  request.open('get', NHTSA_json_id,true);
  request.send();

}
