
import React, { useState } from 'react';
import { useStore } from '../services/store';
import { UserPlus, Trash2, Shield, User, Loader2 } from 'lucide-react';
import { UserRole } from '../types';

export const ProfilesManagement: React.FC = () => {
  const { profiles, addProfile, deleteProfile } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('CAIXA');

  const handleSave = async () => {
    if (!name || !email) {
      alert("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      await addProfile({ name, email, role });
      setShowAdd(false);
      setName('');
      setEmail('');
      setRole('CAIXA');
      alert("Usuário cadastrado com sucesso!");
    } catch (e: any) {
      console.error('Erro ao salvar perfil:', e);
      const msg = e.message || "Erro desconhecido";
      alert(`FALHA AO SALVAR:\n${msg}\n\nIsso geralmente acontece porque o script SQL não foi executado no Supabase.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja remover o acesso de ${name}?`)) return;
    try {
      await deleteProfile(id);
      alert("Acesso removido.");
    } catch (e: any) {
      alert("Erro ao excluir perfil: " + (e.message || "Erro desconhecido"));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Usuários e Acessos</h2>
          <p className="text-slate-500 text-sm">Gerencie quem pode operar o sistema do brechó.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 shadow-sm"
        >
          <UserPlus size={18} /> Novo Usuário
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-xl border border-indigo-100 shadow-md animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold text-slate-800 mb-4">Cadastrar Novo Perfil</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 uppercase">Nome Completo</label>
              <input 
                type="text" 
                placeholder="Ex: Maria Silva" 
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500" 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 uppercase">E-mail de Login</label>
              <input 
                type="email" 
                placeholder="exemplo@email.com" 
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 uppercase">Cargo / Nível</label>
              <select 
                className="w-full p-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500" 
                value={role} 
                onChange={e => setRole(e.target.value as UserRole)}
              >
                <option value="CAIXA">Caixa (Operacional)</option>
                <option value="ADMIN">Administrador (Total)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t pt-4">
             <button 
              onClick={() => setShowAdd(false)} 
              className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg font-medium"
             >
               Cancelar
             </button>
             <button 
              onClick={handleSave} 
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition flex items-center gap-2"
             >
               {loading && <Loader2 size={16} className="animate-spin" />}
               Criar Acesso
             </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Usuário</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Cargo</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Cadastro</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {profiles.map(profile => (
              <tr key={profile.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${profile.role === 'ADMIN' ? 'bg-slate-800' : 'bg-indigo-500'}`}>
                      {profile.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{profile.name}</p>
                      <p className="text-xs text-slate-500">{profile.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                    profile.role === 'ADMIN' 
                      ? 'bg-slate-100 text-slate-700 border border-slate-200' 
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                  }`}>
                    {profile.role === 'ADMIN' ? <Shield size={12} /> : <User size={12} />}
                    {profile.role}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-500">
                  {new Date(profile.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleDelete(profile.id, profile.name)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Remover Acesso"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {profiles.length === 0 && (
              <tr>
                <td colSpan={4} className="p-12 text-center text-slate-400 italic">
                  Nenhum usuário cadastrado. Verifique a conexão com o banco.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
