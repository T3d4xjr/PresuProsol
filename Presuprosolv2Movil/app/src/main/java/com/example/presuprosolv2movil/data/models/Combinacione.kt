package com.example.presuprosolv2movil.data.models


import com.google.gson.annotations.SerializedName

data class Combinacione(
    @SerializedName("alto")
    val alto: Int,
    @SerializedName("ancho")
    val ancho: Int
)