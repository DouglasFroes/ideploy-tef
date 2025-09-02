import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  multiply(a: number, b: number): number;
  // Dispara uma transação TEF via IDH. Params dependem do tipo.
  iniciarTransacao(params: {
    tipo?: 'vender' | 'debito' | 'credito' | 'pix';
    valor?: number | string;
    parcelas?: number | string; // somente crédito
    financiamento?: number | string; // somente crédito
    empresaSitef?: string;
    modalidade?: number | string;
    cnpjCpf?: string;
    documentoFiscal?: string;
  }): Promise<any>;
  cancelarTransacao(params: {
    valor?: number | string;
    nsu?: string;
    data?: string; // dd/MM/yy
    empresaSitef?: string;
    cnpjCpf?: string;
  }): Promise<any>;
  confirmarTransacao(): Promise<any>;
  // Customização IDH
  customizarAplicacao(params: {
    logotipo?: string; // caminho da imagem
    background?: string; // #RRGGBB
    gradienteInicio?: string; // #RRGGBB
    gradienteFim?: string; // #RRGGBB
  }): Promise<boolean>;
  customizarCabecalho(params: {
    corBotao?: string;
    corIcone?: string;
    corFonte?: string;
  }): Promise<boolean>;
  customizarConteudo(params: {
    corBotao?: string;
    corIcone?: string;
    corFonte?: string;
    corFonteMensagem?: string;
  }): Promise<boolean>;
  limparCustomizacao(): Promise<boolean>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('IdeployTef');
