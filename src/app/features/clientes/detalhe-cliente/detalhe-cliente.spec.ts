import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalheCliente } from './detalhe-cliente';

describe('DetalheCliente', () => {
  let component: DetalheCliente;
  let fixture: ComponentFixture<DetalheCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalheCliente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalheCliente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
