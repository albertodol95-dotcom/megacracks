# Megacracks 26/27 — Pablo, Raúl y Alberto

App web (instalable en el móvil) para llevar la colección Megacracks LaLiga EA Sports 2026/27 de Panini entre tres.
Los datos se guardan en Netlify Blobs, así que lo que marca uno lo ven los otros dos en cualquier dispositivo.

## Qué incluye
- **Álbum**: las 654 cartas de 1ª y 2ª edición (equipos, Bis, Élite, Power, Enjoy, Zona VIP, Master Rookie,
  Stars on 25, Just 25, Nuevos Fichajes, Special One, Índices, Limitadas y Autógrafos). Toca para sumar, − para restar,
  mantén pulsado para ver quién la tiene. Los puntos de color indican qué amigo la tiene repetida.
- **Sobre**: escribe los números de un sobre (`12 47 bis 3P SOB1`) y se revelan como nuevas o repes. Se puede deshacer.
- **Repes**: tu lista con contadores y botón para compartir repes o faltas por WhatsApp.
- **Cambios**: qué te puede dar cada amigo y qué le puedes dar tú; "Cambiado" mueve la carta de uno a otro.
- **Ranking**: podio, progreso por subcolección, ajustes, copia de seguridad y alta de cartas nuevas (3ª edición, Last Moment…).
- Funciona sin conexión: guarda en el dispositivo y sube los cambios al volver.

## Publicar en Netlify (10 minutos)
> Netlify Drop (arrastrar la carpeta) **no** sirve: no despliega la función que guarda los datos.

**Opción A — GitHub (recomendada, se actualiza sola)**
1. Crea un repositorio en GitHub y sube esta carpeta tal cual.
2. En app.netlify.com: *Add new site → Import an existing project → GitHub* y elige el repo.
3. Netlify lee `netlify.toml` solo; pulsa *Deploy*. Listo.

**Opción B — Desde tu ordenador**
```bash
npm install
npx netlify-cli login
npx netlify-cli deploy --prod
```

### Proteger con código (opcional, recomendable)
La URL es pública: cualquiera que la tenga podría editar. En Netlify → *Site configuration → Environment variables*
añade `APP_PIN` con un código (p. ej. `1927`) y vuelve a desplegar. La app pedirá el código una vez por dispositivo.

### Instalar como app
Abre la URL en el móvil: en iPhone *Compartir → Añadir a pantalla de inicio*; en Android *Menú → Instalar app*.

## Datos
Listado actualizado a 21/09/2026 (1ª + 2ª edición). Si sale la 3ª edición, añadid las cartas desde Ranking → Añadir carta,
o editad `public/data.js`. App no oficial, sin relación con Panini.
