import { Component } from '@angular/core';
import * as d3 from 'd3';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SimulationNodeDatum, color, selectAll } from 'd3';

@Component({
  selector: 'app-newgraph',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './newgraph.component.html',
  styleUrl: './newgraph.component.scss'
})
export class NewgraphComponent {
  searchTerm: string = '';
  private nodes = [
    { index: 0, name: 'Kunden', group: 0 },
    { index: 1, name: 'Fruit', group: 1 },
    { index: 2, name: 'Vegetable', group: 2 },
    { index: 3, name: 'Orange', group: 1 },
    { index: 4, name: 'Apple', group: 1 },
    { index: 5, name: 'Banana', group: 1 },
    { index: 6, name: 'Peach', group: 1 },
    { index: 7, name: 'Bean', group: 2 },
    { index: 8, name: 'Pea', group: 2 },
    { index: 9, name: 'Carrot', group: 2 },
    { index: 10, name: 'potato', group: 3 },
    { index: 11, name: 'cucumber', group: 3 },
    { index: 12, name: 'melon', group: 3 },
    { index: 13, name: 'water', group: 4 },
    { index: 14, name: 'milk', group: 4 },
    { index: 15, name: 'juice', group: 4 },
    { index: 16, name: 'David', group: 5 },
    { index: 17, name: 'Daniel', group: 5 },
    { index: 18, name: 'Marion', group: 5 },

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
    { source: this.nodes[7], target: this.nodes[11] },
    { source: this.nodes[7], target: this.nodes[12] },
    { source: this.nodes[7], target: this.nodes[10] },
    { source: this.nodes[8], target: this.nodes[13] },
    { source: this.nodes[8], target: this.nodes[14] },
    { source: this.nodes[8], target: this.nodes[15] },
    { source: this.nodes[4], target: this.nodes[16] },
    { source: this.nodes[4], target: this.nodes[17] },
    { source: this.nodes[4], target: this.nodes[18] }

  ];

  private svg: any;
  private margin = 20;
  private width = 1200 - (this.margin * 2);
  private height = 900 - (this.margin * 2);

  ngOnInit(): void {
    this.createSvg();
    this.drawGraph(this.nodes, this.links);
  }

  private createSvg(): void {
    this.svg = d3.select('figure#netgraph')
      .append('svg')
      .attr('width', this.width + (this.margin * 2))
      .attr('height', this.height + (this.margin * 2))
      .append('g');
  }

  private drawGraph(nodes: any, links: any): void {
    const simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('link', d3.forceLink(links).id((d: any) => d.index))
      .on('tick', ticked);

    const link = this.svg
      .append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke-width', 2)
      .style('stroke', 'orange');

    const node = this.svg
      .append('g')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', 20)
      .attr('fill', (d: any, i: number) => d3.schemeCategory10[i % 10])
      .call(d3.drag()
        .on('start', (e, d) => dragstarted(e, <SimulationNodeDatum>d))
        .on('drag', (e, d) => dragged(e, <SimulationNodeDatum>d))
        .on('end', (e, d) => dragended(e, <SimulationNodeDatum>d))
      );

    const text = this.svg
      .append('g')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .style('stroke', (d: any, i: number) => d3.schemeCategory10[i % 10])
      .text((d: any) => d.name);

    function ticked() {
      node
        .attr('cx', (d: any) => d.x * 1.2)
        .attr('cy', (d: any) => d.y * 1.2);


      link
        .attr('x1', (d: any) => d.source.x * 1.2)
        .attr('y1', (d: any) => d.source.y * 1.2)
        .attr('x2', (d: any) => d.target.x * 1.2)
        .attr('y2', (d: any) => d.target.y * 1.2);

      text
        .attr('dx', (d: any) => d.x * 1.2)
        .attr('dy', (d: any) => d.y * 1.2);


    }

    function dragstarted(event: any, d: SimulationNodeDatum) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: SimulationNodeDatum) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: SimulationNodeDatum) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }


  filterGraph(): void {
    // Find the node that matches the search term
    const searchedNode = this.nodes.find(node => node.name.toLowerCase() === this.searchTerm.toLowerCase());

    if (searchedNode) {
      // Filter the links to only include those connected to the searched node
      const filteredLinks = this.links.filter(link => link.source === searchedNode || link.target === searchedNode);

      // Ensure that the searchedNode and its connected nodes are included
      const connectedNodes = Array.from(new Set([
        searchedNode,
        ...filteredLinks.map(link => link.source),
        ...filteredLinks.map(link => link.target)
      ]));

      // Clear the existing SVG
      d3.select('figure#netgraph').selectAll('*').remove();



      // Redraw the graph with filtered nodes and links
      this.createSvg();
      this.drawGraph(connectedNodes, filteredLinks);

      // Highlight the searched node
      this.svg.selectAll('circle')
        .filter((d: any) => d === searchedNode)
        .attr('r', 30) // Increase the radius to make it more prominent
        .attr('stroke', 'red') // Add a red border
        .attr('stroke-width', 5); // Increase the border width

      // Re-run the simulation to adjust positions
      const simulation = d3.forceSimulation(connectedNodes)
        .force('charge', d3.forceManyBody().strength(-1000))  // Increase the repulsive force
        .force('center', d3.forceCenter(this.width / 2, this.height / 2))
        .force('link', d3.forceLink(filteredLinks).id((d: any) => d.index).distance(500))  // Increase link distance
        .force('collision', d3.forceCollide().radius(120))  // Add a collision force to prevent overlap
        .on('tick', () => {
          this.svg.selectAll('circle')
            //.transition().duration(1)
            .attr('cx', (d: any) => d.x)
            .attr('cy', (d: any) => d.y);

          this.svg.selectAll('line')
            .attr('x1', (d: any) => d.source.x)
            .attr('y1', (d: any) => d.source.y)
            .attr('x2', (d: any) => d.target.x)
            .attr('y2', (d: any) => d.target.y);

          this.svg.selectAll('text')
            .attr('dx', (d: any) => d.x)
            .attr('dy', (d: any) => d.y);
        });

      // Keep the searched node fixed in the center
      simulation.nodes().forEach((node: any) => {
        if (node === searchedNode) {
          node.fx = this.width / 2;
          node.fy = this.height / 2;
        }
      });
    } else {
      alert('Node not found!');
    }
  }

}

