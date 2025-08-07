import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicoesListComponent } from './medicoes-list.component';

describe('MedicoesListComponent', () => {
  let component: MedicoesListComponent;
  let fixture: ComponentFixture<MedicoesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicoesListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MedicoesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
