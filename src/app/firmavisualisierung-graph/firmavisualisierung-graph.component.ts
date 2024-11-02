import { Component } from '@angular/core';
import { GraphServiceService } from '../graph-service.service';
import * as d3 from 'd3';
import { GraphdataService } from '../graphdata.service';
import { find, first } from 'rxjs';
import { Company } from '../interfaces/company';

@Component({
  selector: 'app-firmavisualisierung-graph',
  standalone: true,
  imports: [],
  templateUrl: './firmavisualisierung-graph.component.html',
  styleUrl: './firmavisualisierung-graph.component.scss'
})
export class FirmavisualisierungGraphComponent {
  constructor(private service: GraphdataService) {

  }
  quellknote!: string;
  zielknote: string[] = [];
  ausgewahlteKunde: string[] = [];
  augewahlteBeziehung: string[] = [];
  zentrallNode: string = "Codeschaffer";
  links!: { [source: string]: any; string: any; };


  VerfügbareUnternehmen: string[] = [];
  verfügbareBeziehungen: string[] = [];

  ngOnInit(): void {

    if (this.service.isReady()) {
      this.draw();
    } else {
      this.service.ready$.pipe(first()).subscribe({
        next: () => this.draw()
      })
    }
  }
  draw(): void {
    throw new Error('Method not implemented.');
  }
  getAvailableCompanies() {
    // map the list of companies to a list of only their names
    this.VerfügbareUnternehmen = this.service.getCompanies().map((c: Company) => c.name);



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
    this.augewahlteBeziehung = relations;
  }

  // createNodes() {
  //   this.nodes = this.service.getCompanies().map(
  //     (c: Company, i: number) => {
  //       // this is the format wanted by d3 (see "nodes" above)
  //       return { index: i, name: c.name, group: 0 }
  //     }
  //   );
  // }
  AlleKunden() {
    let zentrallNode = this.service.getCompanies().find(company => company.name === 'Codeschaffer');
    for (let firma of this.service.getCompanies()) {
      let zielknote = firma;
    }
  }
  filterAlleKunden() {

  }

  alertstuff() {
    alert(this.zentrallNode);
  }
  alertetherest() {
    alert(this.zielknote);
  }
}
