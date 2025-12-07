package com.example.presuprosolv2movil.data.models


import com.google.gson.annotations.SerializedName

data class Medida(
    @SerializedName("activo")
    val activo: Boolean,
    @SerializedName("alto_mm")
    val altoMm: Int,
    @SerializedName("ancho_mm")
    val anchoMm: Int,
    @SerializedName("created_at")
    val createdAt: String,
    @SerializedName("id")
    val id: String
)