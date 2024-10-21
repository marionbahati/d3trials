import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GraphServiceService {

  private urlkunden = '10.0.1.26:30000/api/v1/companies';

  constructor(private http: HttpClient) { }

  SearchCustomer(): Observable<any> {
    return this.http.get<any>(this.urlkunden);
  }

}
