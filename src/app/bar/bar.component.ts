import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { GraphdataService } from '../graphdata.service';
import { Company } from '../interfaces/company';
import { FormsModule } from '@angular/forms';
import { first } from 'rxjs';
@Component({
  selector: 'app-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './bar.component.html',
  styleUrl: './bar.component.scss'
})
export class BarComponent {
  selectedRelation: any;
  selectedCenterCompany: any;
  filterGraph() {
    throw new Error('Method not implemented.');
  }

  constructor(private dataSevice: GraphdataService) { }

  searchTerm: string = '';
  private nodes: any[] = [];
  private links: any[] = [];
  private svg: any;
  private margin = 20;
  private width = 1200 - (this.margin * 2);
  private height = 900 - (this.margin * 2);
  centerCompanyName = 'CodeShaffer'; // Center company set to CodeShaffer


  relation_filter: string = '';
  available_companies: Company[] = [];
  available_relations: string[] = [];
  graphData: any = { nodes: [], links: [] };


  ngOnInit(): void {
    this.getAvailableCompanies();
  }

  getAvailableCompanies() {
    // Fetch the companies and relations from a service or hardcoded data
    this.available_companies = this.dataSevice.getCompanies();

    // Get the available relations
    this.available_relations = [...new Set(this.available_companies.flatMap(c => c.Relations.map(r => r.relation_type)))];
  }

  addfilter(event: any) {
    const searchTerm = this.searchTerm.toLowerCase();
    const relationFilter = this.relation_filter;

    // Find the source node (the searched company)
    const sourceCompany = this.available_companies.find(c => c.name.toLowerCase() === searchTerm);

    if (sourceCompany) {
      // Filter relations based on the selected relation type
      const filteredRelations = sourceCompany.Relations.filter(rel => {
        return relationFilter ? rel.relation_type === relationFilter : true;
      });

      // Map filtered relations to target nodes
      const targetNodes = filteredRelations.map(rel => {
        return this.available_companies.find(c => c.id === rel.ObjectID || c.id === rel['SubjectID']);
      }).filter(t => t !== undefined); // Remove undefined targets

      // Prepare D3 data: Add source and target nodes to graphData
      this.graphData.nodes = [sourceCompany, ...targetNodes];
      this.graphData.links = filteredRelations.map(rel => ({
        source: sourceCompany.id,
        target: rel.ObjectID === sourceCompany.id ? rel['SubjectID'] : rel.ObjectID,
        type: rel.relation_type
      }));

      // Update the D3 graph
      this.drawGraph();
    }
  }

  drawGraph() {
    const svg = d3.select('svg');
    svg.selectAll('*').remove(); // Clear existing graph

    const width = +svg.attr('width');
    const height = +svg.attr('height');

    const simulation = d3.forceSimulation(this.graphData.nodes)
      .force('link', d3.forceLink(this.graphData.links).id((d: any) => d.id))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(this.graphData.links)
      .enter().append('line')
      .attr('stroke-width', 2)
      .attr('stroke', '#999');

    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(this.graphData.nodes)
      .enter().append('circle')
      .attr('r', 10)
      .attr('fill', '#69b3a2')
      .call(d3.drag().call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)));




    const label = svg.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(this.graphData.nodes)
      .enter().append('text')
      .text((d: any) => d.name)
      .attr('x', 6)
      .attr('y', 3);

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      label
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }
}



