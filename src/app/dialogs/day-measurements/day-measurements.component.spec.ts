import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayMeasurementsComponent } from './day-measurements.component';

describe('DayMeasurementsComponent', () => {
  let component: DayMeasurementsComponent;
  let fixture: ComponentFixture<DayMeasurementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DayMeasurementsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DayMeasurementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
