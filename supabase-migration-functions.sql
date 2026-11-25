-- ============================================================
-- Sorprendiendo: ajustes y operaciones transaccionales para Supabase
-- Ejecutar después del SQL inicial.
-- ============================================================

-- La interfaz actual utiliza también detallesUsados en listas de compras.
alter table public.listas_compras
  add column if not exists "detallesUsados" jsonb not null default '[]'::jsonb;

-- Crear pedido y, si aplica, ficha de domicilio en una sola transacción.
create or replace function public.crear_pedido_con_domicilio(p_pedido jsonb)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_pedido_id uuid := gen_random_uuid();
  v_valor_domicilio numeric(14,2) := coalesce((p_pedido->>'valorDomicilio')::numeric, 0);
  v_domiciliario_id uuid := nullif(p_pedido->>'domiciliarioId', '')::uuid;
begin
  if auth.uid() is null then
    raise exception 'Se requiere una sesión autenticada';
  end if;

  insert into public.pedidos (
    id, fecha, hora, "ocasionId", "ocasionNombre",
    "nombreEnvia", "nombreSorprendido", detalles, adicionales,
    "valorDomicilio", "domiciliarioId", "domiciliarioNombre",
    "totalProductos", "totalPedido", "domicilioPagado", "createdAt"
  ) values (
    v_pedido_id,
    (p_pedido->>'fecha')::date,
    p_pedido->>'hora',
    nullif(p_pedido->>'ocasionId', '')::uuid,
    p_pedido->>'ocasionNombre',
    p_pedido->>'nombreEnvia',
    p_pedido->>'nombreSorprendido',
    coalesce(p_pedido->'detalles', '[]'::jsonb),
    coalesce(p_pedido->'adicionales', '[]'::jsonb),
    v_valor_domicilio,
    v_domiciliario_id,
    p_pedido->>'domiciliarioNombre',
    coalesce((p_pedido->>'totalProductos')::numeric, 0),
    coalesce((p_pedido->>'totalPedido')::numeric, 0),
    false,
    now()
  );

  if v_domiciliario_id is not null and v_valor_domicilio > 0 then
    insert into public.domicilios (
      id, "pedidoId", fecha, "nombreEnvia", "nombreSorprendido",
      "resumenDetalles", "valorDomicilio", "domiciliarioId",
      "domiciliarioNombre", pagado, "createdAt"
    ) values (
      v_pedido_id, v_pedido_id, (p_pedido->>'fecha')::date,
      p_pedido->>'nombreEnvia', p_pedido->>'nombreSorprendido',
      coalesce((
        select string_agg(value->>'nombre', ', ')
        from jsonb_array_elements(coalesce(p_pedido->'detalles', '[]'::jsonb))
      ), ''),
      v_valor_domicilio, v_domiciliario_id,
      p_pedido->>'domiciliarioNombre', false, now()
    );
  end if;

  return v_pedido_id;
end;
$$;

create or replace function public.marcar_domicilio_pagado(p_pedido_id uuid, p_pagado boolean)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Se requiere una sesión autenticada';
  end if;

  update public.pedidos
  set "domicilioPagado" = p_pagado
  where id = p_pedido_id;

  update public.domicilios
  set pagado = p_pagado
  where "pedidoId" = p_pedido_id;
end;
$$;

grant execute on function public.crear_pedido_con_domicilio(jsonb) to authenticated;
grant execute on function public.marcar_domicilio_pagado(uuid, boolean) to authenticated;
