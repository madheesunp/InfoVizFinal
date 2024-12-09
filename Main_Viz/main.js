d3.csv('Spotify_Youtube.csv', function(datum){

    // Making sure that data values are numerical!

    datum.forEach(d => {
        d.Stream = +d.Stream;
        d.Views = +d.Views;
        d.Danceability = +d.Danceability;
        d.Energy = +d.Energy;
        d.Speechiness = +d.Speechiness;
        d.Acousticness = +d.Acousticness;
        d.Instrumentalness = +d.Instrumentalness;
        d.Liveness = +d.Liveness;
    });

    
    
    /******************************************
    Filtering data because it was too large! (It crashed my browser...)
     - Allows for top 2 albums based on Spotify Streams per Artist
    ******************************************/

    const groupArtists = d3.group(datum, d => d.Artist);
    const filteredData = Array.from(groupArtists, ([artist, albums]) =>
        albums
            .sort((a, b) => b.Stream - a.Stream)[0]
        ).flat();

    console.log(filteredData);

    var xValue = "Danceability"
    let currentPoint = datum[0]; // Variable for selected data

     /******************************************
      * Setting up Axis
    ******************************************/
    
    var maxStream = d3.max(datum, function(d){return +d['Stream'];});
    var maxViews = d3.max(datum, function(d){return +d['Views'];});

    var yScale = d3.scaleLinear().domain([maxStream, 1]).range([50, 700])// Streams Range
    var xScale = d3.scaleLinear().domain([0.0, 1.0]).range([50, 1300]) // Option Scale
    var rScale = d3.scalePow().domain([0, maxViews]).range([2, 15]).exponent(.4) //Radius Range

    var xAxis = d3.axisBottom(xScale).ticks(10);
    var yAxis = d3.axisLeft(yScale);

    var svg = d3.select('svg');

    

    // Scatterplot Setup

    var scatplot = d3
        .select("#scatplot")
        .append("svg:svg")
        .attr("id", "svg1")
        .attr("width", 1400)
        .attr("height", 800)
        .attr("stroke", 10)
    
    scatplot
        .append('g')
        .attr('transform', 'translate(70, 700)')
        .call(xAxis)
    
    scatplot
        .append('g')
        .attr('transform', 'translate(100, 0)')
        .call(yAxis)

    scatplot.append("text")
        .attr("class", "y-axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -800 / 2)
        .attr("y", 15)
        .text("Stream Count");
    
    
    var tooltip = d3.select('#scatplot')
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
    
    var mouseover = function(d) {
        currentPoint = d;
            tooltip
              .style("opacity", 1)
            d3.select(this)
              .style("stroke", "black")
              .style("stroke-width", 2)
              .style("opacity", 1)
        updateBarplot(currentPoint);
    }
    
    var mousemove = function(d) {
        tooltip
              .html("Song: " + d.Track + "<br>Artist: " + d.Artist + "<br>Album: " + d.Album + "<br>Total Streams on Spotify: " + d.Stream + "<br>Total Views on Youtube: " + d.Views)
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY + 10) + 'px');

        console.log(currentPoint)
    }
    
    var mouseleave = function(d) {
            tooltip
              .style("opacity", 0)
            d3.select(this)
              .style("stroke", "none")
              .style("opacity", 1)
    }

     /******************************************
      * Updates Scatter Plot
    ******************************************/
    
    function updateChart() {
        var circles = scatplot.selectAll('circle')
            .data(filteredData);
    
        circles.enter()
            .append('circle')
            .merge(circles)
            .attr("class", "circ")
            .attr('cx', d => xScale(d[xValue]) + 70)
            .attr('cy', d => yScale(d.Stream) - 5)
            .attr('r', d => rScale(d.Views))
            .style('opacity', .8)
            .style('stroke', 'none')
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            .merge(circles)
            .transition()
            .duration(1600)
            .attr('cx', d => xScale(d[xValue]) + 70)
            .attr('cy', d => yScale(d.Stream) - 5)
            .attr('r', d => rScale(d.Views));
        
        circles.exit()
            .transition()
            .duration(1600)
            .style('opacity', 0)
            .remove();
    

    }

    updateChart();

    // Button
    var options = ["Danceability", "Energy", "Speechiness", "Acousticness", "Instrumentalness", "Liveness"]


    var dropSelect = d3.select("#scatplot")
        .append('select')
        .attr('id', 'dropdown')

    dropSelect.selectAll('myOptions')
        .data(options)
        .enter()
        .append('option')
        .text(function (d) {return d; })
        .attr("value", function (d) {return d;})
    
    dropSelect.on("change", function() {
        xValue = d3.select(this).property("value");

        updateChart();
    });


    const formattedData = options.map(option => ({
        option: option,
        value: +currentPoint[option]
    }));
    
    var x2Scale = d3.scaleBand().range([50,450]).padding(0.2)
    var y2Scale = d3.scaleLinear().domain([1.0, 0.0]).range([50, 450])

    var x2Axis = d3.axisBottom(x2Scale);
    var y2Axis = d3.axisLeft(y2Scale);

    var barplot = d3
        .select('#barplot')
        .append("svg:svg")
        .attr("id", "svg2")
        .attr("width", 500)
        .attr("height", 500)

    barplot.append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(10, 450)')
        .call(x2Axis)
    
    barplot.append('g')
        .attr('class', 'y-axis')
        .attr('transform', 'translate(50, 0)')
        .call(y2Axis)
    
    /******************************************
      * Updates Bar Plot
    ******************************************/

    function updateBarplot(dataPoint) {
        const updatedData = options.map(option => ({
            option: option,
            value: +dataPoint[option]
        }));

        x2Scale.domain(updatedData.map (d => d.option));

        barplot.select(".x-axis")
            .call(x2Axis)
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");
        
        const bars = barplot.selectAll('rect').data(updatedData);

        bars.enter()
            .append("rect")
            .merge(bars)
            .transition()
            .duration(500)
            .attr('x', d => x2Scale(d.option) + 10)
            .attr("class", "bars")
            .attr('y', d => y2Scale(d.value))
            .attr('width', x2Scale.bandwidth())
            .attr('height', d => 450 - y2Scale(d.value))
            .attr('fill', '#69b3a2');

        bars.exit()
            .transition()
            .duration(500)
            .attr("height", 0)
            .remove();
        
        var textDesc = barplot.selectAll(".description-text")
            .data([dataPoint]);
        
        textDesc.enter()
            .append("text")
            .attr("class", "description-text")
            .attr("text-anchor", "left")
            .attr("x", 10)
            .attr("y", 20) // Position the text appropriately
            .merge(textDesc) // Update existing element
            .text(d => "You're currently stats for: " + d.Track + " by " + d.Artist);

    }

    updateBarplot(currentPoint);


})
