package com.example.presuprosolv2movil.data.models


import com.google.gson.annotations.SerializedName

data class AccesorioXXXXX(
    @SerializedName("activo")
    val activo: Boolean,
    @SerializedName("created_at")
    val createdAt: String,
    @SerializedName("id")
    val id: String,
    @SerializedName("imagen")
    val imagen: Any,
    @SerializedName("nombre")
    val nombre: String,
    @SerializedName("pvp")
    val pvp: Int,
    @SerializedName("unidad")
    val unidad: String
)