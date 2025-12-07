package com.example.presuprosolv2movil.data.models


import com.google.gson.annotations.SerializedName

data class ColoreX(
    @SerializedName("activo")
    val activo: Boolean,
    @SerializedName("clave")
    val clave: String,
    @SerializedName("created_at")
    val createdAt: String,
    @SerializedName("id")
    val id: String,
    @SerializedName("incremento_ml")
    val incrementoMl: Int,
    @SerializedName("nombre")
    val nombre: String,
    @SerializedName("orden")
    val orden: Int
)