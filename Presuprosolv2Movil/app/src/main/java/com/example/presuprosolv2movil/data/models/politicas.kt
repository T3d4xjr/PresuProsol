package com.example.presuprosolv2movil.data.models


import com.google.gson.annotations.SerializedName

data class politicas(
    @SerializedName("politica")
    val politica: List<Politica>
)