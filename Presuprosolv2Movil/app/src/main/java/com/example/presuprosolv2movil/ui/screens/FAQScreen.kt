package com.example.presuprosolv2movil.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.presuprosolv2movil.data.models.Faq
import com.example.presuprosolv2movil.data.repositories.ApiRepository
import com.example.presuprosolv2movil.navigation.Screen
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FaqScreen(navController: NavController) {
    var faqs by remember { mutableStateOf<List<Faq>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var expandedId by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    // Colores
    val primaryColor = Color(0xFF2D2A6E)
    val accentColor = Color(0xFFFF6600)
    val backgroundColor = Color(0xFFF5F5F5)

    // Cargar FAQs
    LaunchedEffect(Unit) {
        scope.launch {
            isLoading = true
            try {
                android.util.Log.d("FaqScreen", "Iniciando carga de FAQs desde API web...")
                val result = ApiRepository.getFaqs()
                android.util.Log.d("FaqScreen", "FAQs cargadas: ${result.size}")
                result.forEachIndexed { index, faq ->
                    android.util.Log.d("FaqScreen", "[$index] ${faq.pregunta}")
                }
                faqs = result
            } catch (e: Exception) {
                android.util.Log.e("FaqScreen", "💥 Error cargando FAQs", e)
                android.util.Log.e("FaqScreen", "Error detalle: ${e.message}")
                faqs = emptyList()
            } finally {
                isLoading = false
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Preguntas Frecuentes", color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(
                            Icons.AutoMirrored.Filled.ArrowBack,
                            "Volver",
                            tint = Color.White
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = primaryColor
                )
            )
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(backgroundColor)
                .padding(padding)
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.align(Alignment.Center),
                    color = accentColor
                )
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Header
                    item {
                        Column(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "Preguntas Frecuentes",
                                fontSize = 28.sp,
                                fontWeight = FontWeight.Bold,
                                color = primaryColor,
                                textAlign = TextAlign.Center
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Encuentra respuestas rápidas a las dudas más comunes sobre nuestra plataforma",
                                fontSize = 14.sp,
                                color = Color.Gray,
                                textAlign = TextAlign.Center,
                                modifier = Modifier.padding(horizontal = 16.dp)
                            )
                            Spacer(modifier = Modifier.height(24.dp))
                        }
                    }

                    // FAQs o mensaje de vacío
                    if (faqs.isEmpty()) {
                        item {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(
                                    containerColor = Color(0xFFFFF8E1)
                                ),
                                elevation = CardDefaults.cardElevation(2.dp)
                            ) {
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(24.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Text(
                                        text = "📋",
                                        fontSize = 48.sp
                                    )
                                    Spacer(modifier = Modifier.height(16.dp))
                                    Text(
                                        text = "No hay preguntas frecuentes disponibles",
                                        fontSize = 18.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = primaryColor,
                                        textAlign = TextAlign.Center
                                    )
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text(
                                        text = "Estamos trabajando en agregar contenido útil para ti.",
                                        fontSize = 14.sp,
                                        color = Color.Gray,
                                        textAlign = TextAlign.Center
                                    )
                                }
                            }
                        }
                    }

                    // FAQs
                    items(faqs) { faq ->
                        FaqItem(
                            faq = faq,
                            isExpanded = expandedId == faq.id,
                            onToggle = {
                                expandedId = if (expandedId == faq.id) null else faq.id
                            },
                            accentColor = accentColor,
                            primaryColor = primaryColor
                        )
                    }

                    // Footer
                    item {
                        Spacer(modifier = Modifier.height(24.dp))
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = Color(0xFFFFF8E1)
                            ),
                            elevation = CardDefaults.cardElevation(2.dp)
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(20.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = "¿No encuentras lo que buscas?",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = primaryColor,
                                    textAlign = TextAlign.Center
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = "Contacta con nuestro equipo para obtener ayuda personalizada",
                                    fontSize = 14.sp,
                                    color = Color.Gray,
                                    textAlign = TextAlign.Center
                                )
                                Spacer(modifier = Modifier.height(16.dp))
                                Button(
                                    onClick = { navController.navigate(Screen.Contacto.route) },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = accentColor
                                    ),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text("Ir a Contacto", color = Color.White)
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                    }
                }
            }
        }
    }
}

@Composable
fun FaqItem(
    faq: Faq,
    isExpanded: Boolean,
    onToggle: () -> Unit,
    accentColor: Color,
    primaryColor: Color
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onToggle),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = faq.pregunta,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = primaryColor,
                    modifier = Modifier.weight(1f)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Surface(
                    shape = CircleShape,
                    color = accentColor,
                    modifier = Modifier.size(32.dp)
                ) {
                    Icon(
                        imageVector = if (isExpanded) Icons.Default.Close else Icons.Default.Add,
                        contentDescription = if (isExpanded) "Contraer" else "Expandir",
                        tint = Color.White,
                        modifier = Modifier.padding(8.dp)
                    )
                }
            }

            AnimatedVisibility(
                visible = isExpanded,
                enter = expandVertically() + fadeIn(),
                exit = shrinkVertically() + fadeOut()
            ) {
                Column {
                    Spacer(modifier = Modifier.height(12.dp))
                    HorizontalDivider(color = Color.LightGray)
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = faq.respuesta,
                        fontSize = 14.sp,
                        color = Color.Gray,
                        lineHeight = 20.sp
                    )
                }
            }
        }
    }
}

