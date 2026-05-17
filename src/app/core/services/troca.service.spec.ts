import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TrocaService } from './troca.service';
import type { Troca, SolicitarTrocaDTO } from '../models/troca.model';

describe('TrocaService', () => {
  let service: TrocaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TrocaService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(TrocaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  const mockTroca: Troca = {
    id: 1,
    codigoTroca: 'TRC-0001',
    vendaId: 1,
    clienteId: 1,
    produtoId: 1,
    produtoNome: 'Whey Protein',
    quantidade: 1,
    motivo: 'Produto com defeito',
    status: 'SOLICITADA',
    valorCredito: 80,
    dataCriacao: new Date().toISOString(),
  };

  it('CT-27: Solicitar troca deve criar troca com status SOLICITADA', () => {
    const dto: SolicitarTrocaDTO = {
      vendaId: 1,
      produtoId: 1,
      produtoNome: 'Whey Protein',
      quantidade: 1,
      motivo: 'Produto com defeito',
      valorCredito: 80,
    };

    service.solicitar(dto).subscribe(troca => {
      expect(troca.status).toBe('SOLICITADA');
      expect(troca.motivo).toBe('Produto com defeito');
    });

    const req = httpMock.expectOne('/api/v1/trocas');
    expect(req.request.method).toBe('POST');
    req.flush(mockTroca);
  });

  it('CT-28: Autorizar troca deve chamar PATCH de autorizar', () => {
    service.autorizar(1).subscribe(troca => {
      expect(troca.status).toBe('SOLICITADA');
    });

    const req = httpMock.expectOne('/api/v1/trocas/1/autorizar');
    expect(req.request.method).toBe('PATCH');
    req.flush(mockTroca);
  });

  it('CT-29: Recusar troca deve chamar PATCH de recusar', () => {
    const trocaRecusada = { ...mockTroca, status: 'RECUSADA' as const };

    service.recusar(1).subscribe(troca => {
      expect(troca.status).toBe('RECUSADA');
    });

    const req = httpMock.expectOne('/api/v1/trocas/1/recusar');
    expect(req.request.method).toBe('PATCH');
    req.flush(trocaRecusada);
  });

  it('CT-30: Concluir troca deve chamar PATCH de concluir', () => {
    const trocaConcluida = { ...mockTroca, status: 'CONCLUIDA' as const };

    service.concluir(1).subscribe(troca => {
      expect(troca.status).toBe('CONCLUIDA');
    });

    const req = httpMock.expectOne('/api/v1/trocas/1/concluir');
    expect(req.request.method).toBe('PATCH');
    req.flush(trocaConcluida);
  });

  it('CT-31: Listar trocas do cliente deve retornar array', () => {
    service.listarPorCliente(1).subscribe(trocas => {
      expect(trocas.length).toBe(1);
      expect(trocas[0].clienteId).toBe(1);
    });

    const req = httpMock.expectOne('/api/v1/trocas/cliente/1');
    expect(req.request.method).toBe('GET');
    req.flush([mockTroca]);
  });
});
