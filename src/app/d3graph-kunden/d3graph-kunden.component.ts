import { Component } from '@angular/core';
import * as d3 from 'd3';
import { SimulationNodeDatum, color, selectAll } from 'd3';
import { GraphdataService } from '../graphdata.service';
import { first } from 'rxjs';
import { Company } from '../interfaces/company';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-d3graph-kunden',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './d3graph-kunden.component.html',
  styleUrl: './d3graph-kunden.component.scss'
})
export class D3graphKundenComponent {
  relationChanged($event: Event) {
    throw new Error('Method not implemented.');
  }
  searchTerm: any;
  ge: any;
  verf: any;
  addFilterAndCreateLinks($event: Event) {
    throw new Error('Method not implemented.');
  }
  ausgew: any;
  constructor(private service: GraphdataService) {

  }
  private svg: any;
  private margin = 20;
  private width = 1200 - (this.margin * 2);
  private height = 900 - (this.margin * 2);
  private nodes: Node[] = [];
  private links: d3link[] = [];
  ausgewählterkunde: any;
  ausgewählteBeziehung: any;
  gesuchtKunde: any;
  verfügbare_Beziehungen: string[] = [];
  verfügbare_Kunden: string[] = [];
  beziehungenListe: string[] = [];
  muttergesellschaft = "codeschaffer";
  quellLink!: string;
  zielLink!: string;
  beziehungen: string[] = [];
  chosenRelation!: string;
  chosen!: string



  ngOnInit(): void {
    if (this.service.isReady()) {
      this.draw();
    } else {
      this.service.ready$.pipe(first()).subscribe({
        next: () => this.draw()
      })
    }
  }

  getAvailableCompanies() {
    // map the list of companies to a list of only their names
    this.verfügbare_Kunden = this.service.getCompanies().map((c: Company) => c.name);



  }


  getAvailableRelations() {
    // the list of relation-types
    let relations: string[] = [];
    // iterate over every company
    for (let c of this.service.getCompanies()) {
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
    this.verfügbare_Beziehungen = relations;
  }


  firmaBeziehung() {

    for (let company of this.service.getCompanies()) {
      for (let beziehung of company.Relations) {
        if (!beziehung['includes'](beziehung.relation_type)) {
          this.beziehungen.push(beziehung.relation_type);
        }
      }
    }
    this.verfügbare_Beziehungen = this.beziehungen;
  }

  createNodes() {
    this.nodes = this.service.getCompanies().map(
      (c: Company, i: number, arr: Company[]) => {
        return { index: i, name: c.name, group: 0 }
      }
    );
  }

  getNodeByName(n: string) {

    return this.nodes.find(v => v.name == n);
  }

  getNodeById(id: number) {
    let company = this.service.getCompanies().find((x: Company) => x.id == id);
    if (company) {
      return this.getNodeByName(company.name)
    }
    return undefined;
  }
  isLinkAreadyAdded(list: d3link[], link: d3link) {
    for (let n of list) {
      if (link.source === n.source && link.target === n.target) {
        return true;
      }
    }
    return false;
  }

  alleLinksGenerieren() {
    let links: d3link[] = [];

    let quellFirma = this.service.getCompanies().find(firma => firma.name === this.muttergesellschaft);
    if (!quellFirma) {
      return;
    }
    this.quellLink = this.getNodeByName(quellFirma.name);
    for (let kunde of this.service.getCompanies()) {
      if (kunde.name !== this.muttergesellschaft) {
        this.zielLink = this.getNodeByName(kunde.name)
      }
    }
    if (this.zielLink) {
      let link = {
        source: this.quellLink,
        target: this.zielLink
      };
      // Only add the link if it is not already in the list
      if (!this.isLinkAreadyAdded(links, link)) {
        links.push(link);
      }
    }
  }

  setupData() {
    this.getAvailableCompanies();
    this.getAvailableRelations();
    this.createNodes();
    this.alleLinksGenerieren()

    //this.setToSe();
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
    this.gesuchtKunde = "";
    setTimeout(() => {
      this.reloadPage()
    }, 100);
  }
  KundenbeziehungenAnzeigen() {
    this.beziehungenListe = [];
    const gesuchtNode = this.nodes.find(node => node.name.toLowerCase() == this.gesuchtKunde.toLowerCase());
    for (let firma of this.service.getCompanies()) {
      if (firma.name.toLowerCase() === this.gesuchtKunde.toLowerCase()) {
        for (let beziehung of (firma?.Relations || [])) {
          let ziel_node = this.getNodeById(beziehung.ObjectID);
          if (ziel_node) {
            this.beziehungenListe.push('${this.beziehung.relation_type} : ${this.ziel_node.name}');
          }
        }
      }
      if (this.beziehungenListe.length === 0) {
        this.beziehungenListe.push(`${this.gesuchtKunde} ist ein nur kunde von Codeschaffer.Weitere bekannte Beziehungen gibt es nicht`);
      }
    }
  }
  drawSearchedLinks(event: any) {
    let links: any[] = [];
    let Gesuchte_nodes: any[] = [];
    let binding_nodes: any[] = [];
    this.beziehungenListe = [];
    const kundeAuswahl = this.ausgewählterkunde;
    const beziehungAuswahl = this.ausgewählteBeziehung;
    const gesuchtNode = this.nodes.find(node => node.name.toLowerCase() == this.gesuchtKunde.toLowerCase());
    for (let firma of this.service.getCompanies()) {
      let quell_node = firma;
      for (let beziehung of (firma?.Relations || [])) {
        let ziel_node = this.getNodeById(beziehung.ObjectID);
        if (ziel_node) {
          this.beziehungenListe.push('${this.kundeAuswahl} ist Kunde von Codeschaffer');
        }
        if (this.beziehungenListe.length === 0) {

          this.beziehungenListe.push
        }

        if (chosenRelation === "" || chosenRelation === beziehung.relation_type) {
          let link = {
            source: quell_node,
            target: ziel_node
          };

          if (quell_node && ziel_node && !this.isLinkAreadyAdded(links, link)) {
            links.push(link);
          }
        }
      }
      if (gesuchtNode) {
        const chosenLinks = links.filter(link => link.source === gesuchtNode || link.target === gesuchtNode);
        //remove duplicates by puuting them in a set
        binding_nodes = Array.from(new Set([
          gesuchtNode,
          ...chosenLinks.map(link => link.source),
          ...chosenLinks.map(link => link.target)
        ]));
      }
      this.KundenbeziehungenAnzeigen();
      d3.select('figure#netgraph').selectAll('*').remove();
      this.createSvg();
      this.drawGraph(binding_nodes, chosenLinks);

      // Highlight the searched node by increasing its size and adding a border
      this.svg.selectAll('circle')
        .filter((d: any) => d.name === this.gesuchtKunde)
        .attr('r', 30) // Make the circle bigger
        .attr('stroke', 'red') // Add a red border
        .attr('stroke-width', 5); // Make the border thicker

      // Re-run the simulation to adjust positions
      const simulation = d3.forceSimulation(binding_nodes)
        .force('charge', d3.forceManyBody().strength(-100))  // Push nodes apart
        .force('center', d3.forceCenter(this.width / 2, this.height / 2))
        .force('link', d3.forceLink(chosenLinks).id((d: any) => d.index).distance(30))  // Space out links
        .force('collision', d3.forceCollide().radius(30))  // Avoid overlapping

        .on('tick', () => {
          // Update positions of all elements in the SVG as simulation runs
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

      // Keep the searched node fixed in the center of the graph
      simulation.nodes().forEach((node: any) => {
        if (node.name === this.gesuchtKunde) {
          node.fx = this.width / 2;
          node.fy = this.height / 2;
        }
      });
    }
  }
}





