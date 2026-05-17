import { TestBed } from '@angular/core/testing';
import { CarrinhoService } from './carrinho.service';
import type { Produto } from '../models/produto.model';

describe('CarrinhoService', () => {
  let service: CarrinhoService;

  const mockProduto: Produto = {
    id: 1,
    nome: 'Whey Protein',
    marca: 'Growth',
    preco: 100,
    estoque: 10,
    categoria: 'SUPLEMENTO',
  };

  const mockProduto2: Produto = {
    id: 2,
    nome: 'Creatina',
    marca: 'Max',
    preco: 80,
    estoque: 5,
    categoria: 'SUPLEMENTO',
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [CarrinhoService] });
    service = TestBed.inject(CarrinhoService);
  });

  it('CT-32: Carrinho inicia vazio', () => {
    expect(service.temItens()).toBe(false);
    expect(service.quantidadeItens()).toBe(0);
    expect(service.itens().length).toBe(0);
    expect(service.totais().subtotal).toBe(0);
    expect(service.totais().total).toBe(0);
  });

  it('CT-33: Adicionar item deve aumentar carrinho', () => {
    service.adicionarItem(mockProduto, 2);

    expect(service.temItens()).toBe(true);
    expect(service.itens().length).toBe(1);
    expect(service.itens()[0].quantidade).toBe(2);
    expect(service.quantidadeItens()).toBe(2);
  });

  it('CT-34: Adicionar mesmo produto deve incrementar quantidade', () => {
    service.adicionarItem(mockProduto, 2);
    service.adicionarItem(mockProduto, 3);

    expect(service.itens().length).toBe(1);
    expect(service.itens()[0].quantidade).toBe(5);
  });

  it('CT-35: Remover item deve diminuir carrinho', () => {
    service.adicionarItem(mockProduto, 1);
    service.adicionarItem(mockProduto2, 1);
    expect(service.itens().length).toBe(2);

    service.removerItem(1);
    expect(service.itens().length).toBe(1);
    expect(service.itens()[0].produto.id).toBe(2);
  });

  it('CT-36: Cálculo de totais sem cupons nem frete', () => {
    service.adicionarItem(mockProduto, 2);
    service.adicionarItem(mockProduto2, 1);

    const totais = service.totais();
    expect(totais.subtotal).toBe(280); // 2*100 + 1*80
    expect(totais.descontoPromocional).toBe(0);
    expect(totais.descontoTroca).toBe(0);
    expect(totais.valorFrete).toBe(0);
    expect(totais.total).toBe(280);
  });

  it('CT-37: Aplicar cupom promocional deve reduzir total', () => {
    service.adicionarItem(mockProduto, 1);
    service.setCupomPromocional({ id: 1, codigo: 'DESC10', tipo: 'PROMOCIONAL', valor: 10, validoAte: new Date().toISOString() });

    const totais = service.totais();
    expect(totais.subtotal).toBe(100);
    expect(totais.descontoPromocional).toBe(10);
    expect(totais.total).toBe(90);
  });

  it('CT-38: Aplicar cupons de troca deve reduzir total', () => {
    service.adicionarItem(mockProduto, 1);
    service.adicionarCupomTroca({ id: 1, codigo: 'TROCA25', tipo: 'TROCA', valor: 25, validoAte: new Date().toISOString() });

    const totais = service.totais();
    expect(totais.descontoTroca).toBe(25);
    expect(totais.total).toBe(75);
  });

  it('CT-39: Combinar cupom promocional + troca + frete', () => {
    service.adicionarItem(mockProduto, 2);
    service.setCupomPromocional({ id: 1, codigo: 'DESC10', tipo: 'PROMOCIONAL', valor: 10, validoAte: new Date().toISOString() });
    service.adicionarCupomTroca({ id: 2, codigo: 'TROCA25', tipo: 'TROCA', valor: 25, validoAte: new Date().toISOString() });
    service.setFrete({ id: '1', nome: 'SEDEX', prazoDias: 3, valor: 15 });

    const totais = service.totais();
    expect(totais.subtotal).toBe(200);
    expect(totais.descontoPromocional).toBe(10);
    expect(totais.descontoTroca).toBe(25);
    expect(totais.valorFrete).toBe(15);
    expect(totais.total).toBe(180);
    expect(totais.totalAPagar).toBe(180);
  });

  it('CT-40: Limpar carrinho deve resetar estado', () => {
    service.adicionarItem(mockProduto, 2);
    service.setEnderecoEntrega({ id: 1, apelido: 'Casa', logradouro: 'Rua A', numero: '123', bairro: 'Centro', cep: '12345-678', cidade: 'SP', estado: 'SP', pais: 'Brasil', ehEntrega: true, ehCobranca: false });
    expect(service.temItens()).toBe(true);

    service.limpar();
    expect(service.temItens()).toBe(false);
    expect(service.enderecoEntrega()).toBeNull();
  });

  it('CT-41: Cupom promocional não deve exceder subtotal', () => {
    service.adicionarItem(mockProduto, 1); // subtotal = 100
    service.setCupomPromocional({ id: 1, codigo: 'SUPER', tipo: 'PROMOCIONAL', valor: 200, validoAte: new Date().toISOString() });

    const totais = service.totais();
    expect(totais.descontoPromocional).toBe(100); // capped at subtotal
    expect(totais.total).toBe(0);
  });

  it('CT-42: validarEstoque retorna true se todos itens têm estoque', () => {
    service.adicionarItem(mockProduto, 5); // estoque 10
    expect(service.validarEstoque()).toBe(true);
  });

  it('CT-43: validarEstoque retorna false se algum item sem estoque', () => {
    service.adicionarItem(mockProduto, 15); // estoque 10
    expect(service.validarEstoque()).toBe(false);
  });
});
