package com.example.presuprosolv2movil.data.models


import com.google.gson.annotations.SerializedName

data class Medidas(
    @SerializedName("altos")
    val altos: List<Int>,
    @SerializedName("anchos")
    val anchos: List<Int>,
    @SerializedName("combinaciones")
    val combinaciones: List<Combinacione>
)