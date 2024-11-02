import { Component } from '@angular/core';
import * as d3 from 'd3';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SimulationNodeDatum, color, selectAll } from 'd3';
import { GraphdataService } from '../graphdata.service';
import { first } from 'rxjs';
import { Company } from '../interfaces/company';

interface d3link { source: any, target: any };
interface d3node { index: number, name: string, group: number };
@Component({
  selector: 'app-newgraph',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './newgraph.component.html',
  styleUrl: './newgraph.component.scss'
})
export class NewgraphComponent {
  [x: string]: any;
  relatntype!: string;


  constructor(private data: GraphdataService) {

  }
  searchTerm: string = '';
  private nodes: d3node[] = [];

  private links: d3link[] = [];
  selected_company: string = '';
  private svg: any;
  private margin = 20;
  private width = 1200 - (this.margin * 2);
  private height = 900 - (this.margin * 2);
  available_relations: string[] = [];
  available_companies: string[] = [];
  relation_filter = ''
  center_of_view = 'Codeschaffer'
  relationsList: string[] = [];
  private chosenRelationType: any;
  private chosenCenterCompany: any;

  ngOnInit(): void {
    if (this.data.isReady()) {
      this.draw();
    } else {
      this.data.ready$.pipe(first()).subscribe({
        next: () => this.draw()
      })
    }
  }
  relationChanged(event: any) {
    this.addFilterAndCreateLinks(event);
  }
  getAvailableCompanies() {
    // map the list of companies to a list of only their names
    this.available_companies = this.data.getCompanies().map((c: Company) => c.name);



  }
  getAvailableRelations() {
    // the list of relation-types
    let relations: string[] = [];
    // iterate over every company
    for (let c of this.data.getCompanies()) {
      // iterate over earch company's relation
      for (let relation of c.Relations) {
        // if the relation is not already in the list
        if (!relations.includes(relation.relation_type)) {
          // add it
          relations.push(relation.relation_type);

        }

      }
    }
    // save the available relations to property "available_relations"
    this.available_relations = relations;
  }

  createNodes() {
    this.nodes = this.data.getCompanies().map(
      (c: Company, i: number, arr: Company[]) => {
        // this is the format wanted by d3 (see "nodes" above)
        return { index: i, name: c.name, group: 0 }
      }
    );
  }

  getNodeByName(n: string) {
    // this.nodes is an array
    // Array.find() returns the first element of the array for that the condition evaluates to true
    // if none matches, undefined is returned
    return this.nodes.find(v => v.name == n);
  }
  // lookup a company of type "Company" by Id
  // then lookup the corresponding node (see this.nodes) by the companies "name"
  getNodeById(id: number) {
    let company = this.data.getCompanies().find((x: Company) => x.id == id);
    if (company) {
      return this.getNodeByName(company.name)
    }
    return undefined;
  }

  // check if a link ("link") is in an array of links "list"
  hasLink(list: d3link[], link: d3link) {
    for (let l of list) {
      if (link.source == l.source && link.target == l.target) {
        return true;
      }
    }
    return false;
  }

  createAllLinks() {
    let links: d3link[] = [];
    const selectedCompany = this.selected_company;
    const selectedRelation = this.relation_filter;


    // Find the central company node with the name "Codeschaffer"
    let centralCompany = this.data.getCompanies().find(company => company.name === 'Codeschaffer');

    if (!centralCompany) {

      return;
    }

    let centralNode = this.getNodeByName(centralCompany.name); // Get the D3 node for "Codeschaffer"

    // Ensure the central node exists
    if (!centralNode) {

      return;



    }

    // Iterate through all companies and create links from the center node to each of them
    for (let company of this.data.getCompanies()) {
      // Ensure we are not linking the central node to itself
      if (company.name !== 'Codeschaffer') {
        let targetNode = this.getNodeByName(company.name); // Get the D3 node for the target company

        // Ensure the target node exists before creating the link
        if (targetNode) {
          let link = {
            source: centralNode,  // Set the source as the central node
            target: targetNode    // Set the target as the current company node
          };

          // Only add the link if it is not already in the list
          if (!this.hasLink(links, link)) {
            links.push(link);
          }
        }
      }
    }

    // Set the links array to include all the generated links
    this.links = links;




  }






  setToSearchterm() {
    this.searchTerm = this.selected_company;
  }
  setupData() {
    this.getAvailableCompanies();
    this.getAvailableRelations();
    this.createNodes();
    this.createAllLinks();

    this.setToSearchterm();
  }

  draw() {
    this.setupData();
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
      .force('charge', d3.forceManyBody().strength(-3500))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('link', d3.forceLink(links).id((d: any) => d.index))
      .force('collision', d3.forceCollide().radius(-4000))
      .force('link', d3.forceLink(this.links).id((d: any) => d.index).distance(200))
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
      .attr('r', 25)
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
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);


      link
        .attr('x1', (d: any) => d.source.x * 1)
        .attr('y1', (d: any) => d.source.y * 1)
        .attr('x2', (d: any) => d.target.x * 1)
        .attr('y2', (d: any) => d.target.y * 1);

      text
        .attr('dx', (d: any) => d.x * 1)
        .attr('dy', (d: any) => d.y * 1);


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

  reloadPage() {
    window.location.reload()
  }
  DeleteSEarchterm() {
    this.searchTerm = "";
    setTimeout(() => {
      this.reloadPage()
    }, 100);
  }


  displaySearchTermRelations() {
    // Clear the previous relations list
    this.relationsList = [];

    //  Find the searched node based on the search term
    const searchedNode = this.nodes.find(node => node.name.toLowerCase() === this.searchTerm.toLowerCase());

    // Loop through companies and find relations for the searched company
    for (let company of this.data.getCompanies()) {
      if (company.name.toLowerCase() === this.searchTerm.toLowerCase()) {
        // Collect relation types and target company names for the searched node
        for (let relation of company.Relations ?? []) {
          let targetCompany = this.getNodeById(relation.ObjectID); // Find the related company by its ID
          if (targetCompany) {
            // Add a string combining the relation type and the target company name
            this.relationsList.push(`${relation.relation_type}  : ${targetCompany.name}`);
          }
        }
      }
    }

    //  If no relations were found, display a message indicating that
    if (this.relationsList.length === 0) {
      this.relationsList.push(`${this.searchTerm} ist ein nur kunde von Codeschaffer.Weitere bekannte Beziehungen gibt es nicht`);
    }
  }


  addFilterAndCreateLinks(event: any) {
    let links: d3link[] = [];
    let connectedNodes: any[] = [];

    //  Retrieve the selected company and relation filter values
    const selectedCompany = this.selected_company;
    const selectedRelation = this.relation_filter;

    //  Find the searched node based on the search term
    const searchedNode = this.nodes.find(node => node.name.toLowerCase() === this.searchTerm.toLowerCase());

    //  Loop through companies to find relations
    for (let company of this.data.getCompanies()) {

      let sourceNode = company;

      for (let relation of company?.Relations ?? []) {
        let targetNode = this.getNodeById(relation.ObjectID);



        // Add link if it matches the filter
        if (selectedRelation === "" || selectedRelation === relation.relation_type) {
          let link = {
            source: sourceNode,
            target: targetNode
          };


          // Only add the link if it's not already in the list
          if (sourceNode && targetNode && !this.hasLink(links, link)) {
            links.push(link);
          }
        }
      }

    }

    // If a searched node exists, filter links based on it
    if (searchedNode) {
      const filteredLinks = links.filter(link => link.source === searchedNode || link.target === searchedNode);

      // Ensure that the searched node and connected nodes are included
      connectedNodes = Array.from(new Set([
        searchedNode,
        ...filteredLinks.map(link => link.source),
        ...filteredLinks.map(link => link.target)
      ]));

      //  Display relations for the searched term
      this.displaySearchTermRelations();

      // Clear the existing SVG and redraw the graph
      d3.select('figure#netgraph').selectAll('*').remove();
      this.createSvg();
      this.drawGraph(connectedNodes, filteredLinks);

      //  Highlight the searched node
      this.svg.selectAll('circle')
        .filter((d: any) => d.name === this.searchTerm)
        .attr('r', 30) // Increase the radius
        .attr('stroke', 'red') // Add a red border
        .attr('stroke-width', 5); // Increase border width


      // Re-run simulation to adjust positions
      const simulation = d3.forceSimulation(connectedNodes)
        .force('charge', d3.forceManyBody().strength(-100))  // Increase repulsive force
        .force('center', d3.forceCenter(this.width / 2, this.height / 2))
        .force('link', d3.forceLink(filteredLinks).id((d: any) => d.index).distance(30))  // Increase link distance
        .force('collision', d3.forceCollide().radius(30))  // Add collision force to prevent overlap

        .on('tick', () => {
          this.svg.selectAll('circle')
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

      // Fix the searched node in the center
      simulation.nodes().forEach((node: any) => {
        if (node.name === this.searchTerm) {
          node.fx = this.width / 2;
          node.fy = this.height / 2;
        }
      });

    }
  }

}

