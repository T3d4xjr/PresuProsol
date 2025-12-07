package com.example.presuprosolv2movil.data.models


import com.google.gson.annotations.SerializedName

data class Acabado(
    @SerializedName("activo")
    val activo: Boolean,
    @SerializedName("clave")
    val clave: String,
    @SerializedName("id")
    val id: String,
    @SerializedName("nombre")
    val nombre: String,
    @SerializedName("orden")
    val orden: Int
)