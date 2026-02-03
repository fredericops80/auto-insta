-- INSTRUÇÕES DE CORREÇÃO (ERRO NO_ORG_FOUND):
-- O sistema precisa de um usuário real no banco para criar as organizações devido às travas de segurança.

-- PASSO 1:
-- Vá para o painel do Supabase -> Authentication -> Users.
-- Clique em "Add User" e crie um usuário (ex: demo@instaauto.com).
-- Copie o "User UID" gerado.

-- PASSO 2:
-- Cole o UID abaixo onde diz 'SUBSTITUA_PELO_SEU_UID' e execute este script completo.

DO $$
DECLARE
    -- COLE SEU UID AQUI DENTRO DAS ASPAS:
    v_user_id uuid := 'SUBSTITUA_PELO_SEU_UID'::uuid; 
BEGIN
    -- 1. Cria Perfil
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (v_user_id, 'Admin User', 'https://github.com/shadcn.png')
    ON CONFLICT (id) DO NOTHING;

    -- 2. Cria Organização
    INSERT INTO public.organizations (name, owner_id)
    VALUES ('Minha Agência', v_user_id)
    ON CONFLICT DO NOTHING;
    
    -- 3. (Opcional) Cria Automação Inicial se não existir
    INSERT INTO public.automations (org_id, name, trigger_type, keyword, is_active)
    SELECT id, 'Fluxo Exemplo', 'COMMENT', 'teste', true
    FROM public.organizations
    WHERE owner_id = v_user_id
    LIMIT 1
    ON CONFLICT DO NOTHING;

END $$;
