package com.example.presuprosolv2movil.data.models


import com.google.gson.annotations.SerializedName

data class AccesorioXX(
    @SerializedName("id")
    val id: String,
    @SerializedName("nombre")
    val nombre: String,
    @SerializedName("perimetral")
    val perimetral: Boolean,
    @SerializedName("precio_unit")
    val precioUnit: Double,
    @SerializedName("unidad")
    val unidad: String
)