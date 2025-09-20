'use client';

import { useState } from 'react';

export default function TestLogin() {
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const testLogin = async () => {
        setLoading(true);
        setResult('Testing...');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: 'manager',
                    password: 'admin123'
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setResult(`✅ Login successful! User: ${data.user.username}, Role: ${data.user.role}`);
            } else {
                setResult(`❌ Login failed: ${data.error}`);
            }
        } catch (error) {
            setResult(`❌ Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
            <h1>Login Test</h1>
            <button
                onClick={testLogin}
                disabled={loading}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    cursor: loading ? 'not-allowed' : 'pointer'
                }}
            >
                {loading ? 'Testing...' : 'Test Login (manager/admin123)'}
            </button>
            <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
                <pre>{result}</pre>
            </div>
        </div>
    );
}