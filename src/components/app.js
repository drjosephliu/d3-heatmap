import React, { Component } from 'react';
import * as d3 from 'd3';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      base: null,
      data: []
    };
    this.fetchData();
    this.createHeatmap = this.createHeatmap.bind(this);
  }

  fetchData() {
    const API = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json';

    d3.json(API, (error, data) => {
      this.setState({
        base: data.baseTemperature,
        data: data.monthlyVariance
      }, this.createHeatmap)
    });
  }

  createHeatmap() {
    const { base, data } = this.state;

    const w = 900;
    const h = 550;

    const margin = {
      top: 30,
      right: 50,
      bottom: 120,
      left: 80
    };

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const colors = ["#5e4fa2", "#3288bd", "#66c2a5", "#abdda4", "#e6f598", "#ffffbf", "#fee08b", "#fdae61", "#f46d43", "#d53e4f", "#9e0142"];

    const legendBox = 35;

    const rectHeight = (h - margin.top - margin.bottom) / months.length;

    const svg = d3.select('.chart')
                  .append('svg')
                  .attr('width', w)
                  .attr('height', h);

    const div = d3.select('body')
                  .append('div')
                  .attr('class', 'tooltip')
                  .style('opacity', 0);

    const minYear = d3.min(data, d => { return d.year });

    const minDate = new Date(minYear, 0);

    const maxYear = d3.max(data, d => { return d.year });

    const maxDate = new Date(maxYear, 0);

    const rectWidth = (w - margin.left - margin.right) / (maxYear - minYear + 1);

    const xScale = d3.scaleTime()
                     .domain([minDate, maxDate])
                     .range([margin.left, w - margin.right]);



    const monthLabels = svg.selectAll('.monthLabel')
                           .data(months)
                           .enter()
                           .append('text')
                           .text(d => { return d })
                           .attr('x', margin.left)
                           .attr('y', (d, i) => {
                             return (i * rectHeight) + (rectHeight / 2);
                           })
                           .attr('transform', `translate(0, ${margin.top})`)
                           .style('text-anchor', 'end')
                           .attr('class', 'monthlabel');
    const minVariance = d3.min(data, d => {
      return d.variance;
    });

    const maxVariance = d3.max(data, d => {
      return d.variance;
    });

    const colorScale = d3.scaleQuantile()
                         .domain([minVariance + base, maxVariance + base])
                         .range(colors);

    const xAxis = d3.axisBottom(xScale);

    svg.append('g')
       .attr('class', 'axis')
       .attr('transform', `translate(0, ${h - margin.bottom})`)
       .call(xAxis);

    svg.append('text')
       .attr('x', w / 2)
       .attr('y', h - margin.bottom / 1.5)
       .attr('class', 'axislabel')
       .style('text-anchor', 'middle')
       .text('Years');

    svg.append('text')
       .attr('x', -((h - margin.bottom) / 2))
       .attr('y', margin.left / 2)
       .attr('transform', 'rotate(-90)')
       .attr('class', 'axislabel')
       .style('text-anchor', 'middle')
       .text('Months');

    svg.selectAll('rect')
       .data(data)
       .enter()
       .append('rect')
       .attr('x', d => { return xScale(new Date(d.year, 0)) })
       .attr('y', d => {
         return (d.month - 1) * rectHeight + margin.top;
       })
       .attr('width', rectWidth)
       .attr('height', d => { return rectHeight })
       .attr('fill', d => { return `${colorScale(d.variance + base)}`})
       .on('mouseover', function(d) {
         const divWidth = document.querySelector('.tooltip').offsetWidth;

         const month = months[d.month - 1];
         const temp = d.variance + base;

         div.style('opacity', 0.9)
            .html(`<strong>${d.year} - ${month}<br>${temp}°C</strong><br>${d.variance}°C`)
            .style('left', `${d3.event.pageX + (divWidth / 8)}px`)
            .style('top', `${d3.event.pageY}px`);
       })
       .on('mouseout', function(d) {
         div.style('opacity', 0);
       });

    const colorQuantiles = [0].concat(colorScale.quantiles());

    const legend = svg.selectAll('.legend')
                      .data(colorQuantiles)
                      .enter()
                      .append('g')
                      .attr('class', 'legend');

    legend.append('rect')
          .attr('x', (d, i) => {
            return legendBox * i + (w - legendBox * colors.length - margin.right);
          })
          .attr('y', h - (margin.bottom / 2))
          .attr('width', legendBox)
          .attr('height', rectHeight / 2)
          .style('fill', (d, i) => {
            return colors[i]
          });

    legend.append('text')
          .attr('class', 'scales')
          .text((d, i) => { return Math.floor(colorQuantiles[i] * 10) / 10 })
          .attr('x', (d, i) => {
            return (legendBox * i) + (w - (legendBox * colors.length) - margin.right) + 10;
          })
          .attr('y', h - (margin.bottom / 2) + rectHeight);


  }

  render() {
    return(
      <div className='card'>
        <div className='title'>
          Monthly Global Land-Surface Temperature
        </div>
        <div className='subtitle'>
          1753 - 2015
        </div>
        <div className='details'>
          Temperatures are in Celsius and reported as anomalies relative to the Jan 1951-Dec 1980 average.
        </div>
        <div className='details'>
          Estimated Jan 1951-Dec 1980 absolute temperature ℃: 8.66 +/- 0.07
        </div>
        <div className='chart'></div>
      </div>

    )
  }
}
