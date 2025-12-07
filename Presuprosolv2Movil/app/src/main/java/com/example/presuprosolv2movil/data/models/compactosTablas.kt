package com.example.presuprosolv2movil.data.models


import com.google.gson.annotations.SerializedName

/**
 * Modelo para el catálogo completo de compactos
 * Coincide con la respuesta de /api/compactos-api
 * Similar a paños: alto x ancho, modelos, acabados, accesorios
 */
data class compactosTablas(
    @SerializedName("acabados")
    val acabados: List<AcabadoX>? = emptyList(),
    @SerializedName("accesorios")
    val accesorios: List<AccesorioXXXX>? = emptyList(),
    @SerializedName("modelos")
    val modelos: List<ModeloX>? = emptyList()
)