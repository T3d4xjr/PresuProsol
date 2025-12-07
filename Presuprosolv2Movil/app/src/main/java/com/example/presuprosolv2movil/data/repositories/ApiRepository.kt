package com.example.presuprosolv2movil.data.repositories

import android.util.Log
import com.example.presuprosolv2movil.data.api.RetrofitClient
import com.example.presuprosolv2movil.data.models.Faq
import com.example.presuprosolv2movil.data.models.Politica
import com.example.presuprosolv2movil.data.models.Termino
import com.example.presuprosolv2movil.navigation.Screen.PoliticaPrivacidad
import com.example.presuprosolv2movil.navigation.Screen.TerminosCondiciones

/**
 * Repositorio para consumir las APIs de PresuProsol Web usando Retrofit
 */
object ApiRepository {
    private const val TAG = "ApiRepository"
    private val api = RetrofitClient.api

    /**
     * Obtiene FAQs activas desde la API web
     */
    suspend fun getFaqs(): List<Faq> {
        return try {
            val response = api.getFaqs()
            val faqs = response.faqs
            Log.d(TAG, "✅ FAQs obtenidas: ${faqs.size}")
            faqs
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error obteniendo FAQs", e)
            emptyList()
        }
    }

    /**
     * Obtiene la política de privacidad activa desde la API web
     */
    suspend fun getPoliticaPrivacidad(): List<Politica> {
        return try {
            val response = api.getPoliticaPrivacidad()
            val politica = response.politica
            Log.d(TAG, "✅ Política de privacidad obtenida: ${politica.size} secciones")
            politica
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error obteniendo política de privacidad", e)
            emptyList()
        }
    }

    /**
     * Obtiene los términos y condiciones activos desde la API web
     */
    suspend fun getTerminos(): List<Termino> {
        return try {
            val response = api.getTerminos()
            val terminos = response.terminos
            Log.d(TAG, "✅ Términos obtenidos: ${terminos.size} secciones")
            terminos
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error obteniendo términos y condiciones", e)
            emptyList()
        }
    }
}

