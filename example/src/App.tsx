import {
  cancelarTransacao,
  confirmarTransacao,
  customizarAplicacao,
  customizarCabecalho,
  customizarConteudo,
  iniciarTransacao,
  limparCustomizacao,
} from 'ideploy-tef';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function App() {
  const [valor, setValor] = useState('1.00');
  const [parcelas, setParcelas] = useState('1');
  const [log, setLog] = useState('');
  const [nsu, setNsu] = useState('');
  const [data, setData] = useState('10/05/23');

  function appendLog(title: string, result: any) {
    setLog((l) => `${title}:\n${JSON.stringify(result, null, 2)}\n\n` + l);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Exemplo TEF (Android)</Text>

      {/* Seção: Parâmetros básicos */}
      <Text style={styles.sectionTitle}>Parâmetros</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Valor:</Text>
        <TextInput style={styles.input} value={valor} onChangeText={setValor} />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Parcelas:</Text>
        <TextInput
          style={styles.input}
          value={parcelas}
          onChangeText={setParcelas}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>NSU:</Text>
        <TextInput style={styles.input} value={nsu} onChangeText={setNsu} />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Data:</Text>
        <TextInput style={styles.input} value={data} onChangeText={setData} />
      </View>

      {/* Seção: Transações */}
      <Text style={styles.sectionTitle}>Transações</Text>
      <View style={styles.buttonsRow}>
        <Pressable
          style={styles.button}
          onPress={async () => {
            try {
              const ret = await iniciarTransacao({ tipo: 'vender', valor });
              appendLog('Venda', ret);
            } catch (e) {
              appendLog('Erro Venda', String(e));
            }
          }}
        >
          <Text style={styles.buttonText}>Vender</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={async () => {
            try {
              const ret = await iniciarTransacao({ tipo: 'debito', valor });
              appendLog('Débito', ret);
            } catch (e) {
              appendLog('Erro Débito', String(e));
            }
          }}
        >
          <Text style={styles.buttonText}>Débito</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={async () => {
            try {
              const ret = await iniciarTransacao({
                tipo: 'credito',
                valor,
                parcelas,
                financiamento: '3',
              });
              appendLog('Crédito', ret);
            } catch (e) {
              appendLog('Erro Crédito', String(e));
            }
          }}
        >
          <Text style={styles.buttonText}>Crédito</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={async () => {
            try {
              const ret = await iniciarTransacao({ tipo: 'pix', valor });
              appendLog('PIX', ret);
            } catch (e) {
              appendLog('Erro PIX', String(e));
            }
          }}
        >
          <Text style={styles.buttonText}>PIX</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.danger]}
          onPress={async () => {
            try {
              const ret = await cancelarTransacao({ valor, nsu, data });
              appendLog('Cancelamento', ret);
            } catch (e) {
              appendLog('Erro Cancelamento', String(e));
            }
          }}
        >
          <Text style={styles.buttonText}>Cancelar</Text>
        </Pressable>

        <Pressable
          style={styles.secondary}
          onPress={async () => {
            try {
              const ret = await confirmarTransacao();
              appendLog('Confirmar (no-op)', ret);
            } catch (e) {
              appendLog('Erro Confirmar', String(e));
            }
          }}
        >
          <Text style={styles.secondaryText}>Confirmar (no-op)</Text>
        </Pressable>
      </View>

      {/* Seção: Customização */}
      <Text style={styles.sectionTitle}>Customização</Text>
      <View style={styles.buttonsRow}>
        <Pressable
          style={styles.button}
          onPress={async () => {
            try {
              const ok = await customizarAplicacao({ background: '#0099FF' });
              appendLog('Custom Aplicação (cor sólida)', { ok });
            } catch (e) {
              appendLog('Erro Custom Aplicação', String(e));
            }
          }}
        >
          <Text style={styles.buttonText}>Aplicação (cor)</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={async () => {
            try {
              const ok = await customizarAplicacao({
                gradienteInicio: '#C6C6C6',
                gradienteFim: '#6F5E21',
              });
              appendLog('Custom Aplicação (gradiente)', { ok });
            } catch (e) {
              appendLog('Erro Custom Gradiente', String(e));
            }
          }}
        >
          <Text style={styles.buttonText}>Aplicação (gradiente)</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={async () => {
            try {
              const ok = await customizarCabecalho({
                corBotao: '#363636',
                corIcone: '#FFC321',
                corFonte: '#FFC321',
              });
              appendLog('Custom Cabeçalho', { ok });
            } catch (e) {
              appendLog('Erro Custom Cabeçalho', String(e));
            }
          }}
        >
          <Text style={styles.buttonText}>Cabeçalho</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={async () => {
            try {
              const ok = await customizarConteudo({
                corBotao: '#363636',
                corIcone: '#6F5E21',
                corFonte: '#FFC321',
                corFonteMensagem: '#4F5C7C',
              });
              appendLog('Custom Conteúdo', { ok });
            } catch (e) {
              appendLog('Erro Custom Conteúdo', String(e));
            }
          }}
        >
          <Text style={styles.buttonText}>Conteúdo</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.warning]}
          onPress={async () => {
            try {
              const ok = await limparCustomizacao();
              appendLog('Limpar Customização', { ok });
            } catch (e) {
              appendLog('Erro Limpar Customização', String(e));
            }
          }}
        >
          <Text style={styles.buttonText}>Limpar Customização</Text>
        </Pressable>
      </View>

      {/* Seção: Logs */}
      <View style={styles.logsHeader}>
        <Text style={styles.logTitle}>Retornos</Text>
        <Pressable style={styles.clear} onPress={() => setLog('')}>
          <Text style={styles.clearText}>Limpar logs</Text>
        </Pressable>
      </View>
      <Text selectable style={styles.log}>
        {log || 'Sem logs ainda.'}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  label: { width: 80 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 8,
    height: 40,
    borderRadius: 6,
  },
  buttonsRow: {
    marginVertical: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    backgroundColor: '#1e88e5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 140,
  },
  danger: { backgroundColor: '#d32f2f' },
  warning: { backgroundColor: '#f57c00' },
  buttonText: { color: 'white', fontWeight: '600' },
  secondary: {
    borderWidth: 1,
    borderColor: '#1e88e5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 140,
  },
  secondaryText: { color: '#1e88e5', fontWeight: '600' },
  logsHeader: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logTitle: { fontSize: 16, fontWeight: '600' },
  clear: {
    borderWidth: 1,
    borderColor: '#aaa',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  clearText: { color: '#555', fontWeight: '600' },
  log: { fontFamily: 'monospace' },
});
