package com.example.presuprosolv2movil.data.models


import com.google.gson.annotations.SerializedName

/**
 * Modelo para el catálogo completo de mosquiteras
 * Coincide con la respuesta de /api/mosquiteras
 */
data class mosquiterasTablas(
    @SerializedName("accesorios")
    val accesorios: List<AccesorioXX>? = emptyList(),
    @SerializedName("colores")
    val colores: List<Colore>? = emptyList(),
    @SerializedName("medidas")
    val medidas: Medidas? = null
)