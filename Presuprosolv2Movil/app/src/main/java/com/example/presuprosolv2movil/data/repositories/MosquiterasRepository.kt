package com.example.presuprosolv2movil.data.repositories

import android.util.Log
import com.example.presuprosolv2movil.data.SupabaseClient
import com.example.presuprosolv2movil.data.models.AdministracionUsuario
import com.example.presuprosolv2movil.data.models.MosqAccesorio
import com.example.presuprosolv2movil.data.models.MosqColor
import com.example.presuprosolv2movil.data.models.MosqMedida
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Columns
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

object MosquiterasRepository {
    private const val TAG = "MosquiterasRepository"
    private val supabase = SupabaseClient.client

    /**
     * Obtiene el precio base para una medida exacta
     */
    suspend fun getMosqBasePrice(alto: Int, ancho: Int): Double? {
        return try {
            val result = supabase.from("mosq_medidas")
                .select {
                    filter {
                        eq("alto_mm", alto)
                        eq("ancho_mm", ancho)
                    }
                }
                .decodeSingleOrNull<MosqMedida>()

            result?.let { it.precioBase ?: it.precio }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting base price", e)
            null
        }
    }

    /**
     * Obtiene todas las medidas con sus combinaciones válidas
     */
    suspend fun fetchMosqMedidas(): Triple<List<Int>, List<Int>, List<Pair<Int, Int>>> {
        return try {
            val medidas = supabase.from("mosq_medidas")
                .select()
                .decodeList<MosqMedida>()

            // Filtrar solo las que tienen precio > 0
            val conPrecio = medidas.filter { medida ->
                val precio = medida.precioBase ?: medida.precio ?: 0.0
                precio > 0
            }

            val altos = conPrecio.map { it.altoMm }.distinct().sorted()
            val anchos = conPrecio.map { it.anchoMm }.distinct().sorted()
            val combinaciones = conPrecio.map { it.altoMm to it.anchoMm }

            Triple(altos, anchos, combinaciones)
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching medidas", e)
            Triple(emptyList(), emptyList(), emptyList())
        }
    }

    /**
     * Obtiene colores y accesorios activos
     */
    suspend fun fetchMosqOptions(): Pair<List<MosqColor>, List<MosqAccesorio>> {
        return try {
            // Colores
            val colores = supabase.from("mosq_colores")
                .select {
                    filter {
                        eq("activo", true)
                    }
                }
                .decodeList<MosqColor>()

            // Accesorios
            val accesorios = supabase.from("mosq_accesorios")
                .select {
                    filter {
                        eq("activo", true)
                    }
                }
                .decodeList<MosqAccesorio>()

            Pair(colores, accesorios)
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching options", e)
            Pair(emptyList(), emptyList())
        }
    }

    /**
     * Obtiene el descuento del cliente
     */
    suspend fun fetchMosqDescuentoCliente(userId: String): Double {
        if (userId.isBlank()) return 0.0

        return try {
            val usuario = supabase.from("administracion_usuarios")
                .select {
                    filter {
                        or {
                            eq("auth_user_id", userId)
                            eq("id", userId)
                        }
                    }
                }
                .decodeSingleOrNull<AdministracionUsuario>()

            val descuentoInt = usuario?.descuento ?: usuario?.descuentoCliente ?: 0
            descuentoInt.toDouble()
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching descuento", e)
            0.0
        }
    }

    /**
     * Inserta un presupuesto de mosquitera
     */
    suspend fun insertarPresupuestoMosq(presupuesto: Map<String, Any?>): Result<String> {
        return try {
            val json = buildJsonObject {
                presupuesto.forEach { (key, value) ->
                    when (value) {
                        is String -> put(key, value)
                        is Number -> put(key, value)
                        is Boolean -> put(key, value)
                        null -> put(key, "")
                        else -> put(key, value.toString())
                    }
                }
            }

            supabase.from("presupuestos")
                .insert(json)

            Result.success("Presupuesto creado exitosamente")
        } catch (e: Exception) {
            Log.e(TAG, "Error insertando presupuesto", e)
            Result.failure(e)
        }
    }

    /**
     * Calcula el incremento por color (perímetro en ml * precio_ml)
     */
    fun calcColorIncrement(alto: Int, ancho: Int, incrementoEurMl: Double): Double {
        val perimetroMl = (2 * (alto + ancho)) / 1000.0
        return (perimetroMl * incrementoEurMl).let {
            (it * 100).toInt() / 100.0 // Redondeo a 2 decimales
        }
    }

    /**
     * Calcula el total de accesorios
     */
    fun calcAccesoriosTotal(accesorios: List<Triple<MosqAccesorio, Int, Double>>): Double {
        return accesorios.sumOf { (acc, unidades, precioUnit) ->
            precioUnit * unidades
        }.let { (it * 100).toInt() / 100.0 }
    }

    /**
     * Aplica descuento porcentual
     */
    fun applyDiscount(subtotal: Double, descuentoPct: Double): Double {
        val total = subtotal * (1 - descuentoPct / 100)
        return (total * 100).toInt() / 100.0
    }
}

