package com.example.presuprosolv2movil.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.example.presuprosolv2movil.data.AuthManager
import com.example.presuprosolv2movil.ui.screens.*

@Composable
fun NavigationGraph(navController: NavHostController) {
    val session by AuthManager.session.collectAsState()

    NavHost(navController = navController, startDestination = Screen.Home.route) {
        // Pantalla principal (pública)
        composable(Screen.Home.route) {
            HomeScreen(
                navController = navController,
                onNavigateToService = { route ->
                    if (session?.access_token != null) {
                        navController.navigate(route)
                    } else {
                        navController.navigate(Screen.Login.route)
                    }
                }
            )
        }

        // Login
        composable(Screen.Login.route) {
            LoginScreen(
                onLoginSuccess = {
                    navController.popBackStack()
                },
                onBack = {
                    navController.popBackStack()
                }
            )
        }

        // Servicios (protegidos)
        composable(Screen.Mosquiteras.route) {
            MosquiterasScreen(navController = navController)
        }
        composable(Screen.Panos.route) {
            PanosScreen(navController = navController)
        }
        composable(Screen.Compactos.route) {
            CompactosScreen(navController = navController)
        }
        composable(Screen.ProteccionSolar.route) {
            ProteccionSolarScreen(navController = navController)
        }
        composable(Screen.PuertasSeccionales.route) {
            PuertasSeccionalesScreen(navController = navController)
        }
        composable(Screen.Pergolas.route) {
            PergolasScreen(navController = navController)
        }

        // Información (todas públicas)
        composable(Screen.Faq.route) {
            FaqScreen(navController = navController)
        }
        composable(Screen.Contacto.route) {
            ContactoScreen(navController = navController)
        }
        composable(Screen.PoliticaPrivacidad.route) {
            PoliticaPrivacidadScreen(navController = navController)
        }
        composable(Screen.TerminosCondiciones.route) {
            TerminosCondicionesScreen(navController = navController)
        }

        // Usuario (protegidas)
        composable(Screen.MisPresupuestos.route) {
            MisPresupuestosScreen(navController = navController)
        }
        composable(Screen.MisPedidos.route) {
            MisPedidosScreen(navController = navController)
        }

        // Detalles (protegidos)
        composable(Screen.DetallePresupuesto.route) { backStackEntry ->
            val id = backStackEntry.arguments?.getString("id") ?: ""
            PlaceholderScreen(title = "Detalle Presupuesto #$id", navController = navController)
        }

        composable(Screen.DetallePedido.route) { backStackEntry ->
            val id = backStackEntry.arguments?.getString("id") ?: ""
            PlaceholderScreen(title = "Detalle Pedido #$id", navController = navController)
        }

        // Configuración de productos (protegidas)
        composable(Screen.MosquiteraConfig.route) { backStackEntry ->
            val tipo = backStackEntry.arguments?.getString("tipo") ?: ""
            MosquiteraConfigScreen(navController = navController, tipo = tipo)
        }

        composable(Screen.PanoConfig.route) { backStackEntry ->
            val tipo = backStackEntry.arguments?.getString("tipo") ?: ""
            PanoConfigScreen(navController = navController, tipo = tipo)
        }

        composable(Screen.CompactoConfig.route) { backStackEntry ->
            val tipo = backStackEntry.arguments?.getString("tipo") ?: ""
            CompactoConfigScreen(navController = navController, tipo = tipo)
        }

        composable(Screen.ProteccionConfig.route) { backStackEntry ->
            val tipo = backStackEntry.arguments?.getString("tipo") ?: ""
            ProteccionSolarConfigScreen(navController = navController, tipo = tipo)
        }

        composable(Screen.PuertaConfig.route) { backStackEntry ->
            val tipo = backStackEntry.arguments?.getString("tipo") ?: ""
            PuertaConfigScreen(navController = navController, tipo = tipo)
        }

        composable(Screen.PergolaConfig.route) { backStackEntry ->
            val tipo = backStackEntry.arguments?.getString("tipo") ?: ""
            PergolaConfigScreen(navController = navController, tipo = tipo)
        }
    }
}

