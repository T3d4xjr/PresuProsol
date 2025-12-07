package com.example.presuprosolv2movil.data.models


import com.google.gson.annotations.SerializedName

/**
 * Modelo para el catálogo completo de pérgolas
 * Coincide con la respuesta de /api/pergolas
 */
data class pergolasTablas(
    @SerializedName("accesorios")
    val accesorios: List<AccesorioXXXXXXX>? = emptyList(),
    @SerializedName("colores")
    val colores: List<ColoreXXX>? = emptyList(),
    @SerializedName("combinaciones")
    val combinaciones: List<CombinacioneXXX>? = emptyList(),
    @SerializedName("medidas")
    val medidas: List<MedidaX>? = emptyList()
)