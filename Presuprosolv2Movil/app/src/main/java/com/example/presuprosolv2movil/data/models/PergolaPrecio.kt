package com.example.presuprosolv2movil.data.models

import com.google.gson.annotations.SerializedName

data class PergolaPrecio(
    @SerializedName("id")
    val id: String,
    @SerializedName("ancho_mm")
    val anchoMm: Int,
    @SerializedName("fondo_mm")
    val fondoMm: Int,
    @SerializedName("color_id")
    val colorId: String,
    @SerializedName("precio_m2")
    val precioM2: Double,
    @SerializedName("created_at")
    val createdAt: String
)

