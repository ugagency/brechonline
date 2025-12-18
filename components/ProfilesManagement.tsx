
import React, { useState } from 'react';
import { useStore } from '../services/store';
import { UserPlus, Trash2, Shield, User, Loader2, Key, CheckCircle2, XCircle, Power, AlertTriangle } from 'lucide-react';
import { UserRole, Profile } from '../types';

interface ProfilesManagementProps {
  currentUser: Profile;
}

export const ProfilesManagement: React.FC<ProfilesManagementProps> = ({ currentUser }) => {
  const { profiles, addProfile, deleteProfile, toggleProfileStatus } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('CAIXA');

  const handleSave = async () => {
    if (!name || !email || !password) {
      alert("Preencha todos os campos, incluindo a senha.");
      return;
    }
    setLoading(true);
    try {
      await addProfile({ name, email, password, role });
      setShowAdd(false);
      setName('');
      setEmail('');
      setPassword('');
      setRole('CAIXA');
    } catch (e: any) {
      console.error('Erro ao salvar perfil:', e);
      alert(`FALHA AO SALVAR: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    // Garantir comparação de string para IDs do banco
    if (String(id) === String(currentUser.id)) {
      alert("Você não pode excluir sua própria conta enquanto estiver logado.");
      return;
    }
    
    if (!confirm(`Tem certeza que deseja remover permanentemente o acesso de ${name}?`)) return;
    
    setProcessingId(id);
    try {
      await deleteProfile(id);
    } catch (e: any) {
      alert("Erro ao excluir perfil: " + (e.message || "Erro desconhecido"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleStatus = async (id: string, name: string, active: boolean) => {
    // Se a conta está ativa e o usuário tenta desativar a si mesmo
    if (String(id) === String(currentUser.id) && active) {
      alert("Você não pode desativar sua própria conta. Peça para outro administrador se necessário.");
      return;
    }
    
    const action = active ? "desativar" : "ativar";
    if (!confirm(`Deseja realmente ${action} a conta de ${name}?`)) return;
    
    setProcessingId(id);
    try {
      await toggleProfileStatus(id, active);
    } catch (e: any) {
      alert("Erro ao alterar status: " + e.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Controle de Acessos</h2>
          <p className="text-slate-500 text-sm">Gerencie operadores, cargos e senhas do sistema.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition flex items-center gap-2 shadow-sm font-medium"
        >
          <UserPlus size={18} /> Novo Usuário
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-xl animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Key size={20} className="text-orange-600" />
            Configurar Novo Acesso
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-tight">Nome Completo</label>
              <input 
                type="text" 
                placeholder="Ex: Maria Silva" 
                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-tight">E-mail (Login)</label>
              <input 
                type="email" 
                placeholder="exemplo@email.com" 
                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-tight">Senha Inicial</label>
              <input 
                type="password" 
                placeholder="Mínimo 6 dígitos" 
                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-tight">Nível de Acesso</label>
              <select 
                className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-orange-500 outline-none" 
                value={role} 
                onChange={e => setRole(e.target.value as UserRole)}
              >
                <option value="CAIXA">Caixa (Operacional)</option>
                <option value="ADMIN">Administrador (Total)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t pt-5">
             <button 
              onClick={() => setShowAdd(false)} 
              className="px-5 py-2.5 text-slate-500 hover:bg-slate-50 rounded-xl font-bold"
             >
               Cancelar
             </button>
             <button 
              onClick={handleSave} 
              disabled={loading}
              className="px-8 py-2.5 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition flex items-center gap-2 shadow-lg active:scale-95"
             >
               {loading && <Loader2 size={18} className="animate-spin" />}
               Salvar Acesso
             </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Usuário</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Cargo</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {profiles.map(profile => (
              <tr key={profile.id} className={`transition-colors ${!profile.active ? 'bg-gray-50/50' : 'hover:bg-slate-50'}`}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${!profile.active ? 'bg-slate-300' : profile.role === 'ADMIN' ? 'bg-slate-800' : 'bg-orange-500'}`}>
                      {profile.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`font-bold ${!profile.active ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{profile.name}</p>
                        {String(profile.id) === String(currentUser.id) && (
                          <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded border border-orange-200 font-bold uppercase">Você</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{profile.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    profile.active 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                      : 'bg-rose-50 text-rose-700 border-rose-100'
                  }`}>
                    {profile.active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {profile.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold ${
                    profile.role === 'ADMIN' 
                      ? 'bg-slate-100 text-slate-700 border border-slate-200' 
                      : 'bg-orange-50 text-orange-700 border border-orange-100'
                  }`}>
                    {profile.role === 'ADMIN' ? <Shield size={12} /> : <User size={12} />}
                    {profile.role}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-1">
                    {processingId === profile.id ? (
                      <div className="p-2"><Loader2 size={18} className="animate-spin text-orange-600" /></div>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleToggleStatus(profile.id, profile.name, profile.active)}
                          className={`p-2 rounded-xl transition-all ${
                            profile.active 
                              ? 'text-amber-500 hover:bg-amber-50' 
                              : 'text-emerald-500 hover:bg-emerald-50'
                          } ${String(profile.id) === String(currentUser.id) && profile.active ? 'opacity-30 cursor-not-allowed' : ''}`}
                          title={profile.active ? "Desativar Conta" : "Ativar Conta"}
                          disabled={String(profile.id) === String(currentUser.id) && profile.active}
                        >
                          <Power size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(profile.id, profile.name)}
                          className={`p-2 rounded-xl transition-all ${
                            String(profile.id) === String(currentUser.id) 
                              ? 'text-slate-200 cursor-not-allowed' 
                              : 'text-slate-300 hover:text-red-500 hover:bg-red-50'
                          }`}
                          title="Excluir Definitivamente"
                          disabled={String(profile.id) === String(currentUser.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-800 text-sm">
        <AlertTriangle size={20} className="flex-shrink-0" />
        <p>
          <strong>Segurança:</strong> Administradores não podem excluir ou desativar a própria conta para evitar bloqueios acidentais. Se precisar sair da empresa, peça para outro administrador remover seu acesso.
        </p>
      </div>
    </div>
  );
};
