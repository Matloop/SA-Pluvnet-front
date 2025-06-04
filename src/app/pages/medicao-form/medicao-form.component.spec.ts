import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicaoFormComponent } from './medicao-form.component';

describe('MedicaoFormComponent', () => {
  let component: MedicaoFormComponent;
  let fixture: ComponentFixture<MedicaoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicaoFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MedicaoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
