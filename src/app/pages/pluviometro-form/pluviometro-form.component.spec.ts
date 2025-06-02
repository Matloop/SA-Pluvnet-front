import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PluviometroFormComponent } from './pluviometro-form.component';

describe('PluviometroFormComponent', () => {
  let component: PluviometroFormComponent;
  let fixture: ComponentFixture<PluviometroFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PluviometroFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PluviometroFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
