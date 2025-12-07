package com.example.presuprosolv2movil.data.models


import com.google.gson.annotations.SerializedName

data class Modelo(
    @SerializedName("activo")
    val activo: Boolean,
    @SerializedName("id")
    val id: String,
    @SerializedName("nombre")
    val nombre: String,
    @SerializedName("tipo")
    val tipo: String
)