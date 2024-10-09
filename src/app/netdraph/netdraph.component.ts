import { transition } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import * as d3 from 'd3';
import { color, selectAll } from 'd3';
import { SimulationNodeDatum, drag, scaleOrdinal, schemeCategory10 } from 'd3';
import e from 'express';
import { delay } from 'rxjs';

@Component({
  selector: 'app-netdraph',
  standalone: true,
  imports: [],
  templateUrl: './netdraph.component.html',
  styleUrl: './netdraph.component.scss'
})
export class NetdraphComponent implements OnInit {





  private nodes = [
    { index: 0, name: '', group: 0 },
    { index: 1, name: 'Fruit', group: 1 },
    { index: 2, name: 'Vegetable', group: 2 },
    { index: 3, name: 'Orange', group: 1 },
    { index: 4, name: 'Apple', group: 1 },
    { index: 5, name: 'Banana', group: 1 },
    { index: 6, name: 'Peach', group: 1 },
    { index: 7, name: 'Bean', group: 2 },
    { index: 8, name: 'Pea', group: 2 },
    { index: 9, name: 'Carrot', group: 2 },
  ];
  private links = [
    { source: this.nodes[0], target: this.nodes[1] },
    { source: this.nodes[0], target: this.nodes[2] },
    { source: this.nodes[1], target: this.nodes[3] },
    { source: this.nodes[1], target: this.nodes[4] },
    { source: this.nodes[1], target: this.nodes[5] },
    { source: this.nodes[1], target: this.nodes[6] },
    { source: this.nodes[2], target: this.nodes[7] },
    { source: this.nodes[2], target: this.nodes[8] },
    { source: this.nodes[2], target: this.nodes[9] },
  ];
  private color = d3.scaleOrdinal(d3.schemeCategory10);

  private svg: any;
  private margin = 50;
  private width = 1200 - (this.margin * 2);
  private height = 900 - (this.margin * 2);


  private createSvg(): void {
    this.svg = d3.select("figure#netgraph")
      .append("svg")
      .attr("width", this.width + (this.margin * 2))
      .attr("height", this.height + (this.margin * 2))
      .append("g");

  }


  ngOnInit(): void {

    this.createSvg();

    var simulation = d3
      .forceSimulation(this.nodes)
      .force("charge", d3.forceManyBody().strength(-2500))
      .force("center", d3.forceCenter(this.width / 2, this.height / 2))
      .force("link", d3.forceLink(this.links))
      .on("tick", ticked);

    var links = this.svg
      .append("g")
      .selectAll("line")
      .data(this.links)
      .enter()
      .append("line")
      //.attr("stroke-width", 6)
      .attr("stroke-width", (d: { i: number; }) => Math.sqrt(d.i * 24))
      .style("stroke", "orange")

      ;

    // var ticks = Scrubber(d3.range(10), {
    //   autoplay: false,
    //   loop: false,
    //   alternate: true,
    //   initial: 5
    // })

    var nodes = this.svg
      .append("g")
      .selectAll("circle")
      .data(this.nodes)
      .enter()
      .append("circle")
      .attr("r", 40)
      //this stroke down here is the circle border
      .style("stroke", "yellow")
      .style("stroke-width", "3")
      .attr("fill", (d: any, i: number) => d3.schemeCategory10[i % 10])
    //.attr("fill", (d: any, i: number) => d3.schemeCategory10[d.group]) 
    //u can use this to color same color according to the groups.
    //  for rectangle
    //     var nodes = this.svg
    //       .append("g")
    //       .selectAll("rect")
    //       .data(this.nodes)
    //       .enter().append('rect')
    //       .attr('width', 50)
    //       .attr('height', 30)
    //       .attr("fill", (d: any, i: number) => d3.schemeCategory10[i % 10])
    //       .attr('rx', 6)  // Rounded corners
    //       .attr('ry', 6)  // Rounded corners

    var drag = d3
      .drag()
      .on('start', (e, d) => dragstarted(e, <SimulationNodeDatum>d))
      .on('drag', (e, d) => dragged(e, <SimulationNodeDatum>d))
      .on('end', (e, d) => dragended(e, <SimulationNodeDatum>d));

    // var drag = d3
    //   .drag()
    //   .on('start', (e, d) => dragstarted(e, d))
    //   .on('drag', (e, d) => dragged(e, d))
    //   .on('end', (e, d) => dragended(e, d));

    var text = this.svg
      .append("g")
      .selectAll("text")
      .data(this.nodes)
      .enter()
      .append("text")
      //.attr("fill", (d: any, i: number) => d3.schemeCategory10[i % 10])
      //colouring the text with different colours
      .style("stroke", (d: any, i: number) => d3.schemeCategory10[i % 35])
      // .style("stroke", "green")
      .text((d: any) => d.name)

    nodes.call(drag);
    // var data=d3.json('https:').then(data=>{

    // })


    function ticked() {
      //updating the position
      nodes
        .attr("cx", function (d: { x: number; }) {
          return d.x * 1.25;
        })
        .attr("cy", function (d: { y: number; }) {
          return d.y * 1.2;
          //for rectangle
          // .attr('x', (d: any) => d.x * 1.2) // Center the rectangle on the node
          // .attr('y', (d: any) => d.y * 1.2)
        });

      links
        .attr("x1", function (d: { source: { x: number; }; }) {
          return d.source.x * 1.2;
        })
        .attr("y1", function (d: { source: { y: number; }; }) {
          return d.source.y * 1.2;
        })
        .attr("x2", function (d: { target: { x: number; }; }) {
          return d.target.x * 1.2;
        })
        .attr("y2", function (d: { target: { y: number; }; }) {
          return d.target.y * 1.2;
        });
      //console.log(simulation.alpha());
      text
        .attr("dx", function (d: { x: number; }) {
          return d.x * 1.2;
        })
        .attr("dy", function (d: { y: number; }) {
          return d.y * 1.2;
        });

    }
    //mouse down
    const dragstarted = (e: any, d: SimulationNodeDatum) => {
      if (!e.active) {
        simulation.alphaTarget(0.3).restart();
      }
      d.fx = d.x;
      d.fy = d.y;
    };
    //mouse move
    const dragged = (e: any, d: SimulationNodeDatum) => {
      d.fx = e.x;
      d.fy = e.y;
    };
    //mouse up
    const dragended = (e: any, d: SimulationNodeDatum) => {
      if (!e.active) {
        simulation.alphaTarget(0);
      }
      d.fx = null;
      d.fy = null;
    };



  }

  // text attributes can be:
  //  .att("text-anchor","middle/start/end"),
  // to place thetext where you want
  //https://blog.logrocket.com/data-visualization-angular-d3-js/#setting-up-angular-d3

}







function Scrubber(arg0: number[], arg1: { autoplay: boolean; loop: boolean; alternate: boolean; initial: number; }) {
  throw new Error('Function not implemented.');
}

