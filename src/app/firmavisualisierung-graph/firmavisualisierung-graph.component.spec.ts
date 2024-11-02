import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirmavisualisierungGraphComponent } from './firmavisualisierung-graph.component';

describe('FirmavisualisierungGraphComponent', () => {
  let component: FirmavisualisierungGraphComponent;
  let fixture: ComponentFixture<FirmavisualisierungGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FirmavisualisierungGraphComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FirmavisualisierungGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
