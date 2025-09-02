import {
  cancelarTransacao,
  confirmarTransacao,
  iniciarTransacao,
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

      <View style={styles.buttons}>
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

      <Text style={styles.logTitle}>Retornos</Text>
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
  buttons: { marginVertical: 12, gap: 8 },
  button: {
    backgroundColor: '#1e88e5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  danger: { backgroundColor: '#d32f2f' },
  buttonText: { color: 'white', fontWeight: '600' },
  secondary: {
    borderWidth: 1,
    borderColor: '#1e88e5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryText: { color: '#1e88e5', fontWeight: '600' },
  logTitle: { fontSize: 16, fontWeight: '600', marginTop: 16 },
  log: { fontFamily: 'monospace' },
});
