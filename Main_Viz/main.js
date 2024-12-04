d3.csv('Spotify_Youtube.csv', function(datum){


    datum.forEach(d => {
        d.Stream = +d.Stream;
    });

    var xLow = 0;
    var xHigh = 1;
    var xValue = "Danceability"

    var xScale = d3.scaleLinear().domain([xLow, xHigh]).range([50, 1500])

    // Button
    var options = ["Danceability", "Energy", "Loudness", "Speechiness", "Acousticness", "Instrumentalness", "Liveness", "Tempo"]


    var dropSelect = d3.select("#scatplot")
        .append('select')

    dropSelect.selectAll('myOptions')
        .data(options)
        .enter()
        .append('option')
        .text(function (d) {return d; })
        .attr("value", function (d) {return d;})
    
    dropSelect.on("change", function(d) {

        // recover the option that has been chosen
        var selectedOption = d3.select(this).property("value")

    
        
        // run the updateChart function with this selected option
        updateChart(selectedOption)

    })

    function updateChart(selectedOption) {
        if (selectedOption == "Tempo") {
            xLow = 0
            xHigh = 250
            xValue = selectedOption
        } else if (selectedOption == "Loudness") {
            xLow = -50.0
            xHigh = 1.0
            xValue = selectedOption
        } else {
            xLow = 0
            xHigh = 1.0
            xValue = selectedOption
        }

        xScale = d3.scaleLinear().domain([xLow, xHigh]).range([50, 1500])
        console.log(typeof selectedOption)
        
        scatplot
            .selectAll('circle')
            .data(filteredData)
            .enter()
            .append('circle')
            .attr('cx', d => xScale(d[xValue]) + 70)
            .attr('cy', d => yScale(d.Stream) - 5)
            .attr('r', d => rScale(d.Views))
            .style('stroke', 'black')
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
    }

    /******************************************
    Filtering data because it was too large! (It crashed my browser...)
     - Allows for top 2 albums based on Spotify Streams per Artist
    ******************************************/

    const groupArtists = d3.group(datum, d => d.Artist);
    const filteredData = Array.from(groupArtists, ([artist, albums]) =>
        albums
            .sort((a, b) => b.Stream - a.Stream)
            .slice(0,2)
        ).flat();


    console.log(filteredData);

    var maxStream = d3.max(datum, function(d){return +d['Stream'];});
    var maxViews = d3.max(datum, function(d){return +d['Views'];});

    // var xScale = d3.scaleLinear().domain([xLow, xHigh]).range([50, 1500]) // Views Range
    var yScale = d3.scalePow().domain([maxStream, 1]).range([50, 700]).exponent(.4) // Streams Range

    var rScale = d3.scaleSqrt().domain([0, maxViews]).range([2, 15]) //Radius Range

    var xAxis = d3.axisBottom(xScale).ticks(10);
    var yAxis = d3.axisLeft(yScale);

    var svg = d3.select('svg');

    

    // Scatterplot Setup

    var scatplot = d3
        .select("#scatplot")
        .append("svg:svg")
        .attr("id", "svg1")
        .attr("width", 1600)
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
            tooltip
              .style("opacity", 1)
            d3.select(this)
              .style("stroke", "black")
              .style("opacity", 1)
          }
    
    var mousemove = function(d) {
        tooltip
              .html("Song: " + d.Track + "<br>Artist: " + d.Artist + "<br>Album: " + d.Album + "<br>Total Streams on Spotify: " + d.Stream + "<br>Total Views on Youtube: " + d.Views)
              .style('left', (event.pageX + 10) + 'px') // Adjusted to follow cursor
              .style('top', (event.pageY + 10) + 'px');
        console.log('hovering');
          }
    
    var mouseleave = function(d) {
            tooltip
              .style("opacity", 0)
            d3.select(this)
              .style("stroke", "none")
              .style("opacity", 0.8)
          }
    
    
    

})
