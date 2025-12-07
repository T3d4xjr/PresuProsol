package com.example.presuprosolv2movil.data.models


import com.google.gson.annotations.SerializedName

data class AccesorioXXX(
    @SerializedName("activo")
    val activo: Boolean,
    @SerializedName("id")
    val id: String,
    @SerializedName("nombre")
    val nombre: String,
    @SerializedName("pvp")
    val pvp: Double,
    @SerializedName("unidad")
    val unidad: String
)