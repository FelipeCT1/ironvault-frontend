import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { RecomendacaoService, type RespostaChat } from './recomendacao.service';

describe('RecomendacaoService', () => {
  let service: RecomendacaoService;
  let httpMock: { post: ReturnType<typeof vi.fn> };

  const mockResposta: RespostaChat = {
    resposta: 'Recomendo o Whey Protein para ganho de massa muscular.',
    produtos: [
      { id: 1, nome: 'Whey Protein Concentrate', marca: 'Growth', descricao: 'Proteína do soro do leite', preco: 89.90, categoria: 'SUPLEMENTO', estoque: 50 },
      { id: 4, nome: 'BCAA 2:1:1', marca: 'Growth', descricao: 'Aminoácidos de cadeia ramificada', preco: 69.90, categoria: 'SUPLEMENTO', estoque: 40 },
    ],
    sugestoes: ['Qual a dosagem recomendada?', 'Posso tomar com creatina?'],
  };

  beforeEach(() => {
    httpMock = { post: vi.fn() };
    service = new RecomendacaoService(httpMock as unknown as HttpClient);
  });

  it('CT-47: enviarMensagem deve fazer POST para /api/v1/recomendacao/chat', () => {
    httpMock.post.mockReturnValue(of(mockResposta));

    service.enviarMensagem('Quero ganhar massa muscular').subscribe((res) => {
      expect(res.resposta).toBe(mockResposta.resposta);
      expect(res.produtos.length).toBe(2);
      expect(res.produtos[0].nome).toBe('Whey Protein Concentrate');
      expect(res.sugestoes.length).toBe(2);
    });

    expect(httpMock.post).toHaveBeenCalledWith('/api/v1/recomendacao/chat', { mensagem: 'Quero ganhar massa muscular' });
  });

  it('CT-48: enviarMensagem deve retornar lista vazia quando sem produtos', () => {
    const respostaVazia: RespostaChat = {
      resposta: 'Não encontrei produtos para sua consulta.',
      produtos: [],
      sugestoes: ['Tente perguntar de outra forma'],
    };

    httpMock.post.mockReturnValue(of(respostaVazia));

    service.enviarMensagem('produto inexistente').subscribe((res) => {
      expect(res.produtos.length).toBe(0);
      expect(res.resposta).toContain('Não encontrei');
    });
  });

  it('CT-49: enviarMensagem deve lidar com erro HTTP', () => {
    httpMock.post.mockReturnValue(throwError(() => new Error('Erro interno')));

    service.enviarMensagem('erro').subscribe({
      error: (err) => {
        expect(err.message).toBe('Erro interno');
      },
    });
  });
});
