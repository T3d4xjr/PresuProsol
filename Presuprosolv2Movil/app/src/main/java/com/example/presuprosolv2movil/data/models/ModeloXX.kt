package com.example.presuprosolv2movil.data.models


import com.google.gson.annotations.SerializedName

data class ModeloXX(
    @SerializedName("activo")
    val activo: Boolean,
    @SerializedName("created_at")
    val createdAt: String,
    @SerializedName("descripcion")
    val descripcion: String,
    @SerializedName("id")
    val id: String,
    @SerializedName("incremento_m2")
    val incrementoM2: Int,
    @SerializedName("nombre")
    val nombre: String,
    @SerializedName("tipo")
    val tipo: String
)