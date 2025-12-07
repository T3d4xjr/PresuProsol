package com.example.presuprosolv2movil.data.models

import com.google.gson.annotations.SerializedName

data class CompactoPrecio(
    @SerializedName("id")
    val id: String,
    @SerializedName("modelo_id")
    val modeloId: String,
    @SerializedName("acabado_id")
    val acabadoId: String,
    @SerializedName("precio_ml")
    val precioMl: Double,
    @SerializedName("created_at")
    val createdAt: String
)

