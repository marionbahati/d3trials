import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BarComponent } from "./bar/bar.component";
import { PieComponent } from "./pie/pie.component";
import { NewgraphComponent } from "./newgraph/newgraph.component";
import { FirmavisualisierungGraphComponent } from "./firmavisualisierung-graph/firmavisualisierung-graph.component";
import { D3graphKundenComponent } from "./d3graph-kunden/d3graph-kunden.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, BarComponent, PieComponent, NewgraphComponent, FirmavisualisierungGraphComponent, D3graphKundenComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'd3visualisation';
}
