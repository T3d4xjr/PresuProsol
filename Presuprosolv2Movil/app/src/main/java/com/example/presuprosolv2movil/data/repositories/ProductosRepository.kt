package com.example.presuprosolv2movil.data.repositories

import android.util.Log
import com.example.presuprosolv2movil.data.api.RetrofitClient
import com.example.presuprosolv2movil.data.models.*

object ProductosRepository {
    private const val TAG = "ProductosRepository"

    // ========== MOSQUITERAS ==========

    suspend fun getMosquiterasCatalogo(): Result<mosquiterasTablas> {
        return try {
            val response = RetrofitClient.api.getMosquiterasCatalogo()
            Log.d(TAG, "✅ Catálogo mosquiteras cargado")
            Result.success(response)
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error cargando catálogo mosquiteras", e)
            Result.failure(e)
        }
    }

    // ========== PAÑOS ==========

    suspend fun getPanosCatalogo(): Result<panosTablas> {
        return try {
            val response = RetrofitClient.api.getPanosCatalogo()
            Log.d(TAG, "✅ Catálogo paños cargado")
            Result.success(response)
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error cargando catálogo paños", e)
            Result.failure(e)
        }
    }

    // ========== COMPACTOS ==========

    suspend fun getCompactosCatalogo(): Result<compactosTablas> {
        return try {
            val response = RetrofitClient.api.getCompactosCatalogo()
            Log.d(TAG, "✅ Catálogo compactos cargado")
            Result.success(response)
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error cargando catálogo compactos", e)
            Result.failure(e)
        }
    }

    // ========== PROTECCIÓN SOLAR ==========

    suspend fun getProteccionSolarCatalogo(): Result<proteccionSolarTablas> {
        return try {
            val response = RetrofitClient.api.getProteccionSolarCatalogo()
            Log.d(TAG, "✅ Catálogo protección solar cargado")
            Result.success(response)
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error cargando catálogo protección solar", e)
            Result.failure(e)
        }
    }

    // ========== PUERTAS SECCIONALES ==========

    suspend fun getPuertasSeccionalesCatalogo(): Result<puertasSeccionalesTablas> {
        return try {
            val response = RetrofitClient.api.getPuertasSeccionalesCatalogo()
            Log.d(TAG, "✅ Catálogo puertas seccionales cargado")
            Result.success(response)
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error cargando catálogo puertas seccionales", e)
            Result.failure(e)
        }
    }

    // ========== PÉRGOLAS ==========

    suspend fun getPergolasCatalogo(): Result<pergolasTablas> {
        return try {
            val response = RetrofitClient.api.getPergolasCatalogo()
            Log.d(TAG, "✅ Catálogo pérgolas cargado")
            Result.success(response)
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error cargando catálogo pérgolas", e)
            Result.failure(e)
        }
    }

    // ========== DESCUENTO CLIENTE ==========

    suspend fun getDescuentoCliente(userId: String): Result<Double> {
        return try {
            val response = RetrofitClient.api.getDescuentoCliente(userId)
            Log.d(TAG, "✅ Descuento cliente: ${response.descuento}%")
            Result.success(response.descuento)
        } catch (e: retrofit2.HttpException) {
            if (e.code() == 404) {
                Log.w(TAG, "⚠️ Endpoint de descuento no existe, usando descuento = 0")
            } else {
                Log.e(TAG, "❌ Error HTTP obteniendo descuento cliente: ${e.code()}", e)
            }
            Result.success(0.0) // Si falla, descuento = 0
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error obteniendo descuento cliente", e)
            Result.success(0.0) // Si falla, descuento = 0
        }
    }
}

