package com.example.presuprosolv2movil.data.models


import com.google.gson.annotations.SerializedName

data class CombinacioneXX(
    @SerializedName("alto_mm")
    val altoMm: Int,
    @SerializedName("ancho_mm")
    val anchoMm: Int,
    @SerializedName("color_id")
    val colorId: String
)