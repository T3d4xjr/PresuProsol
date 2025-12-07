package com.example.presuprosolv2movil.data.models


import com.google.gson.annotations.SerializedName

data class Faq(
    @SerializedName("activo")
    val activo: Boolean,
    @SerializedName("created_at")
    val createdAt: String,
    @SerializedName("id")
    val id: String,
    @SerializedName("orden")
    val orden: Int,
    @SerializedName("pregunta")
    val pregunta: String,
    @SerializedName("respuesta")
    val respuesta: String,
    @SerializedName("updated_at")
    val updatedAt: String
)