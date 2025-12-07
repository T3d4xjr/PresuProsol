package com.example.presuprosolv2movil.data.models


import com.google.gson.annotations.SerializedName

/**
 * Modelo para el catálogo completo de paños
 * Coincide con la respuesta de /api/panos
 */
data class panosTablas(
    @SerializedName("acabados")
    val acabados: List<Acabado>? = emptyList(),
    @SerializedName("accesorios")
    val accesorios: List<AccesorioXXX>? = emptyList(),
    @SerializedName("modelos")
    val modelos: List<Modelo>? = emptyList()
)