package com.example.presuprosolv2movil.data.models

import com.google.gson.annotations.SerializedName

/**
 * Modelos de respuesta para las APIs de PresuProsol Web
 * Las APIs de Next.js suelen devolver objetos que envuelven los datos
 */

// Respuesta genérica que puede contener un array de datos
data class ApiListResponse<T>(
    @SerializedName("data")
    val data: List<T>? = null,

    // Intentar también con el nombre del recurso
    @SerializedName("faqs")
    val faqs: List<Faq>? = null,

    @SerializedName("politica")
    val politica: List<Politica>? = null,

    @SerializedName("terminos")
    val terminos: List<Termino>? = null
)

// Si la API devuelve directamente los FAQs sin wrapper
typealias FaqsResponse = List<Faq>

// Si la API devuelve un objeto con propiedad 'faqs'
data class FaqsWrapper(
    @SerializedName("faqs")
    val faqs: List<Faq>
)

// Si la API devuelve un objeto con propiedad 'politica'
data class PoliticaWrapper(
    @SerializedName("politica")
    val politica: List<Politica>
)

// Si la API devuelve un objeto con propiedad 'terminos'
data class TerminosWrapper(
    @SerializedName("terminos")
    val terminos: List<Termino>
)

