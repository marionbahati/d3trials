import { Injectable } from '@angular/core';
import { Company } from './interfaces/company';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GraphdataService {
  companies: Company[] = [];
  ready$: Subject<true> = new Subject<true>();
  constructor() {
    console.log("constructing GraphData-Service")
    this.loadCompanies().then((c: Company[]) => {
      this.companies = c;
      this.ready$.next(true)
    }
    );
  }
  isReady(): boolean {
    return this.companies.length > 0;
  }
  getCompanies(): Company[] {
    return this.companies;
  }
  getCompanyNames(): string[] {
    return this.companies.map((x: Company) => x.name);
  }
  async loadCompanies(): Promise<Company[]> {
    let resp = await fetch('/assets/data.json');
    let json: Company[] = await resp.json() as Company[];
    console.log(json);
    return json;
  }

}
