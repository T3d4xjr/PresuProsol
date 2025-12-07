package com.example.presuprosolv2movil.data.models


import com.google.gson.annotations.SerializedName

data class misPresupuestos(
    @SerializedName("presupuestos")
    val presupuestos: List<Presupuesto>
)