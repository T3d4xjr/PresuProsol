package com.example.presuprosolv2movil.data.models

import com.google.gson.annotations.SerializedName

data class PuertaPrecio(
    @SerializedName("id")
    val id: String,
    @SerializedName("ancho_mm")
    val anchoMm: Int,
    @SerializedName("alto_mm")
    val altoMm: Int,
    @SerializedName("color_id")
    val colorId: String,
    @SerializedName("precio")
    val precio: Double,
    @SerializedName("created_at")
    val createdAt: String
)

