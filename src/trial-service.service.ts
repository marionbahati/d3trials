import { Injectable } from '@angular/core';
import { Company } from './app/interfaces/company';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TrialServiceService {

  constructor(private http: HttpClient) { }
  companies: Company[] = [];

  private apiUrl = '10.0.1.26:30000/api/v1/companies';



  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.apiUrl);
  }

}
