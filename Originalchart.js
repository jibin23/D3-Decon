
(function() {
  vis = {}
  var parseDate = d3.timeParse("%Y");
  var valueline, width, height, x, y, avgGrowth, orgGDP, finalGDP, val, cumulativeDiff, adjustable_area,midpoint,thirdpoint,tickVals;
  var immigrants = 0;
  var pd = {};
  var baseline = "normal";
  var ww = $(window).width();

  vis.init = function() {
    vis.loaddata();
  }

  var arrow = "M7.2,56.6c-5.1-8.3-7.4-18.8-6.9-30.3c0.4-7.5,2.3-15.8,6-25.1l1.1,5.4c0,0.2,0.2,0.3,0.4,0.3c0.2,0,0.3-0.2,0.3-0.4 L6.9,0.3c0-0.1-0.1-0.2-0.2-0.3c-0.1,0-0.3,0-0.4,0L1.3,3.9C1.2,3.9,1.2,4,1.1,4c0,0.1,0,0.3,0,0.4c0.1,0.2,0.4,0.2,0.5,0.1l4.4-3.3 c-3.7,9.3-5.7,17.6-6,25.1C-0.5,37.9,1.9,48.4,7,56.7c5.7,9.3,14.6,15.5,25.8,17.9l0.1-0.2C21.7,72,12.9,65.8,7.2,56.6z"

  var scenarios1 = {
   "slide":"If we <span>allowed in</span> <span class='num-imm'></span> <span>immigrants per year</span>",
   "zero":"If we <span>stopped immigration entirely</span>",
   "deport": "If we <span>deported all 7.1 million unauthorized immigrant workers</span>",
   "legalize": "If we <span>legalized all 7.1 million unauthorized immigrant workers</span>",
   "status-quo": "If we <span>left immigration at current levels</span>",
   "under-status-quo":"If we <span>allowed in</span> <span class='num-imm'></span> <span>immigrants per year</span>"
  }

  var scenarios2 = {
   "slide":"We'd <span>gain a cumulative <span class='cumulative-num'></span> in GDP</span> over the next 14 years. Average growth would be <span class='avg-growth'></span>.",
   "zero":"We'd <span>lose a cumulative <span class='cumulative-num'></span> in GDP</span> over the next 14 years. Average growth would be <span class='avg-growth'></span>.",
   "deport": "We'd <span>lose a cumulative <span class='cumulative-num'></span> in GDP</span> over the next 14 years. Average growth would be <span class='avg-growth'></span>.",
   "legalize": "We'd <span>gain a cumulative <span class='cumulative-num'></span> in GDP</span> over the next 14 years. Average growth would be <span class='avg-growth'></span>.",
   "status-quo": "GDP would reach $24.6 trillion in 2030. Average growth would be <span class='avg-growth'></span>.",
   "under-status-quo":"We'd <span>lose a cumulative <span class='cumulative-num'></span> in GDP</span> over the next 14 years. Average growth would be <span class='avg-growth'></span>."
  }

  
  var cumulative_scenarios = {
   "slide":"Cumulative gain of <tspan class='cumulative-num'></tspan>",
   "zero":"Cumulative loss of <tspan class='cumulative-num'></tspan>",
   "deport": "Cumulative loss of <tspan class='cumulative-num'></tspan>",
   "legalize": "Cumulative gain of <tspan class='cumulative-num'></tspan>",
   "status-quo": "",
   "under-status-quo":"Cumulative loss of <tspan class='cumulative-num'></tspan>"
  }

  vis.loaddata = function() {

    d3.csv("//propublica.s3.amazonaws.com/projects/graphics/immigration/gdp/forecasts_LG_May25.csv", function(error, data) {
      croppedData = data.filter(function(d) {
        return d["Year"] < 2031 && d["Year"] > 2015
      })


      vis.draw(croppedData,immigrants);
      orgGDP = croppedData.slice(-1)[0].gdp/1000;
    });

  }

  vis.plusminus = function(num) {
    return num > 0 ?  "+" :  ""
  }

  function formatFixed(x) {
    return +(+x).toFixed(1) + "";
  }

  function fmtFixedPrc(x) {
    var term = d3.format(".1%")(x)
    term = term.replace(".0%"," percent")
    term = term.replace("%"," percent")
    return term
  }

  function fmtFixedPrc2(x) {
    var term = d3.format(".1%")(x)
    return term.replace(".0%","%")
  }

  function lowercaseFmt(term) {
    return term.replace("We","we")
  }

  vis.fmtMil = function(num) {
    var n = parseFloat(Math.round( num * 10) / 10)
    n == 0 ? n = n : n = n+" million"
    return n
  }

  vis.activate = function(val) {
    d3.select(".active").classed("active",false)
    d3.select("#"+val).classed("active",true)

    if (val != "slider") {
      vis.resetSlider()
      d3.selectAll(".slider .handle path").attr("fill","#fff")
    }
  }

  vis.resetButton = function(data) {
    
    vis.processData(data, immigrants, "status-quo")
    vis.activate("slider")
    d3.selectAll(".slider .handle path").attr("fill","#f3dc6b")
  }


  vis.transitionChart = function(data, immigrants, scenario) {
      d3.select("#chart").attr("class",scenario+"-scenario")

      finalGDP = data.slice(-1)[0].gdp/1000

      var adjusted_thirdpoint = (data.slice(thirdpoint)[0].gdp/1000 + data.slice(thirdpoint)[0]["Adjusted Real GDP 2016 $"]/1000)/2

      // TRANSITION THE CHART

      d3.select(".line").transition()
        .attr("d", function(d) {
          return valueline(data)
        })

      d3.select(".last-circle").transition()
      .attr("cy", function(d){
        return y(data.slice(-1)[0].gdp/1000)
      })

      d3.select(".adjustable_area").transition()
      .attr("d", adjustable_area);

      d3.select(".swoopy-label").transition()
      .attr("transform", function(){
        return "translate(" + x(data.slice(thirdpoint)[0].date) + "," + y(adjusted_thirdpoint)+ ")"
      })



      // TRANSITION THE LABELS ON CHART

      var label = d3.select(".updated-label").transition()
      .attr("transform", function(d) {
        if (ww > 600) {
          return "translate(" + (width+10) + "," + y(finalGDP) + ")"
        } else {
          return "translate(" + (width-165) + "," + y(finalGDP) + ")"
        }
        // .attr("transform", "translate(" + (width-200) + "," + y(data.slice(6)[0].gdp/1000) + ")")
      })

      label.select("text.dollar")
      .text(function(){
          return "GDP of " +d3.format("$.1f")(+finalGDP) + "T"
      });

      label.select("text.growth")
      .text(function(){
          return fmtFixedPrc2(avgGrowth) +" GROWTH"
      });


      // TRANSITION THE TEXT ON RIGHT BAR
      if (immigrants == 0 && (scenario == "slide" || scenario == "under-status-quo")) {
        scenario = "zero"
      }

      if (ww > 600) {
        d3.select(".outcome1 .situation p").html(scenarios1[scenario] + "...")
        d3.select(".outcome2 .situation p").html(scenarios2[scenario])
      } else {
        d3.select(".outcome2 .situation p").html(scenarios1[scenario] + ", "+ lowercaseFmt(scenarios2[scenario]))
      }
      
      
      
      d3.select(".swoopy-text").html(cumulative_scenarios[scenario])

      var outcome = d3.select(".outcome2").transition()
      // var GDPdiff = d3.format("$.2f")(Math.abs(+finalGDP- +orgGDP)) + " trillion"


      outcome.select(".avg-growth").text(function() {
        return fmtFixedPrc(avgGrowth)
      })

      d3.selectAll(".cumulative-num").text(function(){
          return d3.format("$.1f")(Math.abs(cumulativeDiff/1000))+ " trillion"
      });


      d3.select(".num-imm").text(function(d){
        return formatFixed(d3.format(".1f")(immigrants)) + " million"
      })
        



  }


  vis.draw = function(data,immigrants) {

    vis.processData(data, immigrants, "status-quo")
    // TEXT ON RIGHT BAR SECTION
    var outcome1 = d3.select(".outcome1")
    var outcome2 = d3.select(".outcome2")
    outcome1.append("div").attr("class","situation").append("p").html(scenarios1['status-quo']+ "...")
    outcome2.append("div").attr("class","situation").append("p").html(scenarios2['status-quo'])
    // d3.select(".num-gdp").text(d3.format("$.2f")(finalGDP) + " billion")
    d3.select(".avg-growth").text(fmtFixedPrc(avgGrowth));


    // CHART SECTION


    if (ww > 1000) {
      tickVals = [15, 20, 25, 30, 35]
      var margin = {top: 10, right: 0, bottom: 20, left: 30};
      width = 470 - margin.left - margin.right;
      height = 400 - margin.top - margin.bottom;

    } else if (ww > 600 && ww < 1000) {
      tickVals = [15, 20, 25, 30, 35]
      var margin = {top: 20, right: 80, bottom: 20, left: 30};
      width = 520 - margin.left - margin.right;
      height = 480 - margin.top - margin.bottom;

    } else {
      tickVals = [15, 25, 30]
      var margin = {top: 10, right: 30, bottom: 0, left: 30};
      width = ww - margin.left - margin.right;
      height = ww - margin.top - margin.bottom;
    }



    x = d3.scaleTime().range([0, width]);
    y = d3.scaleLinear().range([height, 0]);

    function make_x_gridlines() {
        return d3.axisBottom(x).ticks(15)
    }

    function make_y_gridlines() {
        return d3.axisLeft(y)
        .tickSize(-width - margin.left - margin.right)
        .tickValues([15, 20, 25, 30, 35])
    }

    var xAxis = d3.axisBottom(x)
      .tickValues([parseDate("2017"), parseDate("2020"), parseDate("2025"), parseDate("2030")]);

    var yAxis = d3.axisLeft(y)
        .tickSize(-width - margin.left - margin.right)
        .tickValues(tickVals)
        .tickFormat(function(d) { 
          if (ww < 600) {
            return d3.format("$.2s")(d*1000000).replace('M', 'T');
          } else {
            return d3.format(".2")(d); 
          }
          
        });

  

    valueline = d3.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.gdp/1000); });

    current_levels_line = d3.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d["Adjusted Real GDP 2016 $"]/1000); });

    three_percent_line = d3.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d["3 Percent Growth GDP"]/1000); });

    four_percent_line = d3.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d["4 Percent Growth GDP"]/1000); });

    var three_percent_area = d3.area()
      .x(function(d) { return x(d.date); })
      .y1(function(d) { return y(d["3 Percent Growth GDP"]/1000); })
      .y0(function(d) { return y(d["Adjusted Real GDP 2016 $"]/1000); });

    var four_percent_area = d3.area()
      .x(function(d) { return x(d.date); })
      .y1(function(d) { return y(d["4 Percent Growth GDP"]/1000); })
      .y0(function(d) { return y(d["3 Percent Growth GDP"]/1000); });

    adjustable_area = d3.area()
      .x(function(d) { return x(d.date); })
      .y1(function(d) { return y(d.gdp/1000); })
      .y0(function(d) { return y(d["Adjusted Real GDP 2016 $"]/1000); });

    var chart = d3.select("#chart")
    var svg = chart.append("div").attr("class","linechart")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height+ margin.top + margin.bottom))
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("fill","none")
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    // var dataMax = d3.max(data, function(d) { return d.gdp/1000; })

    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([15, 35]);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);


    svg.append("g")
      .attr("class", "grid")
      .attr("transform", "translate(0," + height + ")")
      .call(make_x_gridlines()
        .tickSize(-height)
        .tickFormat("")
      )

    svg.append("g")
      .attr("class", "grid")
      .call(make_y_gridlines()
        .tickSize(-width)
        .tickFormat("")
      )
    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

    d3.selectAll(".y.axis .tick")
    .each(function (d, i) {
        if(d == 35) {
          var tick35 = d3.select(this)
          tick35.append("rect").attr("width","75").attr("height","13").attr("x","-70").attr("y","-10")
          tick35.select("text").html("")
          tick35.attr("transform","translate(39,5)").append("text").text("$35 trillion")
        }
    });

    svg.append("path")
      .attr("class", "adjustable-path")
      .attr("d", current_levels_line(data))
      .attr("stroke", "#cecece")
      .attr("stroke-width", "2")


    svg.append("path")
      .attr("class", "alt-area adjustable_area")
      .datum(data)
      .attr("d", adjustable_area);

    svg.append("path")
      .attr("class", "alt-path")
      .attr("d", three_percent_line(data))

    svg.append("path")
      .attr("class", "alt-path")
      .attr("d", four_percent_line(data))


    svg.append("circle")
      .attr("class", "circle current-path")
      .attr("r", 6)
      .attr("cy", function(d){
        return y(data.slice(0,1)[0].gdp/1000)
      })
      .attr("cx", function(){
        return x(data.slice(0,1)[0].date)
      })

    svg.append("circle")
      .attr("class", "circle last-circle current-path")
      .attr("r", 6)
      .attr("cy", function(d){
        return y(data.slice(-1)[0].gdp/1000)
      })
      .attr("cx", function(){
        return x(data.slice(-1)[0].date)
      })

    svg.append("path")
      .attr("class", "line current-path")
      .attr("d", valueline(data))
      .attr("stroke-width", "4")



    // LABELS ON CHART SECTION
    midpoint = Math.round(data.length/2)
    thirdpoint = Math.round(data.length/2.5)

    var swoopyLabel = svg.append("g").attr("transform", "translate(" + x(data.slice(thirdpoint)[0].date) + "," + y(data.slice(thirdpoint)[0].gdp/1000) + ")")
      .attr("class","swoopy-label")
    swoopyLabel.append("path")
      .attr("class","swoopy-arrow")
      .attr("d",arrow)
      .attr("stroke-width", "1")
    swoopyLabel.append("text")
      .attr("transform", "translate(40,80)")
      .attr("class","swoopy-text")
      .html()


    var orgLabel = svg.append("g").attr("class","org-label").classed("label",true)
    var updatedLabel = svg.append("g").attr("class","updated-label").classed("label",true)

    if (ww < 600) {
      updatedLabel.append("path").attr("d","M99.4,44.4H12c-6.6,0-12-5.4-12-12V12C0,5.4,5.4,0,12,0h87.4c3.3,0,22.4,0,22.4,0s-10,6-10.4,12v20.4 C111.4,39,106,44.4,99.4,44.4z")
      .attr("transform","translate(10,-5) scale(1.2)")
    }

    var gdpLabel = updatedLabel.append("text")
      .attr("class","dollar")
      .attr("dy", "2em")
      .attr("text-anchor", "start")
      gdpLabel.text(function(){
        return "GDP of " +d3.format("$.1f")(data.slice(-1)[0].gdp/1000) + "T"
      });

    var growthLabel = updatedLabel.append("text")
      .attr("class","growth")
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      growthLabel.text(function(){
        return d3.format(".1%")(avgGrowth)+" GROWTH"
      });

    if (ww > 600) {

      orgLabel.attr("transform", "translate(" + x(data.slice(midpoint)[0].date) + "," + y(data.slice(midpoint)[0].gdp/1000) + ")")
      orgLabel.append("text")
        .attr("dy", ".35em").attr("class","cur-label").attr("text-anchor", "start").text("CURRENT LEVELS")
        .attr("transform", "rotate(-13),translate(12,14)");
      orgLabel.append("text")
        .attr("dy", ".35em").attr("class","alt-label").attr("text-anchor", "start").text("3% GROWTH")
        .attr("transform", "rotate(-22),translate(20,-16)" );
      orgLabel.append("text")
        .attr("dy", ".35em").attr("class","alt-label").attr("text-anchor", "start").text("4% GROWTH")
        .attr("transform","rotate(-30),translate(35,-45)");

      updatedLabel.attr("transform", "translate(" + (width+10) + "," + y(data.slice(-1)[0].gdp/1000) + ")")

    } else {
      orgLabel.attr("transform", "translate(" + width + ",0)")
      orgLabel.append("text").text("2%").attr("transform","translate(10,"+y(24.5)+")").attr("class","org-label-2")
      orgLabel.append("text").text("3%").attr("transform","translate(10,"+y(28)+")");
      orgLabel.append("text").text("4%").attr("transform","translate(10,"+y(32.5)+")");
      updatedLabel.attr("transform", "translate(" + (width-165) + "," + y(data.slice(-1)[0].gdp/1000) + ")")

      growthLabel.attr("transform", "translate(25,12)")
      gdpLabel.attr("transform", "translate(25,9)")

    }




    var buttons;

    // BUTTON SECTION
    if (ww > 600) {
      buttons = d3.select("#buttons")
    } else {
      buttons = d3.select("#buttons-mobile")
    }

    buttons.append("h3").text("See what happens if the U.S. were to:")
    var buttonText = buttons.append("div")
    buttonText.append("div").attr("id","deport")
    .on('click',function(d) {
      if ($("#chart").hasClass("deport-scenario")) {
        vis.resetButton(data)
      } else {
        vis.processData(data, immigrants, "deport")
        vis.activate("deport")
      }
    })
    .text("Deport all unauthorized immigrants")

    buttonText.append("div").attr("id","legalize")
    .on('click',function(d) {
      if ($("#chart").hasClass("legalize-scenario")) {
        vis.resetButton(data)
      } else {
        vis.processData(data, immigrants, "legalize")
        vis.activate("legalize")
      }

    })
    .text("Legalize all unauthorized immigrants")


    // SLIDER SECTION
    vis.theSlider(data);



  }


  vis.processData = function(data, immigrants, scenario) {

      data.forEach(function(d) {
        d.year = +d["Year"];
        d.date = parseDate(d["Year"]);
        var prevYear = d.year -1
        pd[d.year] = {};

      if (scenario == "slide" || scenario == "under-status-quo") {

          pd[d.year]["immigrants"] = immigrants*1000000;
          pd[d.year]["date"] = parseDate(d["Year"]);
          pd[d.year]["gdp"] = +d["GDP with Zero Immigrants"];


          if (pd[prevYear]) {
            pd[d.year]["old_growth"] = (pd[d.year]["gdp"] - pd[prevYear]["gdp"])/pd[prevYear]["gdp"]
          }

          pd[d.year]["pop"] = +d["Population (with zero immigrants)"];
          pd[d.year]["year_index"] = +d["Year Index"];
          pd[d.year]["newpop"] = +pd[d.year]["pop"] + (+pd[d.year]["immigrants"] * +pd[d.year]["year_index"])
          pd[d.year]["imm_percent"] = pd[d.year]["immigrants"]/pd[d.year]["newpop"]
          pd[d.year]["imm_gdp"] = pd[d.year]["imm_percent"]*1.15
          pd[d.year]["new_growth"] = pd[d.year]["old_growth"] + pd[d.year]["imm_gdp"]
          if (pd[prevYear]) {
            pd[d.year]["new_gdp"] = +pd[prevYear]["new_gdp"] + (+pd[prevYear]["new_gdp"] * +pd[d.year]["new_growth"])
          } else {
            pd[d.year]["new_gdp"] = pd[d.year]["gdp"]
          }

          // d.old_growth = pd[d.year]["old_growth"]
          // d.immigrantss = pd[d.year]["immigrants"]
          // d.new_gdp = pd[d.year]["new_gdp"]
          // d.imm_gdp = pd[d.year]["imm_gdp"]
          // d.imm_percent = pd[d.year]["imm_percent"]
          // d.newpop = pd[d.year]["newpop"];
          d.gdp = pd[d.year]["new_gdp"];
          d.diff = +d["Adjusted Real GDP 2016 $"] - pd[d.year]["new_gdp"];
          d.new_growth = pd[d.year]["new_growth"];

      } else if (scenario == "deport") {
          pd[d.year]["gdp"] = +d["Deport Loss"];
          d.diff = +d["Adjusted Real GDP 2016 $"] - +d["Deport Loss"]
          d.gdp = +d["Deport Loss"];
          if (pd[prevYear]) {
            d.new_growth = (d.gdp - pd[prevYear]["gdp"])/pd[prevYear]["gdp"]
          }
      } else if (scenario == "legalize") {
          pd[d.year]["gdp"] = +d["Legalize Gain"];
          d.diff = +d["Legalize Gain"] - +d["Adjusted Real GDP 2016 $"]
          d.gdp = +d["Legalize Gain"];
          if (pd[prevYear]) {
            d.new_growth = (d.gdp - pd[prevYear]["gdp"])/pd[prevYear]["gdp"]
          }

      } else if (scenario == "status-quo") {
          immigrants = 0;
          pd[d.year]["immigrants"] = immigrants*1000000;
          pd[d.year]["date"] = parseDate(d["Year"]);
          pd[d.year]["gdp"] = +d["Adjusted Real GDP 2016 $"];

          if (pd[prevYear]) {
            pd[d.year]["old_growth"] = (pd[d.year]["gdp"] - pd[prevYear]["gdp"])/pd[prevYear]["gdp"]
          }

          pd[d.year]["pop"] = +d["Population"];
          pd[d.year]["year_index"] = +d["Year Index"];
          pd[d.year]["newpop"] = +pd[d.year]["pop"] + (+pd[d.year]["immigrants"] * +pd[d.year]["year_index"])
          pd[d.year]["imm_percent"] = pd[d.year]["immigrants"]/pd[d.year]["newpop"]
          pd[d.year]["imm_gdp"] = pd[d.year]["imm_percent"]*1.15
          pd[d.year]["new_growth"] = pd[d.year]["old_growth"] + pd[d.year]["imm_gdp"]
          if (pd[prevYear]) {
            pd[d.year]["new_gdp"] = +pd[prevYear]["new_gdp"] + (+pd[prevYear]["new_gdp"] * +pd[d.year]["new_growth"])
          } else {
            pd[d.year]["new_gdp"] = pd[d.year]["gdp"]
          }

          d.gdp = pd[d.year]["new_gdp"];
          d.new_growth = pd[d.year]["new_growth"];
          d.diff = 0
      }



      });
    cumulativeDiff =  d3.sum(data,function(d) { return d.diff})
    avgGrowth = d3.mean(data,function(d) { return d.new_growth})
    vis.transitionChart(data,immigrants,scenario)

  }


  vis.theSlider = function(data) {

    d3.select("#slider").append("h3").text("Adjust the number of immigrants per year")
    d3.select("#slider").append("p").attr("class","slider-label")


    var margin = {top: 25, left: 0, right: 0, bottom: 0},
      startPoint = 1,
      value = 1,
      sliderVal = d3.select(".situation h3"),
      mwidth = d3.select(".controls").node().offsetWidth,
      newmargin = d3.select(".controls").node().offsetWidth/6,
      margin = {top: 25, left: 0, right: 0, bottom: 0},
      width = mwidth - newmargin,
      height = 110 - margin.top  - margin.bottom,
      sliderTicks, sliderOffset;

    if (ww > 600) {
      sliderTicks = [0, 1, 2.5, 5, 10];
      sliderOffset = 0;
    } else {
      sliderTicks=  [0,1, 10]
      sliderOffset = 0
    }

    var svg = d3.select("#slider").append("div").attr("class","slider-box").append("svg")
      .attr("width",  width)
      .attr("height", height)
      .attr("transform", "translate(" + 0 + ","+sliderOffset+")");


    var pattern = svg.append("defs")
    .append("pattern")
    .attr("id","striped").attr("width",8).attr("height",8).attr("patternUnits","userSpaceOnUse").attr("patternTransform","rotate(50)")
    .append("rect").attr("width",3).attr("height",9).attr("transform","translate(1,0)").attr("fill","#e7e7e7")

    var newx = d3.scaleLinear()
        .domain([0, 10])
        .range([0, width])
        .clamp(true);

    var slider = svg.append("g")
        .attr("class", "slider")
        .attr("transform", "translate(" + newmargin/2 + ",55)");

    slider.append("line")
        .attr("class","slider-desktop")
        .attr("x1", newx.range()[0])
        .attr("x2", newx.range()[1])

    slider.append("line")
      .attr("class","slider-baseline")
      .attr("x1", newx.range()[0])
      .attr("x2", newx.range()[1])

    slider.append("line")
      .attr("class","slider-progress")
      .attr("x1", newx.range()[0])
      .attr("x2", newx(startPoint))
  
    if (ww > 600) {
    slider.append("rect")
      .attr("class","slider-unprecedented")
      .attr("x", newx(2.4))
      .attr("y", -2.2)
      .attr("width", newx.range()[1]-newx(2.4))
      .attr("height", 4.5)
      .attr("fill","url(#striped)")
    }

    
    var sliderTicks = slider.append("g")
      .attr("class", "ticks")
      .attr("transform", "translate(0," + 18 + ")")
      .selectAll(".tick")
      .data(sliderTicks)
      .enter().append("g").attr("class", "tick")
      .attr("transform", function(d){
        return "translate("+newx(d)+",0)"
      })
      .attr("class", function(d){
        return "slidertick-"+Math.round(d)
      })

      sliderTicks.append("text")
        .attr("text-anchor", "middle")
        .text(function(d) { return d ; })
        .attr("transform", "translate(0," + 3 + ")")

      sliderTicks.append("line").attr("y2","-9").attr("y1","-15")

    var handle = slider.append("g").attr("class","handle")
        .attr("transform", "translate("+(newx(value))+",-3)")

    var slider1 = d3.select(".slidertick-1")

    

    var slider2 = d3.select(".slidertick-3")
    slider2.select('text').text(function(){
      return "Historically Unprecedented â†’"
    }).attr("text-anchor", "start")
    slider2.attr("transform", function(d){
        return "translate("+newx(d)+",-30)"
      })
    slider2.select("line").remove()





    if (ww < 600) {
      slider1.select('text').text("Current Levels")
      slider1.attr("transform", function(d){
        return "translate("+newx(d)+",-35)"
      })
      slider1.select('text').attr("transform","translate(0,1)")
      slider1.select('line').attr("y2","15").attr("y1","5").attr("y2","15")

      d3.select(".slidertick-0")
      .select('text').attr("transform","translate(" + -12 + "," + -14 + ")")

      d3.select(".slidertick-10")
      .select('text').attr("transform","translate(" + 15 + "," + -14 + ")")

      handle.append("circle")
        .attr("r", 5)
        .attr("cy", 5)
      handleNum = d3.select(".slider-label").append("span").attr("class","handle-text")
      .text(vis.fmtMil(value))

    } else {
      slider1.select('text').text("Current").attr("transform", "translate(4,3)")

      slider1.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(0,17.5)")
        .text("Levels")

      handle.append("path")
        .attr("d", "M-5.5,-2.5v10l6,5.5l6,-5.5v-10z")
        .attr("stroke", "#666")
      handleNum = handle.append("g")
        .attr("class","handle-num").attr("transform", "translate(" + -43 + "," + -45 + ")")
      handleNum.append("path")
        .attr("d","M80.4,25.4H47.7L43,31.9l-4.8-6.5H5.5c-3,0-5.5-3.1-5.5-7V7c0-3.8,2.4-7,5.5-7h75c3,0,5.5,3.2,5.5,7v11.4 C85.9,22.2,83.4,25.4,80.4,25.4z")
      handleNum.append("text").attr("class","handle-text").text(vis.fmtMil(value)).style("text-anchor", "middle").attr("transform", "translate(43,16)")
      
    }

    if (ww > 600 && ww < 775 ) {
      slider1.select('text').text("Cur.")
    }

       slider.append("line")
        .attr("class","track-overlay")
        .attr("x1", newx.range()[0])
        .attr("x2", newx.range()[1]).attr("transform", "translate(0,-20)")

        .call(d3.drag()
            .on("start.interrupt", function() { slider.interrupt(); })
            .on("end", dragend)
            .on("start drag", function() { brushing(newx.invert(d3.event.x)); }))

    function fmtNum(num) {
      var newnum = parseFloat(Math.round( num * 10) / 10)
      return Math.abs(newnum)
    }


    vis.resetSlider = function() {
        value = 1
        handle.attr("transform", "translate("+(newx(value))+",-3)")
        d3.select(".handle-text").text(vis.fmtMil(value))
        d3.select(".slider-progress").attr("x2",newx(value))
    }

    function dragend() {
      if (ww < 600) {
        d3.select(".handle circle").attr("transform","scale(1) translate(0,-2)")
      } else {
        d3.selectAll(".slider .handle path").attr("fill","#f3dc6b")
      }
    }

    function brushing(val) {
      var tick1 = d3.select(".slidertick-1")
      handle.attr("transform", "translate("+(newx(val))+",-3)")
      d3.select(".slider-progress").attr("x2",newx(val))
      d3.select(".handle-text").text(vis.fmtMil(val))
      vis.activate("slider")

      if (ww < 600) {
        d3.select(".handle circle").attr("transform","scale(2) translate(0,-4)")
      } else {
        d3.selectAll(".slider .handle path").attr("fill","#c7b247")
      }

      if (val > 1.1) {
        tick1.classed("under1",false)
        sliderVal.text(fmtNum(val) +" million immigrants per year")
        vis.processData(data,val,"slide")
      } else if (val < 0.9){
        sliderVal.text(fmtNum(val) +" million immigrants per year")
        vis.processData(data,val,"under-status-quo")
        tick1.classed("under1",true)
      } else {
        tick1.classed("under1",false)
        vis.processData(data,val,"status-quo")
      }

    }

    brushing(value);
    d3.select(".handle circle").attr("transform","scale(1) translate(0,-2)")
    d3.selectAll(".slider .handle path").attr("fill","#f3dc6b")

  }




})();
