package com.example.presuprosolv2movil.data.repositories

import android.util.Log
import com.example.presuprosolv2movil.data.SupabaseClient
import com.example.presuprosolv2movil.data.api.RetrofitClient
import com.example.presuprosolv2movil.data.models.Faq
import com.example.presuprosolv2movil.data.models.Pedido
import com.example.presuprosolv2movil.data.models.Politica
import com.example.presuprosolv2movil.data.models.Presupuesto
import com.example.presuprosolv2movil.data.models.Termino
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Columns
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

object GeneralRepository {
    private const val TAG = "GeneralRepository"
    private val supabase = SupabaseClient.client
    private val api = RetrofitClient.api

    /**
     * Obtiene FAQs activas desde la API web
     * Endpoint: https://presu-prosol.vercel.app/api/faqs
     */
    suspend fun fetchFaqsActivas(): List<Faq> {
        return try {
            Log.d(TAG, "🔍 Consultando API web: /api/faqs")

            val response = api.getFaqs()
            val faqs = response.faqs

            Log.d(TAG, "✅ FAQs obtenidas de la API: ${faqs.size}")
            faqs.forEachIndexed { index, faq ->
                Log.d(TAG, "  [$index] orden=${faq.orden}, pregunta=${faq.pregunta}")
            }

            faqs
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error fetching FAQs desde API", e)
            Log.e(TAG, "❌ Error tipo: ${e::class.simpleName}")
            Log.e(TAG, "❌ Error mensaje: ${e.message}")
            Log.e(TAG, "❌ Error causa: ${e.cause?.message}")
            emptyList()
        }
    }

    /**
     * Obtiene política de privacidad activa desde la API web
     * Endpoint: https://presu-prosol.vercel.app/api/politicaPrivacidad
     */
    suspend fun fetchPoliticaPrivacidadActiva(): List<Politica> {
        return try {
            Log.d(TAG, "🔍 Consultando API web: /api/politicaPrivacidad")

            val response = api.getPoliticaPrivacidad()
            val politica = response.politica

            Log.d(TAG, "✅ Secciones de política obtenidas: ${politica.size}")

            politica
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error fetching política desde API", e)
            Log.e(TAG, "❌ Error mensaje: ${e.message}")
            emptyList()
        }
    }

    /**
     * Obtiene términos y condiciones activos desde la API web
     * Endpoint: https://presu-prosol.vercel.app/api/terminos
     */
    suspend fun fetchTerminosActivos(): List<Termino> {
        return try {
            Log.d(TAG, "🔍 Consultando API web: /api/terminos")

            val response = api.getTerminos()
            val terminos = response.terminos

            Log.d(TAG, "✅ Secciones de términos obtenidas: ${terminos.size}")

            terminos
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error fetching términos desde API", e)
            Log.e(TAG, "❌ Error mensaje: ${e.message}")
            emptyList()
        }
    }

    /**
     * Obtiene presupuestos del usuario
     */
    suspend fun fetchPresupuestosUsuario(userId: String): List<Presupuesto> {
        return try {
            supabase.from("presupuestos")
                .select {
                    filter {
                        eq("user_id", userId)
                    }
                }
                .decodeList<Presupuesto>()
                .sortedByDescending { it.createdAt }
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching presupuestos", e)
            emptyList()
        }
    }

    /**
     * Obtiene pedidos del usuario con sus presupuestos relacionados
     */
    suspend fun fetchPedidosUsuario(userId: String): List<Pedido> {
        return try {
            Log.d(TAG, "🔍 Obteniendo pedidos para userId: $userId")

            // Hacer el SELECT con JOIN explícito usando columns
            val pedidos = supabase.from("pedidos")
                .select(columns = Columns.raw("*, presupuestos(*)")) {
                    filter {
                        eq("user_id", userId)
                    }
                }
                .decodeList<Pedido>()
                .sortedByDescending { it.createdAt }

            Log.d(TAG, "✅ Pedidos obtenidos: ${pedidos.size}")

            pedidos.forEachIndexed { index, pedido ->
                Log.d(TAG, "───────────────────────────────────────")
                Log.d(TAG, "Pedido [$index]:")
                Log.d(TAG, "  ID: ${pedido.id}")
                Log.d(TAG, "  PresupuestoId: ${pedido.presupuestoId}")
                Log.d(TAG, "  Total: ${pedido.total}")
                Log.d(TAG, "  Estado: ${pedido.estado}")
                Log.d(TAG, "  CreatedAt: ${pedido.createdAt}")

                // LOG DETALLADO DEL PRESUPUESTO ANIDADO
                if (pedido.presupuestos != null) {
                    Log.d(TAG, "  ✅ Presupuesto anidado encontrado:")
                    Log.d(TAG, "    - tipo: '${pedido.presupuestos.tipo}'")
                    Log.d(TAG, "    - cliente: '${pedido.presupuestos.cliente}'")
                    Log.d(TAG, "    - email: '${pedido.presupuestos.email}'")
                    Log.d(TAG, "    - altoMm: ${pedido.presupuestos.altoMm}")
                    Log.d(TAG, "    - anchoMm: ${pedido.presupuestos.anchoMm}")
                    Log.d(TAG, "    - color: '${pedido.presupuestos.color}'")
                } else {
                    Log.e(TAG, "  ❌ presupuestos es NULL - JOIN no funcionó")
                }
            }

            pedidos
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error fetching pedidos", e)
            Log.e(TAG, "❌ Error tipo: ${e::class.simpleName}")
            Log.e(TAG, "❌ Error mensaje: ${e.message}")
            Log.e(TAG, "❌ Stack trace:")
            e.printStackTrace()
            emptyList()
        }
    }

    /**
     * Elimina un presupuesto
     */
    suspend fun eliminarPresupuesto(id: String): Boolean {
        return try {
            supabase.from("presupuestos")
                .delete {
                    filter {
                        eq("id", id)
                    }
                }
            true
        } catch (e: Exception) {
            Log.e(TAG, "Error eliminando presupuesto", e)
            false
        }
    }

    /**
     * Paga un presupuesto (crea un pedido y marca el presupuesto como pagado)
     */
    suspend fun pagarPresupuesto(presupuestoId: String, userId: String): Boolean {
        return try {
            Log.d(TAG, "💰 Procesando pago para presupuesto: $presupuestoId")

            // 1. Obtener el presupuesto
            val presupuesto = supabase.from("presupuestos")
                .select {
                    filter {
                        eq("id", presupuestoId)
                    }
                }
                .decodeSingle<Presupuesto>()

            Log.d(TAG, "📄 Presupuesto obtenido: ${presupuesto.cliente}")

            // 2. Crear el pedido (solo con las columnas que existen en la tabla)
            val pedidoData = buildJsonObject {
                put("user_id", userId)
                put("presupuesto_id", presupuestoId)
                put("total", presupuesto.total)
                put("estado", "En proceso")
            }

            supabase.from("pedidos")
                .insert(pedidoData)

            Log.d(TAG, "📦 Pedido creado exitosamente")

            // 3. Marcar presupuesto como pagado
            val updateData = buildJsonObject {
                put("pagado", true)
            }

            supabase.from("presupuestos")
                .update(updateData) {
                    filter {
                        eq("id", presupuestoId)
                    }
                }

            Log.d(TAG, "✅ Presupuesto marcado como pagado")

            true
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error procesando pago", e)
            Log.e(TAG, "❌ Error mensaje: ${e.message}")
            false
        }
    }
}

