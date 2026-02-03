'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge'; // Checking if badge exists, if not use simple div

export default function ConnectionStatus() {
    const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        async function checkConnection() {
            try {
                const supabase = createClient();
                const { count, error } = await supabase.from('automations').select('*', { count: 'exact', head: true });

                if (error) throw error;
                setStatus('connected');
            } catch (err: any) {
                console.error('Supabase connection error:', err);
                setStatus('error');
                setErrorMessage(err.message);
            }
        }

        checkConnection();
    }, []);

    if (status === 'loading') return <div className="text-yellow-600 text-sm">Verificando Conexão...</div>;
    if (status === 'error') return <div className="text-red-600 text-sm">Falha na Conexão: {errorMessage}</div>;
    return <div className="text-green-600 text-sm font-bold">● Sistema Online (Banco Conectado)</div>;
}
