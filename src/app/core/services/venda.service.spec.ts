import { of } from 'rxjs';
import { VendaService } from './venda.service';
import type { FinalizarCompraDTO, Venda } from '../models/venda.model';
import { StatusVenda } from '../models/venda.model';

function mockHttp() {
  return { post: vi.fn(), get: vi.fn(), patch: vi.fn() } as any;
}

describe('VendaService', () => {
  let http: ReturnType<typeof mockHttp>;
  let service: VendaService;

  beforeEach(() => {
    http = mockHttp();
    service = new VendaService(http);
  });

  const mockVenda: Venda = {
    id: 1,
    clienteId: 1,
    codigoPedido: 'PED-0001',
    itens: [{ produtoId: 1, produtoNome: 'Whey', quantidade: 2, precoUnitario: 100, subtotal: 200 }],
    enderecoEntrega: { apelido: 'Casa', logradouro: 'Rua A', numero: '123', bairro: 'Centro', cep: '12345-678', cidade: 'SP', estado: 'SP', pais: 'Brasil' },
    pagamentosCartao: [],
    freteTipo: 'SEDEX',
    fretePrazoDias: 3,
    freteValor: 15,
    subtotal: 200,
    descontoPromocional: 10,
    descontoTroca: 0,
    valorFrete: 15,
    total: 205,
    status: 'EM_PROCESSAMENTO' as StatusVenda,
    dataCriacao: new Date().toISOString(),
  };

  it('CT-23: Finalizar compra deve criar venda', () => {
    const dto: FinalizarCompraDTO = {
      clienteId: 1,
      itens: [{ produtoId: 1, produtoNome: 'Whey', quantidade: 2, precoUnitario: 100 }],
      enderecoEntrega: { apelido: 'Casa', logradouro: 'Rua A', numero: '123', bairro: 'Centro', cep: '12345-678', cidade: 'SP', estado: 'SP', pais: 'Brasil' },
      frete: { tipo: 'SEDEX', prazoDias: 3, valor: 15 },
      pagamentosCartao: [{ cartaoId: 1, valor: 205 }],
    };
    http.post.mockReturnValue(of(mockVenda));

    service.finalizarCompra(dto).subscribe(result => {
      expect(result).toEqual(mockVenda);
      expect(result.status).toBe('EM_PROCESSAMENTO');
    });

    expect(http.post).toHaveBeenCalledWith('/api/v1/vendas', dto);
  });

  it('CT-24: Consultar venda por ID deve retornar dados', () => {
    http.get.mockReturnValue(of(mockVenda));

    service.consultarPorId(1).subscribe(result => {
      expect(result.id).toBe(1);
      expect(result.codigoPedido).toBe('PED-0001');
    });

    expect(http.get).toHaveBeenCalledWith('/api/v1/vendas/1');
  });

  it('CT-25: Listar vendas do cliente deve retornar array', () => {
    http.get.mockReturnValue(of([mockVenda]));

    service.listarPorCliente(1).subscribe(result => {
      expect(result.length).toBe(1);
      expect(result[0].clienteId).toBe(1);
    });

    expect(http.get).toHaveBeenCalledWith('/api/v1/vendas/cliente/1');
  });

  it('CT-26: Atualizar status deve chamar PATCH com ação correta', () => {
    http.patch.mockReturnValue(of({}));

    service.atualizarStatus(1, 'aprovar').subscribe();

    expect(http.patch).toHaveBeenCalledWith('/api/v1/vendas/1/aprovar', {});
  });
});
