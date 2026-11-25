# Sorprendiendo — Panel de gestión (Supabase)

Aplicación web interna para gestionar detalles, productos, proveedores, listas de compras,
pedidos, domiciliarios e informes. Se aloja en GitHub Pages y utiliza Supabase como backend.

## Tecnologías

- HTML, CSS y JavaScript nativo (ES modules).
- Supabase Auth para inicio de sesión.
- Supabase Database (PostgreSQL) para los datos.
- Supabase Storage para imágenes.
- Supabase Realtime para actualizar las vistas abiertas.

## Configuración de Supabase

El cliente se configura en `js/supabase-config.js` con el Project URL y la publishable key.
Estas credenciales son públicas por diseño. **Nunca publiques una `service_role` o secret key.**

El esquema inicial se crea con `supabase-setup.sql`. Después ejecuta
`supabase-migration-functions.sql` para añadir el campo utilizado por listas de compras
y las funciones transaccionales de pedidos/domicilios.

## Crear el usuario administrador

1. En Supabase abre Authentication → Users.
2. Selecciona Add user.
3. Crea el usuario con correo `sorprendiendo@sorprendiendo.local`.
4. Establece una contraseña nueva y segura.
5. Si el panel ofrece la opción, confirma/verifica el usuario.
6. En Authentication → Settings desactiva los registros públicos (Allow new users to sign up).

En la pantalla de la aplicación se inicia sesión con:
- Usuario: `sorprendiendo`
- Contraseña: la que acabas de crear en Supabase.

No reutilices contraseñas iniciales publicadas en versiones anteriores del README.

## GitHub Pages

1. Sube el contenido de esta carpeta a la rama `main` del repositorio.
2. Conserva `index.html` en la raíz y las carpetas `css/`, `js/` y `assets/`.
3. En GitHub abre Settings → Pages.
4. Selecciona Deploy from a branch, `main` y `/ (root)`.
5. En Supabase, Authentication → URL Configuration, agrega la URL de GitHub Pages a
   Site URL / Redirect URLs si el flujo de autenticación lo requiere.

## Prueba recomendada antes de reemplazar la versión publicada

1. Crea el usuario administrador.
2. Abre la app en una URL de prueba de GitHub Pages.
3. Inicia sesión.
4. Crea una ocasión, proveedor, producto y detalle de prueba.
5. Sube una imagen y confirma que aparece en Storage.
6. Crea un pedido con domicilio y comprueba que aparecen ambos registros.
7. Comprueba que las actualizaciones se reflejan en otra pestaña o dispositivo.

No elimines el proyecto Firebase hasta validar la nueva versión y confirmar que no quedan
dependencias operativas de Firebase.

## Estructura

- `index.html`: entrada de la SPA.
- `css/`: estilos y diseño responsive.
- `assets/`: recursos gráficos.
- `js/supabase-config.js`: conexión a Supabase.
- `js/auth.js`: autenticación.
- `js/data.js`: operaciones de base de datos y Realtime.
- `js/utils.js`: utilidades y carga de imágenes.
- `js/`: módulos de la aplicación.

## Modelo de datos

- `categorias`
- `productos`
- `proveedores`
- `detalles`
- `ocasiones`
- `domiciliarios`
- `listas_compras`
- `pedidos`
- `domicilios`

Los campos de fecha se guardan como `timestamptz` o `date`. Los componentes de detalles,
productos y pedidos se conservan como JSONB cuando representan snapshots o listas anidadas.
