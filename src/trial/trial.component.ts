import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Company } from '../app/interfaces/company';

import * as d3 from 'd3';
import { TrialServiceService } from '../trial-service.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-trial',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './trial.component.html',
  styleUrl: './trial.component.scss'
})
export class TrialComponent implements OnInit {
  @ViewChild('graphContainer', { static: true })
  graphContainer!: ElementRef;
  companies: Company[] = [];
  selectedRelation: string = 'none';
  searchTerm: string = '';

  // D3 related variables
  svg: any;
  width!: number;
  height!: number;
  simulation: any;
  link: any;
  node: any;

  constructor(private companyService: TrialServiceService) { }

  ngOnInit(): void {
    this.width = this.graphContainer.nativeElement.offsetWidth;
    this.height = this.graphContainer.nativeElement.offsetHeight;

    // Fetch the companies and initialize the graph
    this.companyService.getCompanies().subscribe(data => {
      this.companies = data;
      this.initGraph();
    });
  }

  // Initialize the graph
  initGraph() {
    this.svg = d3.select(this.graphContainer.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    this.simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id((d: any) => d.id))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(this.width / 2, this.height / 2));

    this.updateGraph();
  }

  // Function to update the graph based on the selected relation or search term
  updateGraph() {
    // Filter the data based on the selected relation
    const filteredRelations = this.selectedRelation === 'none'
      ? this.getAllRelations()
      : this.getFilteredRelations();

    // Create links (edges)
    this.link = this.svg.selectAll('.link')
      .data(filteredRelations)
      .enter().append('line')
      .attr('class', 'link')
      .style('stroke', '#aaa');

    // Create nodes (vertices)
    this.node = this.svg.selectAll('.node')
      .data(this.companies)
      .enter().append('circle')
      .attr('class', 'node')
      .attr('r', 10)
      .style('fill', (d: any) => this.getColor(d))
      .call(d3.drag()
        .on('start', (event: any, d: any) => this.dragStarted(event, d))
        .on('drag', (event: any, d: any) => this.dragged(event, d))
        .on('end', (event: any, d: any) => this.dragEnded(event, d)));

    // Add tick actions
    this.simulation
      .nodes(this.companies)
      .on('tick', () => this.ticked());

    this.simulation.force('link')
      .links(filteredRelations);
  }

  // Define the ticked behavior
  ticked() {
    this.link
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y);

    this.node
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y);
  }

  // Functions to get all relations or filter based on the selected relation type
  getAllRelations() {
    return this.companies.flatMap(company => company['relations'].map((relation: { subjectID: any; objectID: any; }) => {
      return {
        source: relation.subjectID,
        target: relation.objectID
      };
    }));
  }

  getFilteredRelations() {
    return this.companies.flatMap(company => company['relations']
      .filter((relation: { relation_type: string; }) => relation.relation_type === this.selectedRelation)
      .map((relation: { subjectID: any; objectID: any; }) => {
        return {
          source: relation.subjectID,
          target: relation.objectID
        };
      })
    );
  }

  // Function to get color for nodes
  getColor(d: any) {
    // Define colors based on company types or any other criteria
    return '#69b3a2'; // Default color
  }

  // Dragging functions
  dragStarted(event: any, d: any) {
    if (!event.active) this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  dragged(event: any, d: any) {
    d.fx = event.x;
    d.fy = event.y;
  }

  dragEnded(event: any, d: any) {
    if (!event.active) this.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  // Handle search functionality
  search() {
    const filteredCompanies = this.companies.filter(company =>
      company.name.toLowerCase().includes(this.searchTerm.toLowerCase()));

    // Highlight the searched node and its relations
    this.updateGraphWithSearch(filteredCompanies);
  }

  updateGraphWithSearch(filteredCompanies: Company[]) {
    this.node.style('fill', (d: any) =>
      filteredCompanies.some(company => company.id === d.id) ? 'red' : '#69b3a2');
  }

}
