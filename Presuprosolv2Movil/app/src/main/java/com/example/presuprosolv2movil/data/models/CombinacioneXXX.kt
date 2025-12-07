package com.example.presuprosolv2movil.data.models


import com.google.gson.annotations.SerializedName

data class CombinacioneXXX(
    @SerializedName("ancho_mm")
    val anchoMm: Int,
    @SerializedName("color_id")
    val colorId: String,
    @SerializedName("fondo_mm")
    val fondoMm: Int
)