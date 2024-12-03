d3.csv('Spotify_Youtube.csv').then(function(datum){
    // console.log(datum[0]["Url_spotify"]);

    var maxStream = d3.max(datum, function(d){return +d['Stream'];});

    var xScale = d3.scaleLinear().domain([0, 1]).range([50, 900]) // Dancebility Range
    var yScale = d3.scaleLinear().domain([0, maxStream]).range([50, 900]) // Streams Range

    var xAxis = d3.axisBottom(xScale).ticks(10);
    var yAxis = d3.axisLeft(yScale);

    var svg = d3.select('svg');
    
    svg.append('g')
        .attr('class','x axis')
        .attr('transform', 'translate(80, 900)')
        .call(xAxis);

    svg.append('g')
        .attr('class','y axis')
        .attr('transform', 'translate(100, 0)')
        .call(yAxis);

})
