package com.example.presuprosolv2movil.data.models


import com.google.gson.annotations.SerializedName

data class ModeloX(
    @SerializedName("activo")
    val activo: Boolean,
    @SerializedName("created_at")
    val createdAt: String,
    @SerializedName("id")
    val id: String,
    @SerializedName("nombre")
    val nombre: String,
    @SerializedName("tipo")
    val tipo: String
)