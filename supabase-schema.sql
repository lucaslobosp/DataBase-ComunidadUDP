-- Ejecuta este SQL en el SQL Editor de tu proyecto Supabase
-- (https://supabase.com → tu proyecto → SQL Editor)

create table members (
  id          text primary key,
  fecha       text,
  nombre      text not null,
  telefono    text,
  correo      text,
  empresa     text,
  cargo       text,
  industria   text,
  ciudad      text,
  linkedin    text,
  servicios   text,
  clientes    text,
  necesidades text,
  capacidades text,
  disponibilidad text,
  contactable text,
  comentarios text
);

-- Acceso público de lectura y escritura (red colaborativa abierta)
alter table members enable row level security;

create policy "Lectura pública"  on members for select using (true);
create policy "Inserción pública" on members for insert with check (true);
