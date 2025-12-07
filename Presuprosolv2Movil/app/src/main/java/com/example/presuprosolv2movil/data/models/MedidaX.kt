package com.example.presuprosolv2movil.data.models


import com.google.gson.annotations.SerializedName

data class MedidaX(
    @SerializedName("activo")
    val activo: Boolean,
    @SerializedName("ancho_mm")
    val anchoMm: Int,
    @SerializedName("created_at")
    val createdAt: String,
    @SerializedName("fondo_mm")
    val fondoMm: Int,
    @SerializedName("id")
    val id: String
)