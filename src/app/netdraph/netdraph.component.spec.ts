import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetdraphComponent } from './netdraph.component';

describe('NetdraphComponent', () => {
  let component: NetdraphComponent;
  let fixture: ComponentFixture<NetdraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NetdraphComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NetdraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
