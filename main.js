import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const container = document.querySelector("#container")

const URL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"

async function dataFetch(){
    try{
        const response = await fetch(URL)
        const data = await response.json()
        scatterPlot(data)
    }catch(e){
        console.error(e)
    }
}

dataFetch()

function checkAlleged(doping){
    return doping.includes("Alleged") 
}

function scatterPlot(data){
    const width = 800
    const height = 500
    const margin = {top: 40, bottom: 40, left: 80, right: 20}

    const parseTime = d3.timeParse("%M:%S");
    data.forEach(d => {
        d.Time = parseTime(d.Time);
        
    });

    const x = d3.scaleLinear()
            .domain([d3.min(data, d => d.Year) - 1, d3.max(data, d => d.Year) + 1])
            .range([margin.left, width - margin.right])

    const y = d3.scaleLinear()
                .domain([d3.min(data, d => d.Time), d3.max(data, d => d.Time)])
                .range([height - margin.bottom, margin.top])

    const svg = d3.create("svg")
                .attr("width", width)
                .attr("height", height)

    const tooltip = d3.select("body")
                    .append("div")
                    .style("position", "absolute")
                    .attr("id", "tooltip")
                    
                    .style("background-color", "rgba(34, 34, 56, 0.9)")
                    .style("color", "white")
                    .style("padding", "1rem")
                    .style("border-radius", "10px")
                    .style("pointer-events", "none")
                    .style("opacity", 0)
                    
    
    const formatTime = d3.timeFormat("%M:%S");
    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.Year))
        .attr("cy", d => y(d.Time))
        .attr("r", 5)
        .attr("data-xvalue", d => d.Year)
        .attr("data-yvalue", d => d.Time.toUTCString())
        .attr("fill", d => checkAlleged( d.Doping) ? "orange": "blue")

    
    svg.selectAll(".dot")
        .on("mouseenter", (e, d) => {
            tooltip
            .style("opacity", 1)
            .html(`${d.Doping} <br> ${d.Year} ${formatTime(d.Time)} <br> ${d.Name} ${d.Nationality}`)
            .style("left", (e.pageX + 20) + "px")
            .style("top", (e.pageY + 20) + "px")
            .attr("data-year", d.Year)
        })
        .on("mouseleave", () => {
            tooltip.style("opacity", 0)
        })

    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .attr("id", "x-axis")
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));  

    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .attr("id", "y-axis")
        .call(d3.axisLeft(y).tickFormat(formatTime));

    svg.append("g")
        .attr("id", "legend")
    
    svg.select("#legend")
        .append("g")
        .attr("class", "alleged")
        .attr("transform", `translate(${width - margin.right * 2}, ${height - margin.bottom * 2 - 10})`)

    svg.select(".alleged")
        .append("rect")
        .style("fill", "blue")
        .attr("width", 20)
        .attr("height", 20)

    svg.select(".alleged")
        .append("text")
        .text("No doping allegations")
        .attr("x", -width / 5)
        .attr("y", 15)
        
    svg.select("#legend")
        .append("g")
        .attr("class", "not-alleged")
        .attr("transform", `translate(${width - margin.right * 2}, ${height - margin.bottom * 2 + 10 })`)
  
    svg.select(".not-alleged")
        .append("text")
        .text("Riders with doping allegations")
        .attr("x", -width / 4)
        .attr("y", 10)
    
     svg.select(".not-alleged")
        .append("rect")
        .style("fill", "orange")
        .attr("width", 20)
        .attr("height", 20)

    
        
    container.appendChild(svg.node())
}
