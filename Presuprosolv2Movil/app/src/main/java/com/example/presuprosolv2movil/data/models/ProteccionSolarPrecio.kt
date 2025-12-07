package com.example.presuprosolv2movil.data.models

import com.google.gson.annotations.SerializedName

data class ProteccionSolarPrecio(
    @SerializedName("id")
    val id: String,
    @SerializedName("modelo_id")
    val modeloId: String,
    @SerializedName("color_id")
    val colorId: String,
    @SerializedName("precio_m2")
    val precioM2: Double?,
    @SerializedName("precio")
    val precio: Double?,
    @SerializedName("created_at")
    val createdAt: String
)

