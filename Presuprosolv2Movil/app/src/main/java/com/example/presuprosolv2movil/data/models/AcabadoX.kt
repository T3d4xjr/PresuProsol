package com.example.presuprosolv2movil.data.models


import com.google.gson.annotations.SerializedName

data class AcabadoX(
    @SerializedName("activo")
    val activo: Boolean,
    @SerializedName("clave")
    val clave: String,
    @SerializedName("created_at")
    val createdAt: String,
    @SerializedName("id")
    val id: String,
    @SerializedName("nombre")
    val nombre: String,
    @SerializedName("orden")
    val orden: Int
)