package com.ideploytef

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.module.annotations.ReactModule
import android.app.Activity
import android.content.Intent
import android.os.Bundle

@ReactModule(name = IdeployTefModule.NAME)
class IdeployTefModule(reactContext: ReactApplicationContext) :
  NativeIdeployTefSpec(reactContext) {

  override fun getName(): String {
    return NAME
  }

  // Example method
  // See https://reactnative.dev/docs/native-modules-android
  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  // --- TEF via Intent Digital Hub (Android only) ---
  // We communicate with the IDH application using implicit intents.
  // Action string provided by Elgin IDH docs: "com.elgin.e1.digitalhub.TEF".
  private val tefAction = "com.elgin.e1.digitalhub.TEF"
  private val tefRequestCode = 1234
  private val customAction = "com.elgin.tefhub.CUSTOM"

  // We keep a single pending promise to serialize TEF calls.
  private var pendingPromise: Promise? = null
  private var pendingFuncao: String? = null

  private val activityEventListener: ActivityEventListener = object : BaseActivityEventListener() {
    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
      if (requestCode != tefRequestCode) return
      val promise = pendingPromise
      pendingPromise = null

      if (promise == null) return

      try {
        if (resultCode != Activity.RESULT_OK) {
          promise.reject("E_TEFACTION_CANCELLED", "Ação TEF cancelada ou falhou (resultCode=$resultCode)")
          return
        }

        // The IDH TEF app returns a JSON string in the intent extras (commonly under key "retorno").
        val retorno = data?.getStringExtra("retorno")
        if (retorno != null) {
          promise.resolve(retorno)
        } else {
          // If no retorno key, try to collect all extras as a map and return JSON.
          val extras = data?.extras
          if (extras != null) {
            val map: WritableMap = Arguments.createMap()
            for (key in extras.keySet()) {
              val value = extras.get(key)
              when (value) {
                null -> map.putNull(key)
                is String -> map.putString(key, value)
                is Int -> map.putInt(key, value)
                is Double -> map.putDouble(key, value)
                is Boolean -> map.putBoolean(key, value)
                else -> map.putString(key, value.toString())
              }
            }
            promise.resolve(map)
          } else {
            promise.resolve(null)
          }
        }
      } catch (e: Exception) {
        promise.reject("E_TEFACTION_RESULT", e)
      }
    }
  }

  init {
    reactApplicationContext.addActivityEventListener(activityEventListener)
  }

  private fun requireActivity(promise: Promise): Activity? {
    val activity = currentActivity
    if (activity == null) {
      promise.reject("E_NO_ACTIVITY", "Activity não disponível")
      return null
    }
    return activity
  }

  private fun startTefIntent(funcao: String, extras: Bundle, promise: Promise) {
    if (pendingPromise != null) {
      promise.reject("E_TEFACTION_PENDING", "Já existe uma chamada TEF em andamento")
      return
    }
    val activity = requireActivity(promise) ?: return

    val intent = Intent(tefAction).apply {
      putExtra("funcao", funcao)
      putExtras(extras)
    }

    try {
      pendingPromise = promise
      pendingFuncao = funcao
      activity.startActivityForResult(intent, tefRequestCode)
    } catch (e: Exception) {
      pendingPromise = null
      pendingFuncao = null
      promise.reject("E_TEFACTION_START", e)
    }
  }

  private fun getStringValue(params: ReadableMap, key: String): String? {
    if (!params.hasKey(key) || params.isNull(key)) return null
    return when (params.getType(key)) {
      ReadableType.String -> params.getString(key)
      ReadableType.Number -> {
        val num = params.getDouble(key)
        if (kotlin.math.abs(num % 1.0) < 1e-9) num.toInt().toString()
        else String.format(java.util.Locale.US, "%.2f", num)
      }
      ReadableType.Boolean -> if (params.getBoolean(key)) "1" else "0"
      else -> null
    }
  }

  private fun startCustomIntent(extras: Bundle, promise: Promise) {
    val activity = requireActivity(promise) ?: return
    val intent = Intent(customAction).apply { putExtras(extras) }
    try {
      activity.startActivity(intent)
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("E_TEFCUSTOM_START", e)
    }
  }

  // Inicia uma transação TEF. Suporta vender, debito, credito e pix, com parâmetros opcionais.
  override fun iniciarTransacao(params: ReadableMap, promise: Promise) {
    val funcao = when (params.getString("tipo")?.lowercase()) {
      "debito" -> "debito"
      "credito" -> "credito"
      "pix" -> "pix"
      else -> "vender" // padrão: venda simples
    }

    val extras = Bundle()
    // Valor pode ser passado como string ("1300") ou número (13.00). O IDH aceita sem ponto em alguns exemplos.
    getStringValue(params, "valor")?.let { extras.putString("valor", it) }
    if (funcao == "credito") {
      getStringValue(params, "parcelas")?.let { extras.putString("parcelas", it) }
      getStringValue(params, "financiamento")?.let { extras.putString("financiamento", it) }
    }

    // Parâmetros gerais (quando aplicável); são opcionais aqui.
    if (params.hasKey("empresaSitef") && !params.isNull("empresaSitef"))
      extras.putString("empresaSitef", params.getString("empresaSitef"))
  getStringValue(params, "modalidade")?.let { extras.putString("modalidade", it) }
    if (params.hasKey("cnpjCpf") && !params.isNull("cnpjCpf"))
      extras.putString("cnpjCpf", params.getString("cnpjCpf"))
    if (params.hasKey("documentoFiscal") && !params.isNull("documentoFiscal"))
      extras.putString("documentoFiscal", params.getString("documentoFiscal"))

    startTefIntent(funcao, extras, promise)
  }

  // Cancelamento de uma transação TEF (estorno) informando valor, NSU e data.
  override fun cancelarTransacao(params: ReadableMap, promise: Promise) {
    val extras = Bundle()
  getStringValue(params, "valor")?.let { extras.putString("valor", it) }
    if (params.hasKey("nsu") && !params.isNull("nsu")) extras.putString("nsu", params.getString("nsu"))
    if (params.hasKey("data") && !params.isNull("data")) extras.putString("data", params.getString("data"))

    // Parâmetros opcionais auxiliares
    if (params.hasKey("empresaSitef") && !params.isNull("empresaSitef"))
      extras.putString("empresaSitef", params.getString("empresaSitef"))
    if (params.hasKey("cnpjCpf") && !params.isNull("cnpjCpf"))
      extras.putString("cnpjCpf", params.getString("cnpjCpf"))

    startTefIntent("cancelar", extras, promise)
  }

  // Confirmação no fluxo IDH/ElginTef é automática; expomos um método para compatibilidade.
  // Ele simplesmente resolve com uma mensagem informativa.
  override fun confirmarTransacao(promise: Promise) {
    val map: WritableMap = Arguments.createMap()
    map.putString("funcao", "confirmar")
    map.putString("mensagem", "Confirmação não é necessária no IDH TEF: o commit é automático.")
    promise.resolve(map)
  }

  // --- Customização via IDH Customização Android ---
  // https://elgindevelopercommunity.github.io/group__idh210.html
  override fun customizarAplicacao(params: ReadableMap, promise: Promise) {
    val extras = Bundle()
    extras.putString("grupo", "application")
    getStringValue(params, "logotipo")?.let { extras.putString("logotipo", it) }
    getStringValue(params, "background")?.let { extras.putString("background", it) }
    getStringValue(params, "gradienteInicio")?.let { extras.putString("gradienteInicio", it) }
    getStringValue(params, "gradienteFim")?.let { extras.putString("gradienteFim", it) }
    startCustomIntent(extras, promise)
  }

  override fun customizarCabecalho(params: ReadableMap, promise: Promise) {
    val extras = Bundle()
    extras.putString("grupo", "header")
    getStringValue(params, "corBotao")?.let { extras.putString("corBotao", it) }
    getStringValue(params, "corIcone")?.let { extras.putString("corIcone", it) }
    getStringValue(params, "corFonte")?.let { extras.putString("corFonte", it) }
    startCustomIntent(extras, promise)
  }

  override fun customizarConteudo(params: ReadableMap, promise: Promise) {
    val extras = Bundle()
    extras.putString("grupo", "content")
    getStringValue(params, "corBotao")?.let { extras.putString("corBotao", it) }
    getStringValue(params, "corIcone")?.let { extras.putString("corIcone", it) }
    getStringValue(params, "corFonte")?.let { extras.putString("corFonte", it) }
    getStringValue(params, "corFonteMensagem")?.let { extras.putString("corFonteMensagem", it) }
    startCustomIntent(extras, promise)
  }

  override fun limparCustomizacao(promise: Promise) {
    val extras = Bundle()
    extras.putString("funcao", "clear")
    startCustomIntent(extras, promise)
  }

  companion object {
    const val NAME = "IdeployTef"
  }
}
