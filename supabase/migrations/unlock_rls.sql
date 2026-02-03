-- DESBLOQUEIO DE SEGURANÇA (DEV MODE)
-- Como ainda não temos Login no App, o Supabase bloqueia a leitura dos dados por segurança (RLS).
-- Execute este script para permitir leitura/escrita pública nas tabelas.

-- 1. Desabilita RLS (Row Level Security)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_logs DISABLE ROW LEVEL SECURITY;

-- 2. Garante permissões para o papel 'anon' (usuário não logado) e 'authenticated'
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
