package com.example.presuprosolv2movil.data.models


import com.google.gson.annotations.SerializedName
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Accesorio(
    @SerializedName("id")
    @SerialName("id")
    val id: String = "",
    @SerializedName("nombre")
    @SerialName("nombre")
    val nombre: String = "",
    @SerializedName("precio_unit")
    @SerialName("precio_unit")
    val precioUnit: Double = 0.0,
    @SerializedName("unidades")
    @SerialName("unidades")
    val unidades: Int = 0
)