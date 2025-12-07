package com.example.presuprosolv2movil.data.models


import com.google.gson.annotations.SerializedName

data class CombinacioneX(
    @SerializedName("acabadoId")
    val acabadoId: String,
    @SerializedName("modeloId")
    val modeloId: String
)