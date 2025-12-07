package com.example.presuprosolv2movil.data.models

import com.google.gson.annotations.SerializedName

data class CombinacionProteccion(
    @SerializedName("modelo_id")
    val modeloId: String,
    @SerializedName("color_id")
    val colorId: String
)

