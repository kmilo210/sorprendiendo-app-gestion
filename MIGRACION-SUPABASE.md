# Migración Firebase → Supabase

Esta copia cambia las integraciones del frontend:
- Firebase Authentication → Supabase Auth
- Firestore → Supabase PostgreSQL + Realtime
- Firebase Storage → Supabase Storage

No se modifica la interfaz HTML/CSS ni el enrutador de la SPA.

## Antes de publicar
1. Ejecutar `supabase-setup.sql` (ya ejecutado en el proyecto del usuario).
2. Ejecutar `supabase-migration-functions.sql`.
3. Crear el usuario `sorprendiendo@sorprendiendo.local` en Supabase Auth con contraseña nueva.
4. Desactivar el registro público de usuarios.
5. Probar login, CRUD, subida de imágenes, pedidos y domicilios.
6. Solo después reemplazar el contenido del repositorio GitHub.

## Notas
- El frontend utiliza la publishable key. Nunca se necesita service_role en el navegador.
- Las políticas RLS de este primer despliegue conceden CRUD a usuarios autenticados.
- Para producción multiusuario se recomienda incorporar perfiles/roles y restringir las políticas.
