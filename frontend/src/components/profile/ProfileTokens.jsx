import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../lib/axios';
import { jsonToast } from '../../lib/jsonToast';

import TokenList from './tokens/TokenList';
import TokenNameInput from './tokens/TokenNameInput';
import TokenOtpInput from './tokens/TokenOtpInput';
import TokenSuccess from './tokens/TokenSuccess';

export default function ProfileTokens() {
  const [searchParams, setSearchParams] = useSearchParams();
  const actionParam = searchParams.get('action');

  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Views: 'LIST', 'NAME', 'OTP', 'REVOKE_OTP', 'SUCCESS'
  const [view, setView] = useState(actionParam === 'new' ? 'NAME' : 'LIST');

  useEffect(() => {
    if (actionParam === 'new') {
      setView('NAME');
      // Remove action=new from URL so refreshing doesn't keep bringing them back to the create screen
      setSearchParams((prev) => {
        prev.delete('action');
        return prev;
      }, { replace: true });
    }
  }, [actionParam, setSearchParams]);

  // Shared Form Data
  const [tokenName, setTokenName] = useState('');
  const [generatedToken, setGeneratedToken] = useState(null);
  const [tokenToRevoke, setTokenToRevoke] = useState(null);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/tokens');
      setTokens(res.data.data);
    } catch (err) {
      jsonToast.error(err?.response?.data?.message || 'Failed to fetch tokens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const handleRequestOtp = async (name) => {
    setTokenName(name);
    setView('OTP'); // Optimistic UI update
    
    try {
      await apiClient.post('/tokens/request-otp');
      jsonToast.success('Security code sent to your email');
    } catch (err) {
      setView('NAME'); // Roll back on failure
      jsonToast.error(err?.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleGenerateToken = async (otpValue) => {
    setActionLoading(true);
    try {
      const res = await apiClient.post('/tokens', {
        name: tokenName,
        otp: otpValue
      });
      setGeneratedToken(res.data.data.token);
      setView('SUCCESS');
      fetchTokens(); // refresh token list in background
    } catch (err) {
      jsonToast.error(err?.response?.data?.message || 'Failed to generate token');
      throw err; // throw so TokenOtpInput can catch and decrement tries
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeToken = async (tokenId) => {
    jsonToast.confirm('Are you sure you want to revoke this token?', async () => {
      setTokenToRevoke(tokenId);
      setView('REVOKE_OTP'); // Optimistic UI update

      try {
        await apiClient.post('/tokens/request-otp');
        jsonToast.success('Security code sent to your email');
      } catch (err) {
        setView('LIST'); // Roll back
        jsonToast.error(err?.response?.data?.message || 'Failed to send OTP');
      }
    });
  };

  const handleConfirmRevoke = async (otpValue) => {
    setActionLoading(true);
    try {
      await apiClient.delete(`/tokens/${tokenToRevoke}`, {
        data: { otp: otpValue }
      });
      jsonToast.success('Token revoked successfully');
      setView('LIST');
      setTokenToRevoke(null);
      fetchTokens();
    } catch (err) {
      jsonToast.error(err?.response?.data?.message || 'Failed to revoke token');
      throw err; // throw to decrement tries
    } finally {
      setActionLoading(false);
    }
  };

  const resetFlow = () => {
    setView('LIST');
    setTokenName('');
    setGeneratedToken(null);
    setTokenToRevoke(null);
  };

  return (
    <motion.main
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ layout: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: 0.3 } }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 min-h-[400px] relative overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {view === 'LIST' && (
          <TokenList 
            tokens={tokens} 
            loading={loading} 
            onGenerateClick={() => setView('NAME')} 
            onRevoke={handleRevokeToken} 
          />
        )}
        {view === 'NAME' && (
          <TokenNameInput 
            actionLoading={actionLoading} 
            onSubmit={handleRequestOtp} 
            onBack={resetFlow} 
          />
        )}
        {view === 'OTP' && (
          <TokenOtpInput 
            actionLoading={actionLoading} 
            onSubmit={handleGenerateToken} 
            onBack={() => setView('NAME')} 
          />
        )}
        {view === 'REVOKE_OTP' && (
          <TokenOtpInput 
            actionLoading={actionLoading} 
            onSubmit={handleConfirmRevoke} 
            onBack={resetFlow} 
          />
        )}
        {view === 'SUCCESS' && (
          <TokenSuccess 
            generatedToken={generatedToken} 
            onClose={resetFlow} 
          />
        )}
      </AnimatePresence>
    </motion.main>
  );
}
