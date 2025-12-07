package com.example.presuprosolv2movil.data.models


import com.google.gson.annotations.SerializedName

data class Colore(
    @SerializedName("hex")
    val hex: String,
    @SerializedName("id")
    val id: String,
    @SerializedName("incremento_eur_ml")
    val incrementoEurMl: Double,
    @SerializedName("nombre")
    val nombre: String
)