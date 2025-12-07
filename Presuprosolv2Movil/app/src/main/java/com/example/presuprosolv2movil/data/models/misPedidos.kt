package com.example.presuprosolv2movil.data.models


import com.google.gson.annotations.SerializedName

data class misPedidos(
    @SerializedName("pedidos")
    val pedidos: List<Pedido>
)