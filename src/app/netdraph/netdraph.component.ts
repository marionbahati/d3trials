import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { selectAll } from 'd3';
import { SimulationNodeDatum, drag, scaleOrdinal, schemeCategory10 } from 'd3';
import e from 'express';

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
  private color = scaleOrdinal(schemeCategory10);
  private svg: any;
  private margin = 50;
  private width = 750 - (this.margin * 2);
  private height = 400 - (this.margin * 2);


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
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(this.width / 2, this.height / 2))
      .force("link", d3.forceLink(this.links))
      .on("tick", ticked);

    var links = this.svg
      .append("g")
      .selectAll("line")
      .data(this.links)
      .enter()
      .append("line")
      .attr("stroke-width", 6)

      .style("stroke", "orange")

      ;

    var nodes = this.svg
      .append("g")
      .selectAll("circle")
      .data(this.nodes)
      .enter()
      .append("circle")
      .attr("r", 20)
      .attr("fill", "blue")


    //  var drag = d3
    //  .drag()
    //    .on('start', (e, d) => dragstarted(e, d))
    //   .on('drag', (e, d) => dragged(e, d))
    //    .on('end', (e, d) => dragended(e, d));

    var text = this.svg
      .append("g")
      .selectAll("text")
      .data(this.nodes)
      .enter()
      .append("text")
      .text((d: any) => d.name)

    nodes.call(drag);

    function ticked() {
      //updating the position
      nodes
        .attr("cx", function (d: { x: number; }) {
          return d.x * 1.2;
        })
        .attr("cy", function (d: { y: number; }) {
          return d.y * 1.2;
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
        .attr("cx", function (d: { x: number; }) {
          return d.x * 1.2;
        })
        .attr("cy", function (d: { y: number; }) {
          return d.y * 1.2;
        });

    }

    const dragstarted = (e: any, d: SimulationNodeDatum) => {
      if (!e.active) {
        simulation.alphaTarget(0.2).restart();
      }
      d.fx = d.x;
      d.fy = d.y;
    };

    const dragged = (e: any, d: SimulationNodeDatum) => {
      d.fx = e.x;
      d.fy = e.y;
    };

    const dragended = (e: any, d: SimulationNodeDatum) => {
      if (!e.active) {
        simulation.alphaTarget(0);
      }
      d.fx = null;
      d.fy = null;
    };



  }




}







