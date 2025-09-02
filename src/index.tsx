import { Platform } from 'react-native';
import IdeployTef from './NativeIdeployTef';

// Tipos públicos da biblioteca
export type TefTipo = 'vender' | 'debito' | 'credito' | 'pix';

export interface IniciarTransacaoParams {
  tipo?: TefTipo;
  valor?: number | string;
  parcelas?: number | string; // apenas para crédito
  financiamento?: number | string; // apenas para crédito
  empresaSitef?: string;
  modalidade?: number | string;
  cnpjCpf?: string;
  documentoFiscal?: string;
}

export interface CancelarTransacaoParams {
  valor?: number | string;
  nsu?: string;
  data?: string; // dd/MM/yy
  empresaSitef?: string;
  cnpjCpf?: string;
}

export interface CustomAplicacaoParams {
  logotipo?: string;
  background?: string;
  gradienteInicio?: string;
  gradienteFim?: string;
}
export interface CustomCabecalhoParams {
  corBotao?: string;
  corIcone?: string;
  corFonte?: string;
}
export interface CustomConteudoParams {
  corBotao?: string;
  corIcone?: string;
  corFonte?: string;
  corFonteMensagem?: string;
}

// Resultado: o IDH retorna JSON (string); aqui padronizamos como objeto.
export type TefRetorno = any;

// Utilitário interno: garante Android e converte retorno string->objeto
function ensureAndroid() {
  if (Platform.OS !== 'android') {
    throw new Error('ideploy-tef: disponível apenas para Android');
  }
}

function parseMaybeJson(ret: any): any {
  if (typeof ret === 'string') {
    try {
      return JSON.parse(ret);
    } catch {
      return ret;
    }
  }
  return ret;
}

/**
 * Inicia uma transação TEF (venda simples, débito, crédito ou PIX).
 * - tipo: 'vender' | 'debito' | 'credito' | 'pix'
 * - valor: número ou string (ex.: 13.00 ou "1300")
 * - parcelas/financiamento: apenas crédito
 * Retorna o JSON do IDH (objeto).
 */
export async function iniciarTransacao(
  params: IniciarTransacaoParams
): Promise<TefRetorno> {
  ensureAndroid();
  const ret = await IdeployTef.iniciarTransacao(params as any);
  return parseMaybeJson(ret);
}

/**
 * Cancela/estorna uma transação informando valor, NSU e data (dd/MM/yy).
 * Retorna o JSON do IDH (objeto).
 */
export async function cancelarTransacao(
  params: CancelarTransacaoParams
): Promise<TefRetorno> {
  ensureAndroid();
  const ret = await IdeployTef.cancelarTransacao(params as any);
  return parseMaybeJson(ret);
}

/**
 * Confirmar transação: no fluxo IDH é automática; este método apenas
 * retorna uma mensagem informativa para compatibilidade.
 */
export async function confirmarTransacao(): Promise<TefRetorno> {
  ensureAndroid();
  const ret = await IdeployTef.confirmarTransacao();
  return parseMaybeJson(ret);
}

// Customização IDH: aplica sem retorno do IDH (retorna boolean)
export async function customizarAplicacao(
  params: CustomAplicacaoParams
): Promise<boolean> {
  ensureAndroid();
  return IdeployTef.customizarAplicacao(params as any);
}
export async function customizarCabecalho(
  params: CustomCabecalhoParams
): Promise<boolean> {
  ensureAndroid();
  return IdeployTef.customizarCabecalho(params as any);
}
export async function customizarConteudo(
  params: CustomConteudoParams
): Promise<boolean> {
  ensureAndroid();
  return IdeployTef.customizarConteudo(params as any);
}
export async function limparCustomizacao(): Promise<boolean> {
  ensureAndroid();
  return IdeployTef.limparCustomizacao();
}

// Função de exemplo mantida do template
export function multiply(a: number, b: number): number {
  return IdeployTef.multiply(a, b);
}
