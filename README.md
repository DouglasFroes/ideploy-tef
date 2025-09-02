````markdown
# ideploy-tef

Android-only React Native bridge for Elgin TEF (IDH) — helpers to start TEF intents and apply IDH customizations.

This library provides a thin TurboModule wrapper around the Elgin IDH intents. It is designed for Android devices with the Elgin IDH app installed.

## Installation

```sh
npm install ideploy-tef
```

## Android requirements

- The Elgin IDH (TEF) app must be installed on the device/emulator.
- On Android 11+ the app needs to be able to resolve the IDH intents; see the example manifest in `example/android/app/src/main/AndroidManifest.xml` for <queries> entries.

## Quick usage (JavaScript / TypeScript)

```ts
import {
	iniciarTransacao,
	cancelarTransacao,
	confirmarTransacao,
	customizarAplicacao,
	customizarCabecalho,
	customizarConteudo,
	limparCustomizacao,
} from 'ideploy-tef';

// iniciarTransacao: envia um Intent TEF para o IDH.
// params: { tipo: 'vender'|'debito'|'credito'|'pix'|..., valor: '1.00', parcelas?: '1', ... }
const resultado = await iniciarTransacao({ tipo: 'vender', valor: '10.00' });

// cancelarTransacao: solicita cancelamento passando nsu/data/valor quando disponível
const cancelRet = await cancelarTransacao({ valor: '10.00', nsu: '123456', data: '10/05/23' });

// confirmarTransacao: (liberação para confirmar fluxo quando necessário)
const ok = await confirmarTransacao();

// Customização (IDH custom intent)
await customizarAplicacao({ background: '#0099FF' });
await customizarCabecalho({ corBotao: '#363636', corFonte: '#FFC321' });
await limparCustomizacao();
```

See `src/index.tsx` for typings and the complete API surface.

## Example app

The repository includes a runnable example at `example/`. Open the example in Android Studio or run the metro/dev workflow from the repository root:

```powershell
# from repository root on Windows (PowerShell)
yarn prepare
yarn example
```

## Contributing

- See `CONTRIBUTING.md` for the development workflow and pull request guidelines.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)

````
