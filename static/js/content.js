//INDIVIDUAL SITES

var link = window.location.href;

if(link.search("cars.com/vehicledetail/detail/") != -1){
  //returns cars.com id
  var id = link.split("/")[5];
  alert(id);
}
else if(link.search("truecar.com/prices-new/") != -1){
  var TC_jsonld = JSON.parse(document.querySelector('script[type="application/ld+json"]').innerHTML);
  var TC_brand = TC_jsonld[0]["brand"]["name"];
  var TC_year = TC_jsonld[0]["releaseDate"];
  var TC_model = TC_jsonld[0]["model"];
  var TC_body = "NONE";

  //parse through truecar data
  //truecar has sedans/coupes as different cars when NHTSA doesn't
  if(TC_model.toLowerCase().search(" coupe") != -1){
    TC_model = TC_model.split(" ")[0];
    TC_body = "COUPE";
  }
  else if(TC_model.toLowerCase().search(" sedan") != -1){
    TC_model = TC_model.split(" ")[0];
    TC_body = "SEDAN";
  }

  //special case when brand is scion
  if(TC_brand.toLowerCase() == "scion"){
    TC_brand = "toyota";
    TC_model = "scion " + TC_model;
  }
  var NHTSA_json_ids = `https://www.nhtsa.gov/webapi/api/SafetyRatings/modelyear/${TC_year}/make/${TC_brand}?format=json`;///model/${model}?format=json`;
  var NHTSA_request_ids = new XMLHttpRequest();
  NHTSA_request_ids.onload = NHTSA_getIDs;
  NHTSA_request_ids.open('get', NHTSA_json_ids,true);
  NHTSA_request_ids.send();

}

//================TRUECAR FUNCTIONS ====================\\

//function inputs number of solid stars returns amount of solid stars + remainder of stars
function draw_stars(num_solid){
  if(num_solid >= 0 && num_solid <= 5){// >= 0{
    var max = 5;
    var star_solid = String.fromCharCode(9733);
    var star_outline = String.fromCharCode(9734);
    return star_solid.repeat(num_solid) + star_outline.repeat(max-num_solid);
  }
  else{
    return "Not Rated";
  }
}

//gets initial IDs NHTSA (CAN PRODUCE MULTIPLE);
function NHTSA_getIDs(){
  var NHTSA_responseObj_ids = JSON.parse(this.responseText);
  var NHTSA_count = NHTSA_responseObj_ids.Count;
  if(NHTSA_count == 0){
    var vehicle_header = document.getElementById("vehicle_header");
    var textbox = document.createElement("div");
    textbox.id = "NHTSA_textbox";
    textbox.innerHTML = NHTSA_json_ids;//"No NHTSA data.");
    vehicle_header.appendChild(textbox);
  }
  else{
    //add all in cars in brand + model year
    var NHTSA_model_names = [];//ideally should have 1 value -- porsche has too many :(
    for(c1 = 0; c1 < NHTSA_count; c1++){
      var model_name = NHTSA_responseObj_ids.Results[c1].Model.toLowerCase();
      if(model_name.search(TC_model.toLowerCase()) != -1){
        console.log("TC_model: " + TC_model);
        console.log("model_id: " + NHTSA_responseObj_ids.Results[c1].VehicleId);
        console.log("model_name: " + model_name);
        NHTSA_model_names.push(model_name);
      }
    }
    if(NHTSA_model_names.length == 0){
      var vehicle_header = document.getElementById("vehicle_header");
      var textbox = document.createElement("div");
      textbox.id = "NHTSA_textbox";
      textbox.innerHTML = "Unable to find NHTSA data please contact jerrylei98@gmail.com";//"issue here " + model_name;//"No NHTSA data.");
      vehicle_header.appendChild(textbox);
    }
    else{
      var NHTSA_json_id = `https://www.nhtsa.gov/webapi/api/SafetyRatings/modelyear/${TC_year}/make/${TC_brand}/model/${NHTSA_model_names[0]}?format=json`;;
      var NHTSA_request_id = new XMLHttpRequest();
      NHTSA_request_id.onload = NHTSA_getID;
      NHTSA_request_id.open('get', NHTSA_json_id,true);
      NHTSA_request_id.send();
    }
  }
}

//grabs the individual ID
function NHTSA_getID(){
  var NHTSA_responseObj_id = JSON.parse(this.responseText);
  var NHTSA_count = NHTSA_responseObj_id.Count;
  var NHTSA_descr = [];
  var NHTSA_id = [];
  for(c1 = 0; c1 < NHTSA_count ; c1++){
    var vdescr = NHTSA_responseObj_id.Results[c1].VehicleDescription;
    var vid = NHTSA_responseObj_id.Results[c1].VehicleId;
    if(TC_body == "NONE"){
      NHTSA_descr.push(vdescr);
      NHTSA_id.push(vid);
    }
    //only adds 4door IDs
    else if(TC_body == "SEDAN" && vdescr.search("4 DR") != -1){
      NHTSA_descr.push(vdescr);
      NHTSA_id.push(vid);
    }
    //only adds 2door IDs
    else if(TC_body == "COUPE" && vdescr.search("2 DR") != -1){
      NHTSA_descr.push(vdescr);
      NHTSA_id.push(vid);
    }
  }
  if(NHTSA_id.length >= 1){
    var NHTSA_json_data = `https://www.nhtsa.gov/webapi/api/SafetyRatings/VehicleId/${NHTSA_id[0]}?format=json`;
    console.log(NHTSA_json_data);

    var NHTSA_request_data = new XMLHttpRequest();
    NHTSA_request_data.onload = NHTSA_getData;
    NHTSA_request_data.open('get', NHTSA_json_data,true);
    NHTSA_request_data.send();
  }
}

function NHTSA_getData(){
  var NHTSA_responseObj_data = JSON.parse(this.responseText);
  var NHTSA_data = {};
  NHTSA_data["Overall Rating"] = NHTSA_responseObj_data.Results[0].OverallRating;
  NHTSA_data["Overall Front Crash Rating"] = NHTSA_responseObj_data.Results[0].OverallFrontCrashRating;
  NHTSA_data["Overall Side Crash Rating"] = NHTSA_responseObj_data.Results[0].OverallSideCrashRating;
  NHTSA_data["Side Crash Driverside Rating"] = NHTSA_responseObj_data.Results[0].SideCrashDriversideRating;
  NHTSA_data["Side Crash Passengerside Rating"] = NHTSA_responseObj_data.Results[0].SideCrashPassengersideRating;
  var NHTSA_vehicle_description = NHTSA_responseObj_data.Results[0].VehicleDescription;
  var text_data = "NHTSA DATA for " + NHTSA_vehicle_description + "<br />";
  for(key in NHTSA_data){
    text_data += key + ": " + draw_stars(NHTSA_data[key]) + "<br />";
  }
  text_data += "<br />";
  var vehicle_header = document.getElementById("vehicle_header");
  var textbox = document.createElement("div");
  textbox.id = "NHTSA_textbox";
  textbox.innerHTML = text_data;
  vehicle_header.appendChild(textbox);
}
