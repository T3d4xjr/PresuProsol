package com.example.presuprosolv2movil.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class MosqMedida(
    val id: String? = null,  // UUID en formato String
    @SerialName("alto_mm") val altoMm: Int,
    @SerialName("ancho_mm") val anchoMm: Int,
    @SerialName("precio_base") val precioBase: Double? = null,
    val precio: Double? = null,
    val activo: Boolean = true,
    @SerialName("created_at") val createdAt: String? = null
)

@Serializable
data class MosqColor(
    val id: String,  // UUID en formato String
    val color: String,
    val precio: Double = 0.0,
    @SerialName("incremento_eur_ml") val incrementoEurMl: Double? = null,
    val activo: Boolean = true,
    val hex: String? = null
)

@Serializable
data class MosqAccesorio(
    val id: String,  // UUID en formato String
    val nombre: String,
    val unidad: String = "ud",
    val perimetral: Boolean = false,
    @SerialName("precio_unit") val precioUnit: Double? = null,
    val precio: Double? = null,
    @SerialName("precio_ud") val precioUd: Double? = null,
    val activo: Boolean = true
) {
    /**
     * Obtiene el precio unitario del accesorio, intentando diferentes campos
     */
    fun getPrecioFinal(): Double {
        return precioUnit ?: precio ?: precioUd ?: 0.0
    }
}

