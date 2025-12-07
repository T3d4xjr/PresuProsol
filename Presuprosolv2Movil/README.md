# PresuProsol Móvil 📱

> Aplicación móvil Android para presupuestos de persianas, mosquiteras, puertas de garaje y más.

[![Android](https://img.shields.io/badge/Platform-Android-green.svg)](https://www.android.com/)
[![Kotlin](https://img.shields.io/badge/Language-Kotlin-blue.svg)](https://kotlinlang.org/)
[![Jetpack Compose](https://img.shields.io/badge/UI-Jetpack%20Compose-brightgreen.svg)](https://developer.android.com/jetpack/compose)

## ✨ Características

### 🏠 Pantalla Principal
- **Hero Section** con gradiente atractivo
- **Grid de Servicios** (6 categorías):
  - 🪟 Mosquiteras
  - 🎭 Paños de persiana
  - 📦 Persianas compacto
  - ☀️ Protección solar
  - 🚪 Puertas de garaje
  - 🏛️ Pérgola bioclimática
- **Ubicación** con integración de Google Maps

### 🔐 Autenticación con Supabase
- Sistema completo de login/logout
- Protección de rutas
- Modal de acceso restringido
- Gestión de estado con StateFlow
- Manejo de errores en tiempo real

### 🎨 Diseño Moderno
- Material Design 3
- Tema personalizado con colores de PresuProsol
- Animaciones suaves
- UI responsiva y adaptativa

### 🧭 Navegación
- Navigation Compose
- Rutas protegidas por autenticación
- Transiciones suaves entre pantallas

## 🚀 Inicio Rápido

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/PresuProsol.git
cd Presuprosolv2Movil
```

### 2. Configurar Supabase
Sigue la guía completa en [CONFIGURACION_SUPABASE.md](CONFIGURACION_SUPABASE.md)

**Resumen:**
1. Obtén tus credenciales de Supabase
2. Edita `app/src/main/java/com/example/presuprosolv2movil/data/SupabaseAuth.kt`:
```kotlin
private const val SUPABASE_URL = "https://tu-proyecto.supabase.co"
private const val SUPABASE_ANON_KEY = "tu-anon-key"
```

### 3. Compilar y Ejecutar
```bash
# Opción 1: Android Studio
# Abre el proyecto y presiona Run (▶️)

# Opción 2: Línea de comandos
.\gradlew assembleDebug
```

## 📁 Estructura del Proyecto

```
app/src/main/java/com/example/presuprosolv2movil/
├── data/
│   ├── AuthManager.kt          # Gestor de autenticación
│   ├── SupabaseAuth.kt         # Cliente Supabase
│   └── Service.kt              # Modelos de datos
├── navigation/
│   ├── Screen.kt               # Definición de rutas
│   └── NavigationGraph.kt      # Configuración de navegación
├── ui/
│   ├── components/
│   │   ├── Header.kt           # Barra superior
│   │   ├── LoginAlert.kt       # Modal de acceso
│   │   └── ServiceCard.kt      # Tarjeta de servicio
│   ├── screens/
│   │   ├── HomeScreen.kt       # Pantalla principal ⭐
│   │   ├── LoginScreen.kt      # Pantalla de login ⭐
│   │   └── PlaceholderScreen.kt
│   └── theme/
│       ├── Color.kt            # Colores del tema
│       └── Theme.kt            # Tema Material 3
└── MainActivity.kt             # Actividad principal
```

## 🛠️ Tecnologías

- **Lenguaje:** Kotlin
- **UI:** Jetpack Compose + Material 3
- **Navegación:** Navigation Compose
- **Backend:** Supabase (Auth + Database)
- **HTTP:** OkHttp
- **Serialización:** Kotlinx Serialization
- **Async:** Coroutines + Flow

## 📦 Dependencias Principales

```kotlin
// Compose
implementation("androidx.compose.material3:material3")
implementation("androidx.navigation:navigation-compose")

// Supabase/HTTP
implementation("com.squareup.okhttp3:okhttp:4.12.0")
implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.2")

// Coroutines
implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
```

## 🎯 Características Implementadas

- [x] Pantalla principal con hero y servicios
- [x] Sistema de navegación completo
- [x] Autenticación con Supabase
- [x] Protección de rutas
- [x] Modal de acceso restringido
- [x] Pantalla de login completa
- [x] Logout desde header
- [x] Manejo de estados (loading, error)
- [x] Tema personalizado
- [x] Integración con Google Maps

## 🧪 Testing

### Modo Mock (Sin Supabase)
Para probar sin configurar Supabase, modifica `AuthManager.kt` siguiendo las instrucciones en [CONFIGURACION_SUPABASE.md](CONFIGURACION_SUPABASE.md#-probar-sin-supabase-modo-mock)

### Usuario de Prueba
Crea un usuario en Supabase Dashboard:
- Email: `test@presuprosol.com`
- Password: `Test123!`

## 📚 Documentación

- [📖 Guía Rápida](GUIA_RAPIDA.md) - Resumen ejecutivo del proyecto
- [🔐 Configuración Supabase](CONFIGURACION_SUPABASE.md) - Guía completa de autenticación
- [📊 Estado de Implementación](ESTADO_IMPLEMENTACION.md) - Progreso detallado

## 🔄 Flujo de la App

```
App Inicia
    ↓
HomeScreen (Pública)
    ↓
Usuario hace clic en servicio
    ↓
¿Está autenticado? ──→ NO ──→ LoginAlert ──→ LoginScreen
    ↓                                              ↓
   SÍ                                         Login exitoso
    ↓                                              ↓
Pantalla del Servicio ←──────────────────────────┘
```

## 🎨 Tema de Colores

```kotlin
Primary:   #2563EB  // Azul vibrante
Secondary: #10B981  // Verde
Background: #F5F5F5 // Gris claro
Surface:   #FFFFFF  // Blanco
```

## 🐛 Solución de Problemas

### Errores de Compilación
```bash
.\gradlew clean
# En Android Studio: File → Invalidate Caches → Restart
```

### Errores de Referencia "Unresolved reference: AuthManager"
1. Sync del proyecto con Gradle (File → Sync Project with Gradle Files)
2. Build → Clean Project
3. Build → Rebuild Project
4. File → Invalidate Caches → Restart

Ver más en [CONFIGURACION_SUPABASE.md](CONFIGURACION_SUPABASE.md#-solución-de-problemas)

## 📝 TODO / Roadmap

### Corto Plazo
- [ ] Pantallas detalladas de cada servicio
- [ ] Calculadora de presupuestos
- [ ] Formulario de contacto

### Medio Plazo
- [ ] Sistema de pedidos
- [ ] Historial de presupuestos
- [ ] Perfil de usuario

### Largo Plazo
- [ ] Notificaciones push
- [ ] Sistema de pagos
- [ ] Chat en vivo
- [ ] Versión iOS (Kotlin Multiplatform)

## 👥 Autores

- **PresuProsol Team** - Desarrollo inicial

## 📞 Contacto

- Web: [presuprosol.com](https://presuprosol.com)
- Ubicación: Córdoba, España

---

**Estado:** ✅ Funcional - Listo para desarrollo continuo  
**Versión:** 1.0.0  
**Última actualización:** Diciembre 2025

