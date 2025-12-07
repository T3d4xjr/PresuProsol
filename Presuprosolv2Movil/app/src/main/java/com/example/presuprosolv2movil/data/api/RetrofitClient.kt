package com.example.presuprosolv2movil.data.api

import com.google.gson.GsonBuilder
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

/**
 * Cliente Retrofit configurado para consumir la API de PresuProsol Web
 *
 * CONFIGURACIÓN:
 * - Cambia USE_LOCALHOST a false para usar la API de producción en Vercel
 * - Cambia LOCALHOST_URL a tu dirección IP local si pruebas en dispositivo físico
 * - Para emulador Android, usa "http://10.0.2.2:3000/" para conectar a localhost
 */
object RetrofitClient {
    // ⚙️ CONFIGURACIÓN: Cambia esto según tu entorno
    private const val USE_LOCALHOST = false  // true = desarrollo, false = producción

    // URLs
    private const val LOCALHOST_URL = "http://192.168.18.10:3000/"  // Tu IP local
    private const val PRODUCTION_URL = "https://presu-prosol.vercel.app/"

    private val BASE_URL = if (USE_LOCALHOST) LOCALHOST_URL else PRODUCTION_URL

    // Logger para debug
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    // Cliente HTTP con configuración
    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    // Configurar Gson para manejar campos null
    private val gson = GsonBuilder()
        .setLenient()
        .create()

    // Instancia de Retrofit
    private val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create(gson))
        .build()

    // API Service
    val api: PresuProsolApi = retrofit.create(PresuProsolApi::class.java)
}

