import React, { useState, useEffect } from 'react';
import { useLogGate } from '../../context/LogGateContext';
import { api } from '../../services/api';
import type { ApiKeyToken, ProjectMember } from '../../types';
import {
  Settings,
  Key,
  Hash,
  Users,
  Copy,
  Check,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Send,
} from 'lucide-react';

type SettingsTab = 'general' | 'tokens' | 'slack' | 'team';

export const ProjectSettings: React.FC = () => {
  const { currentProject, deleteCurrentProject } = useLogGate();

  const [activeSubTab, setActiveSubTab] = useState<SettingsTab>('general');

  // General Settings
  const [projectName, setProjectName] = useState(currentProject.name);
  const [copiedProjectId, setCopiedProjectId] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Tokens / API Keys
  const [tokens, setTokens] = useState<ApiKeyToken[]>([]);
  const [showNewTokenModal, setShowNewTokenModal] = useState(false);
  const [generatedRawToken, setGeneratedRawToken] = useState<string | null>(null);
  const [copiedRawToken, setCopiedRawToken] = useState(false);

  // Slack Integration
  const [slackWebhookUrl, setSlackWebhookUrl] = useState(
    currentProject.slack_webhook_url || 'https://hooks.slack.com/services/T048A9B1/B06C7D8E/9f38a8e10b2a7c4d5e6f'
  );
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [slackTestStatus, setSlackTestStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [isSavingSlack, setIsSavingSlack] = useState(false);
  const [isTestingSlack, setIsTestingSlack] = useState(false);

  // Team & Members
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [newMemberUserId, setNewMemberUserId] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'member' | 'owner'>('member');

  const projectId = currentProject.project_id || currentProject.id || 'proj_live_99a8b7';

  // Load Tokens and Members
  useEffect(() => {
    setProjectName(currentProject.name);
    setSlackWebhookUrl(currentProject.slack_webhook_url || '');

    api.tokens.listTokens(projectId).then(setTokens);
    api.projects.getMembers(projectId).then(setMembers);
  }, [projectId, currentProject]);

  // Copy Project ID
  const handleCopyProjectId = () => {
    navigator.clipboard.writeText(projectId);
    setCopiedProjectId(true);
    setTimeout(() => setCopiedProjectId(false), 2000);
  };

  // Create API Key Token
  const handleCreateToken = async () => {
    const res = await api.tokens.createToken(projectId);
    if (res.api_key) {
      setGeneratedRawToken(res.api_key);
      const updated = await api.tokens.listTokens(projectId);
      setTokens(updated);
    }
  };

  // Revoke Token
  const handleRevokeToken = async (keyId: string) => {
    await api.tokens.revokeToken(projectId, keyId);
    setTokens((prev) => prev.filter((t) => t.key_id !== keyId));
  };

  // Save Slack Config
  const handleSaveSlack = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSlack(true);
    await api.projects.setSlackChannel(projectId, slackWebhookUrl);
    setIsSavingSlack(false);
    setSlackTestStatus({
      type: 'success',
      message: 'Slack webhook URL saved successfully for this project.',
    });
  };

  // Test Slack Webhook
  const handleTestSlack = async () => {
    setIsTestingSlack(true);
    setSlackTestStatus({ type: null, message: '' });
    const res = await api.projects.testSlack(projectId);
    setIsTestingSlack(false);
    if (res.status === 'success') {
      setSlackTestStatus({
        type: 'success',
        message: 'Slack Block Kit alert delivered successfully (HTTP 200 OK)!',
      });
    } else {
      setSlackTestStatus({
        type: 'error',
        message: res.message || 'Slack delivery failed. Please check webhook permissions.',
      });
    }
  };

  // Add Member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberUserId.trim()) return;
    await api.projects.addMember(projectId, newMemberUserId.trim(), newMemberRole);
    const updated = await api.projects.getMembers(projectId);
    setMembers(updated);
    setNewMemberUserId('');
  };

  // Remove Member
  const handleRemoveMember = async (userId: string) => {
    await api.projects.removeMember(projectId, userId);
    setMembers((prev) => prev.filter((m) => m.user_id !== userId));
  };

  // Delete Project
  const handleDeleteProject = async () => {
    if (deleteConfirmationText !== currentProject.name) return;
    await deleteCurrentProject();
    setShowDeleteModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
          Project Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '4px' }}>
          Manage project metadata, host daemon authentication tokens, Slack notifications, and team permissions.
        </p>
      </div>

      {/* Supabase-Style Split Layout: Sub-Tabs on Left, Content on Right */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '220px 1fr',
          gap: '28px',
          alignItems: 'flex-start',
        }}
      >
        {/* Left Sub-Tabs Navigation */}
        <div className="sub-tabs-nav card" style={{ padding: '8px' }}>
          <button
            onClick={() => setActiveSubTab('general')}
            className={`sub-tab-btn ${activeSubTab === 'general' ? 'active' : ''}`}
          >
            <Settings size={15} />
            <span>General</span>
          </button>
          <button
            onClick={() => setActiveSubTab('tokens')}
            className={`sub-tab-btn ${activeSubTab === 'tokens' ? 'active' : ''}`}
          >
            <Key size={15} />
            <span>API Keys</span>
          </button>
          <button
            onClick={() => setActiveSubTab('slack')}
            className={`sub-tab-btn ${activeSubTab === 'slack' ? 'active' : ''}`}
          >
            <Hash size={15} />
            <span>Slack Alerting</span>
          </button>
          <button
            onClick={() => setActiveSubTab('team')}
            className={`sub-tab-btn ${activeSubTab === 'team' ? 'active' : ''}`}
          >
            <Users size={15} />
            <span>Team &amp; Access</span>
          </button>
        </div>

        {/* Right Sub-Tab Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* ===================== SUB-TAB A: GENERAL ===================== */}
          {activeSubTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>
                  General Configuration
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '20px' }}>
                  Primary project identifier and display properties.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '520px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                      Project Name
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                      Project ID (UUID)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="text"
                        className="input-field"
                        value={projectId}
                        readOnly
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}
                      />
                      <button onClick={handleCopyProjectId} className="btn btn-secondary btn-sm" title="Copy UUID">
                        {copiedProjectId ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div
                className="card"
                style={{
                  padding: '24px',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  background: 'rgba(239, 68, 68, 0.03)',
                }}
              >
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f87171', marginBottom: '4px' }}>
                  Danger Zone
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '16px' }}>
                  Permanently delete this project and all associated host telemetry, error patterns, and API keys.
                </p>

                <button onClick={() => setShowDeleteModal(true)} className="btn btn-danger btn-sm">
                  <Trash2 size={13} />
                  <span>Delete Project</span>
                </button>
              </div>
            </div>
          )}

          {/* ===================== SUB-TAB B: API KEYS ===================== */}
          {activeSubTab === 'tokens' && (
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Ingestion API Keys</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '2px' }}>
                    Used by the host agent daemons to authenticate payloads with the LogGate ingestion API.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setGeneratedRawToken(null);
                    setShowNewTokenModal(true);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={13} />
                  <span>Generate New Key</span>
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Key Prefix</th>
                      <th>Created</th>
                      <th>Last Used</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokens.map((token) => (
                      <tr key={token.key_id}>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                            {token.key_prefix}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(token.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {token.last_used_at ? 'Recent' : 'Never'}
                        </td>
                        <td>
                          <span className="badge badge-success">Active</span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleRevokeToken(token.key_id)}
                            className="btn btn-outline btn-sm"
                            style={{ color: '#f87171' }}
                            title="Revoke Token"
                          >
                            <Trash2 size={12} />
                            <span>Revoke</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================== SUB-TAB C: SLACK ===================== */}
          {activeSubTab === 'slack' && (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>
                Slack Alerting Integration
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '20px' }}>
                Configure incoming webhook endpoints where actionable incident notifications will be dispatched.
              </p>

              {slackTestStatus.type && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '6px',
                    marginBottom: '18px',
                    fontSize: '0.8125rem',
                    background:
                      slackTestStatus.type === 'success'
                        ? 'rgba(16, 185, 129, 0.12)'
                        : 'rgba(239, 68, 68, 0.12)',
                    border: `1px solid ${
                      slackTestStatus.type === 'success'
                        ? 'rgba(16, 185, 129, 0.3)'
                        : 'rgba(239, 68, 68, 0.3)'
                    }`,
                    color: slackTestStatus.type === 'success' ? '#34d399' : '#f87171',
                  }}
                >
                  {slackTestStatus.message}
                </div>
              )}

              <form onSubmit={handleSaveSlack} style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '620px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                    Slack Incoming Webhook URL
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type={showWebhookSecret ? 'text' : 'password'}
                      className="input-field"
                      placeholder="https://hooks.slack.com/services/..."
                      value={slackWebhookUrl}
                      onChange={(e) => setSlackWebhookUrl(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                      className="btn btn-secondary btn-sm"
                      title={showWebhookSecret ? 'Hide secret' : 'Show secret'}
                    >
                      {showWebhookSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Get this URL from your Slack App configuration under &quot;Incoming Webhooks&quot;.
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isSavingSlack}>
                    {isSavingSlack ? 'Saving...' : 'Save Configuration'}
                  </button>

                  <button
                    type="button"
                    onClick={handleTestSlack}
                    className="btn btn-secondary btn-sm"
                    disabled={isTestingSlack || !slackWebhookUrl}
                  >
                    <Send size={13} />
                    <span>{isTestingSlack ? 'Sending Test...' : 'Send Test Alert'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ===================== SUB-TAB D: TEAM ===================== */}
          {activeSubTab === 'team' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>Team Members</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '16px' }}>
                  Users with access to view and manage this project&apos;s alerts and daemons.
                </p>

                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email / ID</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.user_id}>
                        <td style={{ fontWeight: 600 }}>{member.username || 'Team Member'}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {member.email || member.user_id}
                        </td>
                        <td>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              background:
                                member.role === 'owner'
                                  ? 'rgba(16, 185, 129, 0.15)'
                                  : 'rgba(59, 130, 246, 0.15)',
                              color: member.role === 'owner' ? '#34d399' : '#60a5fa',
                            }}
                          >
                            {member.role}
                          </span>
                        </td>
                        <td>
                          {member.role !== 'owner' && (
                            <button
                              onClick={() => handleRemoveMember(member.user_id)}
                              className="btn btn-outline btn-sm"
                              style={{ color: '#f87171' }}
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Member Form */}
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>Invite Team Member</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '16px' }}>
                  Add an engineer by User ID or Email to collaborate on this project.
                </p>

                <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '10px', maxWidth: '520px' }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="User ID or Email..."
                    value={newMemberUserId}
                    onChange={(e) => setNewMemberUserId(e.target.value)}
                    required
                  />
                  <select
                    className="input-field"
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as 'member' | 'owner')}
                    style={{ width: '130px' }}
                  >
                    <option value="member">Member</option>
                    <option value="owner">Owner</option>
                  </select>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Add
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Token Modal */}
      {showNewTokenModal && (
        <div className="modal-overlay" onClick={() => setShowNewTokenModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>
              Create Host Ingestion Token
            </h3>

            {!generatedRawToken ? (
              <>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '20px' }}>
                  Generate a new high-entropy secret key for a host daemon node running in your infrastructure.
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button onClick={() => setShowNewTokenModal(false)} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                  <button onClick={handleCreateToken} className="btn btn-primary btn-sm">
                    Generate Key
                  </button>
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    background: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    color: '#fbbf24',
                    fontSize: '0.75rem',
                    marginBottom: '16px',
                  }}
                >
                  <strong>Important:</strong> Please copy this API key now. You will not be able to see it again!
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                    Raw API Key
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="text"
                      className="input-field"
                      value={generatedRawToken}
                      readOnly
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedRawToken);
                        setCopiedRawToken(true);
                        setTimeout(() => setCopiedRawToken(false), 2000);
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      {copiedRawToken ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowNewTokenModal(false)} className="btn btn-primary btn-sm">
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Project Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f87171', marginBottom: '6px' }}>
              Delete Project
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '16px' }}>
              This action cannot be undone. To confirm, please type <strong>{currentProject.name}</strong> below:
            </p>

            <input
              type="text"
              className="input-field"
              placeholder={currentProject.name}
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              style={{ marginBottom: '20px' }}
              autoFocus
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-secondary btn-sm">
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                className="btn btn-danger btn-sm"
                disabled={deleteConfirmationText !== currentProject.name}
              >
                I understand the consequences, delete this project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
