package com.example.presuprosolv2movil.data.models


import com.google.gson.annotations.SerializedName

/**
 * Modelo para el catálogo completo de protección solar
 * Coincide con la respuesta de /api/proteccionSolar
 */
data class proteccionSolarTablas(
    @SerializedName("accesorios")
    val accesorios: List<AccesorioXXXXX>? = emptyList(),
    @SerializedName("colores")
    val colores: List<ColoreX>? = emptyList(),
    @SerializedName("combinaciones")
    val combinaciones: List<CombinacionProteccion>? = emptyList(),
    @SerializedName("modelos")
    val modelos: List<ModeloXX>? = emptyList()
)