package com.example.presuprosolv2movil.data.models


import com.google.gson.annotations.SerializedName

/**
 * Modelo para el catálogo completo de puertas seccionales
 * Coincide con la respuesta de /api/puertasSeccionales
 * Estructura igual a pergolasTablas (sin campo precios)
 */
data class puertasSeccionalesTablas(
    @SerializedName("accesorios")
    val accesorios: List<AccesorioXXXXXX>? = emptyList(),
    @SerializedName("colores")
    val colores: List<ColoreXXX>? = emptyList(),
    @SerializedName("combinaciones")
    val combinaciones: List<CombinacioneXX>? = emptyList(),
    @SerializedName("medidas")
    val medidas: List<Medida>? = emptyList()
)
