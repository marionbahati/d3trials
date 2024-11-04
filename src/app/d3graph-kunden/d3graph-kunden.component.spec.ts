import { ComponentFixture, TestBed } from '@angular/core/testing';

import { D3graphKundenComponent } from './d3graph-kunden.component';

describe('D3graphKundenComponent', () => {
  let component: D3graphKundenComponent;
  let fixture: ComponentFixture<D3graphKundenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [D3graphKundenComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(D3graphKundenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
