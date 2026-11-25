// ============================================================
// CAPA DE DATOS — Supabase
// Conserva los nombres de funciones que consumen los módulos UI.
// Firestore listasCompras -> PostgreSQL listas_compras.
// ============================================================
import { supabase } from "./supabase-config.js";

const TABLE = {
  categorias: "categorias",
  productos: "productos",
  proveedores: "proveedores",
  detalles: "detalles",
  ocasiones: "ocasiones",
  domiciliarios: "domiciliarios",
  listasCompras: "listas_compras",
  pedidos: "pedidos",
  domicilios: "domicilios",
};

function reportError(error, context) {
  console.error(`[Supabase] ${context}:`, error);
}

function subscribeTable(table, queryBuilder, cb, context = table) {
  let active = true;
  const refresh = async () => {
    const { data, error } = await queryBuilder();
    if (!active) return;
    if (error) {
      reportError(error, `consultando ${context}`);
      return;
    }
    cb(data || []);
  };

  const channel = supabase
    .channel(`realtime-${table}-${Math.random().toString(36).slice(2)}`)
    .on("postgres_changes", { event: "*", schema: "public", table }, refresh)
    .subscribe();

  // Carga inicial. Realtime refresca después de cada cambio.
  refresh();

  return () => {
    active = false;
    supabase.removeChannel(channel);
  };
}

async function insertOne(table, payload) {
  const { data, error } = await supabase.from(table).insert(payload).select("id").single();
  if (error) throw error;
  return { id: data.id };
}

async function updateOne(table, id, payload) {
  const { error } = await supabase.from(table).update(payload).eq("id", id);
  if (error) throw error;
}

async function deleteOne(table, id) {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}

function listenAll(table, orderColumn, cb, ascending = true) {
  return subscribeTable(table, () => supabase.from(table).select("*").order(orderColumn, { ascending }), cb);
}

/* CATEGORÍAS */
export function listenCategorias(cb) {
  return listenAll(TABLE.categorias, "nombre", cb);
}
export async function addCategoria(nombre) {
  return insertOne(TABLE.categorias, { nombre: nombre.trim() });
}
export async function updateCategoria(id, nombre) {
  return updateOne(TABLE.categorias, id, { nombre: nombre.trim(), updatedAt: new Date().toISOString() });
}
export async function deleteCategoria(id) {
  return deleteOne(TABLE.categorias, id);
}
export async function categoriaTieneDetalles(categoriaId) {
  const { count, error } = await supabase.from(TABLE.detalles).select("id", { count: "exact", head: true }).eq("categoriaId", categoriaId);
  if (error) throw error;
  return (count || 0) > 0;
}

/* PRODUCTOS */
export function listenProductos(cb) {
  return listenAll(TABLE.productos, "nombre", cb);
}
export async function addProducto({ nombre, imagenUrl = null, proveedores = [] }) {
  return insertOne(TABLE.productos, { nombre: nombre.trim(), imagenUrl, proveedores });
}
export async function updateProducto(id, data) {
  return updateOne(TABLE.productos, id, { ...data, updatedAt: new Date().toISOString() });
}
export async function deleteProducto(id) {
  return deleteOne(TABLE.productos, id);
}
export async function productoEstaEnUso(productoId) {
  const { data, error } = await supabase.from(TABLE.detalles).select("productos");
  if (error) throw error;
  return (data || []).some((d) => (d.productos || []).some((p) => p.productoId === productoId));
}

/* PROVEEDORES */
export function listenProveedores(cb) {
  return listenAll(TABLE.proveedores, "nombre", cb);
}
export async function addProveedor({ nombre, imagenUrl = null }) {
  return insertOne(TABLE.proveedores, { nombre: nombre.trim(), imagenUrl });
}
export async function updateProveedor(id, data) {
  return updateOne(TABLE.proveedores, id, { ...data, updatedAt: new Date().toISOString() });
}
export async function deleteProveedor(id) {
  return deleteOne(TABLE.proveedores, id);
}
export async function proveedorEstaEnUso(proveedorId) {
  const { data, error } = await supabase.from(TABLE.productos).select("proveedores");
  if (error) throw error;
  return (data || []).some((p) => (p.proveedores || []).some((v) => v.proveedorId === proveedorId));
}

/* DETALLES */
export function listenDetalles(cb) {
  return listenAll(TABLE.detalles, "nombre", cb);
}
export async function addDetalle({ nombre, imagenUrl = null, precio, categoriaId, productos = [] }) {
  return insertOne(TABLE.detalles, {
    nombre: nombre.trim(), imagenUrl, precio: Number(precio) || 0, categoriaId, productos,
  });
}
export async function updateDetalle(id, data) {
  return updateOne(TABLE.detalles, id, { ...data, updatedAt: new Date().toISOString() });
}
export async function deleteDetalle(id) {
  return deleteOne(TABLE.detalles, id);
}
export async function reasignarDetallesDeCategoria(categoriaId, nuevaCategoriaId) {
  const { error } = await supabase.from(TABLE.detalles).update({
    categoriaId: nuevaCategoriaId, updatedAt: new Date().toISOString(),
  }).eq("categoriaId", categoriaId);
  if (error) throw error;
}

/* OCASIONES */
export function listenOcasiones(cb) {
  return listenAll(TABLE.ocasiones, "nombre", cb);
}
export async function addOcasion(nombre) {
  return insertOne(TABLE.ocasiones, { nombre: nombre.trim() });
}
export async function updateOcasion(id, nombre) {
  return updateOne(TABLE.ocasiones, id, { nombre: nombre.trim() });
}
export async function deleteOcasion(id) {
  return deleteOne(TABLE.ocasiones, id);
}
export const OCASIONES_INICIALES = [
  "Cumpleaños", "Amor", "Meses", "Aniversario", "Amistad",
  "Día de la madre", "Día del padre", "Otro",
];

/* DOMICILIARIOS */
export function listenDomiciliarios(cb) {
  return listenAll(TABLE.domiciliarios, "nombre", cb);
}
export async function addDomiciliario(nombre) {
  return insertOne(TABLE.domiciliarios, { nombre: nombre.trim(), activo: true });
}
export async function updateDomiciliario(id, data) {
  return updateOne(TABLE.domiciliarios, id, data);
}
export async function setDomiciliarioActivo(id, activo) {
  return updateOne(TABLE.domiciliarios, id, { activo });
}

/* LISTAS DE COMPRAS */
export function listenListasCompras(cb) {
  return listenAll(TABLE.listasCompras, "createdAt", cb, false);
}
export async function getListaCompras(id) {
  const { data, error } = await supabase.from(TABLE.listasCompras).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}
export function listenListaCompras(id, cb) {
  let active = true;
  const refresh = async () => {
    const { data, error } = await supabase.from(TABLE.listasCompras).select("*").eq("id", id).maybeSingle();
    if (!active) return;
    if (error) return reportError(error, "consultando lista de compras");
    cb(data);
  };
  const channel = supabase.channel(`lista-${id}`)
    .on("postgres_changes", { event: "*", schema: "public", table: TABLE.listasCompras, filter: `id=eq.${id}` }, refresh)
    .subscribe();
  refresh();
  return () => { active = false; supabase.removeChannel(channel); };
}
export async function addListaCompras({ nombre, items = [], detallesSeleccionados = [], detallesUsados = [] }) {
  return insertOne(TABLE.listasCompras, {
    nombre: nombre.trim(), items, detallesSeleccionados, detallesUsados,
  });
}
export async function updateListaCompras(id, data) {
  return updateOne(TABLE.listasCompras, id, { ...data, updatedAt: new Date().toISOString() });
}
export async function deleteListaCompras(id) {
  return deleteOne(TABLE.listasCompras, id);
}

/* PEDIDOS */
export function listenPedidosRecientes(cb, max = 60) {
  return subscribeTable(TABLE.pedidos, async () => {
    const { data, error } = await supabase.from(TABLE.pedidos).select("*").order("createdAt", { ascending: false }).limit(max);
    return { data, error };
  }, cb, "pedidos recientes");
}
export function listenTodosPedidos(cb) {
  return listenAll(TABLE.pedidos, "createdAt", cb, false);
}
export async function addPedido(pedido) {
  const { data, error } = await supabase.rpc("crear_pedido_con_domicilio", { p_pedido: pedido });
  if (error) throw error;
  return { id: data };
}
export async function marcarDomicilioPagado(pedidoId, pagado) {
  const { error } = await supabase.rpc("marcar_domicilio_pagado", {
    p_pedido_id: pedidoId, p_pagado: pagado,
  });
  if (error) throw error;
}
export async function eliminarPedidosPagados(pedidoIds) {
  if (!pedidoIds?.length) return;
  const { error } = await supabase.from(TABLE.pedidos).delete().in("id", pedidoIds);
  if (error) throw error;
}

/* DOMICILIOS */
export function listenDomiciliosPorDomiciliario(domiciliarioId, cb) {
  return subscribeTable(TABLE.domicilios, async () => {
    const { data, error } = await supabase.from(TABLE.domicilios).select("*")
      .eq("domiciliarioId", domiciliarioId).order("fecha", { ascending: false });
    return { data, error };
  }, cb, "domicilios por domiciliario");
}
export async function eliminarDomiciliosPagados(domiciliarioId, ids) {
  if (!ids?.length) return;
  const { error } = await supabase.from(TABLE.domicilios).delete().in("id", ids);
  if (error) throw error;
}

export function pedidosEnRango(pedidos, fechaInicioISO, fechaFinISO) {
  return pedidos.filter((p) => p.fecha >= fechaInicioISO && p.fecha <= fechaFinISO);
}

export function listenPedidosPorRango(fechaInicioISO, fechaFinISO, cb) {
  return subscribeTable(TABLE.pedidos, async () => {
    const { data, error } = await supabase.from(TABLE.pedidos).select("*")
      .gte("fecha", fechaInicioISO).lte("fecha", fechaFinISO).order("fecha", { ascending: false });
    return { data, error };
  }, cb, "pedidos por rango");
}
