package com.example.presuprosolv2movil.data.api

import com.example.presuprosolv2movil.data.models.*
import retrofit2.http.GET
import retrofit2.http.Query

interface PresuProsolApi {

    @GET("api/faqs")
    suspend fun getFaqs(): FaqsWrapper


    @GET("api/politicaPrivacidad")
    suspend fun getPoliticaPrivacidad(): PoliticaWrapper

    @GET("api/terminos")
    suspend fun getTerminos(): TerminosWrapper


    @GET("api/mosquiteras")
    suspend fun getMosquiterasCatalogo(): mosquiterasTablas

    @GET("api/panos")
    suspend fun getPanosCatalogo(): panosTablas

    @GET("api/compactos-api")
    suspend fun getCompactosCatalogo(): compactosTablas

    @GET("api/proteccionSolar")
    suspend fun getProteccionSolarCatalogo(): proteccionSolarTablas

    @GET("api/puertasSeccionales")
    suspend fun getPuertasSeccionalesCatalogo(): puertasSeccionalesTablas

    @GET("api/pergolas")
    suspend fun getPergolasCatalogo(): pergolasTablas

    @GET("api/descuento")
    suspend fun getDescuentoCliente(@Query("userId") userId: String): DescuentoResponse
}

