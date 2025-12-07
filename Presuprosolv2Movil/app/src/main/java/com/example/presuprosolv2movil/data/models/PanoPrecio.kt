package com.example.presuprosolv2movil.data.models

import com.google.gson.annotations.SerializedName

data class PanoPrecio(
    @SerializedName("id")
    val id: String,
    @SerializedName("modelo_id")
    val modeloId: String,
    @SerializedName("acabado_id")
    val acabadoId: String,
    @SerializedName("precio_m2")
    val precioM2: Double,
    @SerializedName("created_at")
    val createdAt: String
)

