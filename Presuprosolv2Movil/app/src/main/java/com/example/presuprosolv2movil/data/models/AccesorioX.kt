package com.example.presuprosolv2movil.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class AccesorioX(
    @SerialName("id")
    val id: String = "",
    @SerialName("nombre")
    val nombre: String = "",
    @SerialName("precio_unit")
    val precioUnit: Double = 0.0,
    @SerialName("unidades")
    val unidades: Int = 0
)