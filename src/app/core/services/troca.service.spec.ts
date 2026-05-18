import { of } from 'rxjs';
import { TrocaService } from './troca.service';
import type { Troca, SolicitarTrocaDTO } from '../models/troca.model';

function mockHttp() {
  return { post: vi.fn(), get: vi.fn(), patch: vi.fn() } as any;
}

describe('TrocaService', () => {
  let http: ReturnType<typeof mockHttp>;
  let service: TrocaService;

  beforeEach(() => {
    http = mockHttp();
    service = new TrocaService(http);
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
    http.post.mockReturnValue(of(mockTroca));

    service.solicitar(dto).subscribe(result => {
      expect(result.status).toBe('SOLICITADA');
      expect(result.motivo).toBe('Produto com defeito');
    });

    expect(http.post).toHaveBeenCalledWith('/api/v1/trocas', dto);
  });

  it('CT-28: Autorizar troca deve chamar PATCH de autorizar', () => {
    http.patch.mockReturnValue(of(mockTroca));

    service.autorizar(1).subscribe(result => {
      expect(result.status).toBe('SOLICITADA');
    });

    expect(http.patch).toHaveBeenCalledWith('/api/v1/trocas/1/autorizar', {});
  });

  it('CT-29: Recusar troca deve chamar PATCH de recusar', () => {
    const trocaRecusada = { ...mockTroca, status: 'RECUSADA' as const };
    http.patch.mockReturnValue(of(trocaRecusada));

    service.recusar(1).subscribe(result => {
      expect(result.status).toBe('RECUSADA');
    });

    expect(http.patch).toHaveBeenCalledWith('/api/v1/trocas/1/recusar', {});
  });

  it('CT-30: Concluir troca deve chamar PATCH de concluir', () => {
    const trocaConcluida = { ...mockTroca, status: 'CONCLUIDA' as const };
    http.patch.mockReturnValue(of(trocaConcluida));

    service.concluir(1).subscribe(result => {
      expect(result.status).toBe('CONCLUIDA');
    });

    expect(http.patch).toHaveBeenCalledWith('/api/v1/trocas/1/concluir', {});
  });

  it('CT-31: Listar trocas do cliente deve retornar array', () => {
    http.get.mockReturnValue(of([mockTroca]));

    service.listarPorCliente(1).subscribe(result => {
      expect(result.length).toBe(1);
      expect(result[0].clienteId).toBe(1);
    });

    expect(http.get).toHaveBeenCalledWith('/api/v1/trocas/cliente/1');
  });
});
