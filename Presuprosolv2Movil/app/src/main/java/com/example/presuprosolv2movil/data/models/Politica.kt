package com.example.presuprosolv2movil.data.models


import com.google.gson.annotations.SerializedName

data class Politica(
    @SerializedName("activo")
    val activo: Boolean,
    @SerializedName("contenido")
    val contenido: String,
    @SerializedName("created_at")
    val createdAt: String,
    @SerializedName("id")
    val id: String,
    @SerializedName("orden")
    val orden: Int,
    @SerializedName("titulo")
    val titulo: String,
    @SerializedName("updated_at")
    val updatedAt: String
)