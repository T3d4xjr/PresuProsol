package com.example.presuprosolv2movil.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Presupuestos(
    @SerialName("id")
    val id: String = "",
    @SerialName("user_id")
    val userId: String = "",
    @SerialName("tipo")
    val tipo: String = "",
    @SerialName("cliente")
    val cliente: String? = null,
    @SerialName("email")
    val email: String? = null,
    @SerialName("cif")
    val cif: String? = null,
    @SerialName("alto_mm")
    val altoMm: Int = 0,
    @SerialName("ancho_mm")
    val anchoMm: Int = 0,
    @SerialName("color")
    val color: String? = null,
    @SerialName("color_precio")
    val colorPrecio: Double = 0.0,
    @SerialName("modelo")
    val modelo: String? = null,
    @SerialName("acabado")
    val acabado: String? = null,
    @SerialName("medida_precio")
    val medidaPrecio: Double = 0.0,
    @SerialName("accesorios")
    val accesorios: List<AccesorioX> = emptyList(),
    @SerialName("subtotal")
    val subtotal: Double = 0.0,
    @SerialName("descuento_cliente")
    val descuentoCliente: Double = 0.0,
    @SerialName("total")
    val total: Double = 0.0,
    @SerialName("pagado")
    val pagado: Boolean = false,
    @SerialName("invalidado")
    val invalidado: Boolean = false,
    @SerialName("razon_invalidacion")
    val razonInvalidacion: String? = null,
    @SerialName("precio_desactualizado")
    val precioDesactualizado: Boolean = false,
    @SerialName("fecha_desactualizacion")
    val fechaDesactualizacion: String? = null,
    @SerialName("created_at")
    val createdAt: String = "",
    @SerialName("updated_at")
    val updatedAt: String = ""
)