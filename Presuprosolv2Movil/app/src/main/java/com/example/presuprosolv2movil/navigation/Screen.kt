package com.example.presuprosolv2movil.navigation

sealed class Screen(val route: String) {
    object Home : Screen("home")
    object Login : Screen("login")

    // Servicios principales
    object Mosquiteras : Screen("mosquiteras")
    object Panos : Screen("panos")
    object Compactos : Screen("compactos")
    object ProteccionSolar : Screen("proteccion_solar")
    object PuertasSeccionales : Screen("puertas_seccionales")
    object Pergolas : Screen("pergolas")

    // Información
    object Faq : Screen("faq")
    object Contacto : Screen("contacto")
    object PoliticaPrivacidad : Screen("politica_privacidad")
    object TerminosCondiciones : Screen("terminos_condiciones")

    // Usuario
    object MisPresupuestos : Screen("mis_presupuestos")
    object MisPedidos : Screen("mis_pedidos")

    // Detalle de presupuesto
    object DetallePresupuesto : Screen("presupuesto/{id}") {
        fun createRoute(id: String) = "presupuesto/$id"
    }

    // Detalle de pedido
    object DetallePedido : Screen("pedido/{id}") {
        fun createRoute(id: String) = "pedido/$id"
    }

    // Configuración de productos
    object MosquiteraConfig : Screen("mosquitera_config/{tipo}") {
        fun createRoute(tipo: String) = "mosquitera_config/$tipo"
    }

    object PanoConfig : Screen("pano_config/{tipo}") {
        fun createRoute(tipo: String) = "pano_config/$tipo"
    }

    object CompactoConfig : Screen("compacto_config/{tipo}") {
        fun createRoute(tipo: String) = "compacto_config/$tipo"
    }

    object ProteccionConfig : Screen("proteccion_config/{tipo}") {
        fun createRoute(tipo: String) = "proteccion_config/$tipo"
    }

    object PuertaConfig : Screen("puerta_config/{tipo}") {
        fun createRoute(tipo: String) = "puerta_config/$tipo"
    }

    object PergolaConfig : Screen("pergola_config/{tipo}") {
        fun createRoute(tipo: String) = "pergola_config/$tipo"
    }
}

