package com.example.presuprosolv2movil.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Usuario(
    @SerialName("id")
    val id: String = "",
    @SerialName("usuario")
    val usuario: String = "",
    @SerialName("email")
    val email: String = "",
    @SerialName("cif")
    val cif: String = "",
    @SerialName("habilitado")
    val habilitado: Boolean = true,
    @SerialName("rol")
    val rol: String = "usuario",
    @SerialName("descuento")
    val descuento: Int = 0,
    @SerialName("created_at")
    val createdAt: String = "",
    @SerialName("updated_at")
    val updatedAt: String? = null,
    @SerialName("telefono")
    val telefono: String? = null,
    @SerialName("direccion")
    val direccion: String? = null,
    @SerialName("nacionalidad")
    val nacionalidad: String? = null,
    @SerialName("foto_url")
    val fotoUrl: String? = null
)