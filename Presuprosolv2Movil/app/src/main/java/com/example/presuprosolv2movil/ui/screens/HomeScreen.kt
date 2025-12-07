// kotlin
package com.example.presuprosolv2movil.ui.screens

import android.content.Intent
import androidx.core.net.toUri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.presuprosolv2movil.data.AuthManager
import com.example.presuprosolv2movil.navigation.Screen
import com.example.presuprosolv2movil.ui.components.Header
import com.example.presuprosolv2movil.ui.components.LoginAlert
import com.example.presuprosolv2movil.ui.components.ServiceCard
import kotlinx.coroutines.launch

data class ServiceItem(
    val title: String,
    val route: String,
    val imageRes: Int
)

@Composable
fun HomeScreen(
    navController: NavController,
    onNavigateToService: (String) -> Unit
) {
    var showAlert by remember { mutableStateOf(false) }
    val context = LocalContext.current
    val session by AuthManager.session.collectAsState()
    val isAuthenticated = session?.access_token != null

    val drawerState = rememberDrawerState(DrawerValue.Closed)
    val scope = rememberCoroutineScope()

    val services = listOf(
        ServiceItem("Mosquiteras", Screen.Mosquiteras.route, com.example.presuprosolv2movil.R.drawable.mosquitera),
        ServiceItem("Paños de persiana", Screen.Panos.route, com.example.presuprosolv2movil.R.drawable.pano),
        ServiceItem("Persianas compacto", Screen.Compactos.route, com.example.presuprosolv2movil.R.drawable.cajon),
        ServiceItem("Protección solar", Screen.ProteccionSolar.route, com.example.presuprosolv2movil.R.drawable.proteccionsolar),
        ServiceItem("Puertas de garaje", Screen.PuertasSeccionales.route, com.example.presuprosolv2movil.R.drawable.puertaseccional01),
        ServiceItem("Pérgola bioclimática", Screen.Pergolas.route, com.example.presuprosolv2movil.R.drawable.pergola)
    )

    fun handleProtectedClick(route: String?) {
        if (!isAuthenticated) {
            showAlert = true
            return
        }
        route?.let { onNavigateToService(it) }
    }

    fun openMaps() {
        val intent = Intent(
            Intent.ACTION_VIEW,
            "https://www.google.com/maps?q=Pecrisur+Persianas,+Córdoba,+España".toUri()
        )
        context.startActivity(intent)
    }

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            DrawerContent(
                isAuthenticated = isAuthenticated,
                onItemClick = { route ->
                    scope.launch { drawerState.close() }
                    if (route.isNotEmpty()) {
                        navController.navigate(route)
                    }
                },
                onLoginClick = {
                    scope.launch { drawerState.close() }
                    navController.navigate(Screen.Login.route)
                }
            )
        }
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFF5F5F5))
        ) {
            Header(onMenuClick = { scope.launch { drawerState.open() } })

            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(24.dp),
                contentPadding = PaddingValues(vertical = 16.dp)
            ) {
                // Hero Section
                item {
                    HeroSection(onButtonClick = { handleProtectedClick(Screen.Mosquiteras.route) })
                }

                // Servicios Section
                item {
                    Text(
                        text = "Servicios",
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black,
                        modifier = Modifier.padding(vertical = 8.dp)
                    )
                }

                items(services) { service ->
                    ServiceCard(
                        title = service.title,
                        imageRes = service.imageRes,
                        onClick = { handleProtectedClick(service.route) }
                    )
                }

                // Mapa Section
                item {
                    MapSection(onMapClick = { openMaps() })
                }

                // Espaciado final
                item {
                    Spacer(modifier = Modifier.height(16.dp))
                }
            }
        }

        // Alerta de login
        if (showAlert) {
            LoginAlert(
                onDismiss = { showAlert = false },
                onLoginClick = { navController.navigate(Screen.Login.route) }
            )
        }
    }
}

@Composable
fun HeroSection(onButtonClick: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Texto principal
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = Color.White
            ),
            elevation = CardDefaults.cardElevation(2.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.Start,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(
                    text = "Presupuesto de persianas al instante",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF2D2A6E),
                    lineHeight = 32.sp
                )

                Text(
                    text = "Configura, calcula y pide tus persianas en pocos pasos.",
                    fontSize = 16.sp,
                    color = Color.Gray,
                    lineHeight = 22.sp
                )


            }
        }

        // Imagen de la fábrica (usa drawable `fabrica_pecrisur`)
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .height(240.dp),
            shape = RoundedCornerShape(16.dp),
            elevation = CardDefaults.cardElevation(4.dp)
        ) {
            // Mostrar la imagen real, recortada para llenar el card
            androidx.compose.foundation.Image(
                painter = painterResource(id = com.example.presuprosolv2movil.R.drawable.fabricapecrisur),
                contentDescription = "Instalaciones Pecrisur",
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop
            )
        }
    }
}

@Composable
fun MapSection(onMapClick: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "Encuéntranos",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Black
        )

        Card(
            modifier = Modifier
                .fillMaxWidth()
                .height(200.dp),
            shape = RoundedCornerShape(16.dp),
            elevation = CardDefaults.cardElevation(4.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White) // fondo claro sin negro
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(24.dp),
                horizontalAlignment = Alignment.Start,
                verticalArrangement = Arrangement.Center
            ) {
                Text(
                    text = "Visítanos o revisa nuestra ubicación en Google Maps.",
                    fontSize = 14.sp,
                    color = Color.Gray,
                    lineHeight = 20.sp
                )

                Spacer(modifier = Modifier.height(16.dp))

                OutlinedButton(
                    onClick = onMapClick,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = MaterialTheme.colorScheme.primary
                    )
                ) {
                    Text("Ver en Google Maps", fontSize = 14.sp)
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DrawerContent(
    isAuthenticated: Boolean,
    onItemClick: (String) -> Unit,
    onLoginClick: () -> Unit
) {
    ModalDrawerSheet(
        drawerContainerColor = Color.White
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(vertical = 16.dp)
        ) {
            // Header del drawer
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 24.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "PresuProsol",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF2D2A6E)
                )
                IconButton(onClick = { onItemClick("") }) {
                    Icon(Icons.Default.Close, "Cerrar menú")
                }
            }

            HorizontalDivider()

            Spacer(modifier = Modifier.height(16.dp))

            // Menú de información (siempre visible)
            DrawerMenuItem(
                title = "FAQ",
                onClick = { onItemClick(Screen.Faq.route) }
            )
            DrawerMenuItem(
                title = "Términos y Condiciones",
                onClick = { onItemClick(Screen.TerminosCondiciones.route) }
            )
            DrawerMenuItem(
                title = "Política de Privacidad",
                onClick = { onItemClick(Screen.PoliticaPrivacidad.route) }
            )
            DrawerMenuItem(
                title = "Contacto",
                onClick = { onItemClick(Screen.Contacto.route) }
            )

            Spacer(modifier = Modifier.height(16.dp))

            HorizontalDivider()

            Spacer(modifier = Modifier.height(16.dp))

            // Botones de autenticación
            if (isAuthenticated) {
                // Si está autenticado, mostrar opciones de usuario
                DrawerMenuItem(
                    title = "Mis presupuestos",
                    onClick = { onItemClick(Screen.MisPresupuestos.route) }
                )
                DrawerMenuItem(
                    title = "Mis pedidos",
                    onClick = { onItemClick(Screen.MisPedidos.route) }
                )

                Spacer(modifier = Modifier.weight(1f))

                Button(
                    onClick = { AuthManager.signOut() },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFFFF6600)
                    )
                ) {
                    Text("Cerrar sesión")
                }
            } else {
                Spacer(modifier = Modifier.weight(1f))

                // Botón de iniciar sesión
                OutlinedButton(
                    onClick = onLoginClick,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = Color(0xFF2D2A6E)
                    )
                ) {
                    Text("Iniciar sesión")
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Composable
fun DrawerMenuItem(
    title: String,
    onClick: () -> Unit
) {
    TextButton(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp),
        colors = ButtonDefaults.textButtonColors(
            contentColor = Color.Black
        )
    ) {
        Text(
            text = title,
            fontSize = 16.sp,
            modifier = Modifier.fillMaxWidth(),
            textAlign = TextAlign.Start
        )
    }
}
