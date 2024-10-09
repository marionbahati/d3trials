import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-pie',
  standalone: true,
  imports: [CommonModule, NgFor],
  templateUrl: './pie.component.html',
  styleUrl: './pie.component.scss'
})
export class PieComponent {
  http = inject(HttpClient);
  data: any;
  CustomerArray: any[] = [];

  getnodes() {
    this.http.get("http://localhost:8080/api/v1/nodes/allNodes")
      .subscribe((resultData: any) => {
        console.log(resultData)
        this.CustomerArray = resultData;

      }
      );


  }
}
