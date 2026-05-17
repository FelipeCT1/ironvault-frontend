import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { VendaService } from './venda.service';
import type { FinalizarCompraDTO, Venda } from '../models/venda.model';
import { StatusVenda } from '../models/venda.model';

describe('VendaService', () => {
  let service: VendaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        VendaService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(VendaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
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

    service.finalizarCompra(dto).subscribe(venda => {
      expect(venda).toEqual(mockVenda);
      expect(venda.status).toBe('EM_PROCESSAMENTO');
    });

    const req = httpMock.expectOne('/api/v1/vendas');
    expect(req.request.method).toBe('POST');
    req.flush(mockVenda);
  });

  it('CT-24: Consultar venda por ID deve retornar dados', () => {
    service.consultarPorId(1).subscribe(venda => {
      expect(venda.id).toBe(1);
      expect(venda.codigoPedido).toBe('PED-0001');
    });

    const req = httpMock.expectOne('/api/v1/vendas/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockVenda);
  });

  it('CT-25: Listar vendas do cliente deve retornar array', () => {
    service.listarPorCliente(1).subscribe(vendas => {
      expect(vendas.length).toBe(1);
      expect(vendas[0].clienteId).toBe(1);
    });

    const req = httpMock.expectOne('/api/v1/vendas/cliente/1');
    expect(req.request.method).toBe('GET');
    req.flush([mockVenda]);
  });

  it('CT-26: Atualizar status deve chamar PATCH com ação correta', () => {
    service.atualizarStatus(1, 'aprovar').subscribe();

    const req = httpMock.expectOne('/api/v1/vendas/1/aprovar');
    expect(req.request.method).toBe('PATCH');
    req.flush({});
  });
});
