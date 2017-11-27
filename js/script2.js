//dimension set-up
var margin = {top: 10, left: 8, bottom: 10, right: 8}
  , width = window.outerWidth
  , width = width - margin.left - margin.right
  , mapRatio = .5
  , height = width * mapRatio;

var svg = d3.select("#map").append("svg").attr("height", "100%").attr("width", "100%");

var color_gender = d3.scale.quantize().range(["#EF3998", "#5E81C0", "#F7E351"]);
var gender_order = ["Female", "Male", "Gender-neutral"];

var color_type = d3.scale.quantize().range(["#D36A33", "#DFB058", "#9BB06D", "#377282"]);
var type_order =["Generics", "Movie-characters", "Animals", "Fantasy-creatures"]

var w = d3.select("#map").node().clientWidth;
    // adjust things when the window size changes
    width = w - margin.left - margin.right;
    height = width * mapRatio;
//Tells the nap what projection to use
var projection = d3.geo.albersUsa()
                    .translate([width/2, height/2])
                    .scale(width);

//Tells the map how to draw the paths from the projection
var path = d3.geo.path()
    .projection(projection);

d3.csv("hc.csv", function(data){

  d3.json("us-states.json", function(json){
    for (var i = 0; i < data.length; i ++){
      //console.log(data);
      //extract data from the data file
      var dataState = data[i].Abbrev;
      var dataValue = parseFloat(data[i].Gender_code);
      var dataGender = data[i].Gender;
      var dataType = data[i].Type;
      var dataTypeCode = data[i].Type_code;
      var dataCostume = data[i].Costume;
      var dataStateFull = data[i].State;

      for (var j = 0; j <json.features.length; j ++){
        var jsonState = json.features[j].properties.name;
        //merge data file with JSON file
        if(dataState === jsonState){
          json.features[j].properties.genderValue = dataValue;
          json.features[j].properties.gender = dataGender;
          json.features[j].properties.type = dataType;
          json.features[j].properties.costume = dataCostume;
          json.features[j].properties.stateFull = dataStateFull;
          json.features[j].properties.typeValue = dataTypeCode;

          //console.log(json.features[j]);
          break;
        }
      }

    }
    svg.selectAll("path")
      .data(json.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("data-state", function(d,i){ return d.properties.name; })
      .attr("data-gender", function(d,i){ return d.properties.gender; })
      .attr("data-type", function(d,i){ return d.properties.type; })
      .attr("data-costume", function(d,i){ return d.properties.costume; })
      .on("click", function(d){
        var state = d.properties.stateFull;
        var costume = d.properties.costume;
        d3.select("#state-selected").text(state + ": " + costume);
      })
      .on("mouseover", function(d){
        d3.select(this).transition().duration(300).style("opacity", 0.6);

        var xPosition = d3.event.pageX;
        var yPosition = d3.event.pageY-630;
        if (window.outerWidth > 1400){
          yPosition = d3.event.pageY-550;
        } else if (window.outerWidth < 992){
          yPosition = d3.event.pageY-350;
        }

        d3.select("#tooltip")
          .transition().duration(300)
          .style("left", xPosition+"px")
          .style("top", (yPosition)+"px")
          .select("#tooltip-val")
          .text(d.properties.costume);

        d3.select("#tooltip")
          .select("#tooltip-state")
          .text(d.properties.stateFull);

        d3.select("#tooltip").classed("hidden", false);
      })
      .on("mouseout", function(){
        d3.select(this).transition().duration(300).style("opacity", 1);
        d3.select("#tooltip").classed("hidden", true);
      })
//color domain
      color_gender.domain([1,3]);
      color_type.domain([1,4]);
//default color scheme
      svg.selectAll("path")
        .style("fill", function(d) {
          //Add gender value
          var value = d.properties.genderValue;
          if (value){
            return color_gender(value);
          } else {
            return "#ccc";
          }
        })

      //map color when user clicks on "Costume Audience"
      d3.select("#costume-audience-title")
        .on("mouseover", function(){
          d3.select(this).style("cursor", "pointer");
        })
        .on("click", function(){
          svg.selectAll("path")
            .transition().duration(300)
            .style("fill", function(d) {
              //Add gender value
              var value = d.properties.genderValue;
              if (value){
                return color_gender(value);
              } else {
                return "#ccc";
              }
            })
        })
      //map color when user clicks on "Costume Type"
      d3.select("#costume-type-title")
        .on("mouseover", function(){
          d3.select(this).style("cursor", "pointer");
        })
        .on("click", function(){
          svg.selectAll("path")
            .transition().duration(300)
            .style("fill", function(d) {
              //Add gender value
              var value = d.properties.typeValue;
              if (value){
                return color_type(value);
              } else {
                return "#ccc";
              }
            })
        })
      //map color when user clicks on individual costume audience gender legend
      d3.selectAll(".gender-legend")
        .on("mouseover", function(){
          d3.select(this).style("cursor", "pointer");
        })
        .on("click", function(){
          var gender_selected = this.id;
          var gender_index = gender_order.indexOf(this.id);
          //console.log(gender_index);
          svg.selectAll("path")
            .transition().duration(300)
            .style("fill", function(d) {
              if (d.properties.gender === gender_selected){
                return color_gender(gender_index+1);
              } else {
                return "#ccc";
              }
            })
        });
      //map color when user clicks on costume type
      d3.selectAll(".type-title-container")
        .on("mouseover", function(){
          d3.select(this).style("cursor", "pointer");
        })
        .on("click", function(){
          var type_selected=this.id;
          var type_index = type_order.indexOf(type_selected);
          svg.selectAll("path")
            .transition().duration(300)
            .style("fill", function(d) {
              if (d.properties.type === type_selected){
                return color_type(type_index+1);
              } else {
                return "#ccc";
              }
            })
        });

      //map color when user clicks on individual costume type avatar
      d3.selectAll(".costume-container")
        .on("mouseover", function(){
          d3.select(this).style("cursor", "pointer");
        })
        .on("click", function(){
          var character_selected = this.id;
          var type_selected = this.getAttribute("data-type");
          //console.log(type_selected);
          var type_index = type_order.indexOf(type_selected);
          svg.selectAll("path")
            .transition().duration(300)
            .style("fill", function(d){
              if (d.properties.costume === character_selected){
                return color_type(type_index+1);
              } else if (character_selected === "Wonder-woman" && d.properties.costume === "Wonder Woman"){
                return color_type(type_index+1);
              } else if (character_selected === "Harley-quinn" && d.properties.costume === "Harley Quinn"){
                return color_type(type_index+1);
              } else {
                return "#ccc";
              }
            })
        });

  })

})

//responsiveness

d3.select(window).on('resize', resize);

function resize() {

    var w = d3.select("#map").node().clientWidth;
    console.log("resized", w);

    // adjust things when the window size changes
    width = w - margin.left - margin.right;
    height = width * mapRatio;

    console.log(width)
    // update projection
    var newProjection = d3.geo.albersUsa()
      .scale(width*1.1)
      .translate([width / 2, height / 2]);

    //Update path
    path = d3.geo.path()
      .projection(newProjection);

    // resize the map container
    svg
        .style('width', width + 'px')
        .style('height', height + 'px');

    // resize the map
    svg.selectAll("path").attr('d', path);
}

d3.selectAll("path")
  .on("click", function(d){
    console.log("click");
    console.log(d.stateFull);
  })

//ScrollReveal
window.sr = ScrollReveal();
sr.reveal(".title", { duration: 1000 });
sr.reveal(".author", { duration: 1000 });
sr.reveal("#intro", { duration: 1500 });
sr.reveal("#gender-lengend-section", { duration: 1500 });
sr.reveal("#map", { duration: 2000 });
sr.reveal("#type-lengend-section", { duration: 2000 });
sr.reveal(".footnote", { duration: 1000 });



