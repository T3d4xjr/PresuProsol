package com.example.presuprosolv2movil.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.presuprosolv2movil.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProteccionSolarScreen(navController: NavController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Protección Solar",
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(
                            Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Volver",
                            tint = Color.White
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF2D2A6E)
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                "Selecciona el tipo de protección solar",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(bottom = 8.dp)
            )

            // Stor Ventus
            TipoProteccionCard(
                titulo = "Stor Ventus",
                imageRes = R.drawable.ventuszip01,
                onClick = {
                    navController.navigate("proteccion_config/proteccion-solar-ventuszip01")
                }
            )

            // Stor Disaluz
            TipoProteccionCard(
                titulo = "Stor Disaluz",
                imageRes = R.drawable.stor_disaluz,
                onClick = {
                    navController.navigate("proteccion_config/proteccion-solar-Stor-disaluz")
                }
            )

            // Stor Vilaluz
            TipoProteccionCard(
                titulo = "Stor Vilaluz",
                imageRes = R.drawable.stor_vilaluz,
                onClick = {
                    navController.navigate("proteccion_config/proteccion-solar-Stor-vilaluz")
                }
            )
        }
    }
}

@Composable
fun TipoProteccionCard(
    titulo: String,
    imageRes: Int,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(120.dp),
        shape = RoundedCornerShape(12.dp),
        onClick = onClick,
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 4.dp
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = titulo,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.weight(1f)
            )

            Image(
                painter = painterResource(id = imageRes),
                contentDescription = titulo,
                modifier = Modifier
                    .size(80.dp),
                contentScale = ContentScale.Crop
            )
        }
    }
}

