import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  Trash2,
  Send,
  Copy,
  CheckCheck,
  AlertTriangle,
  FolderGit2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  ChevronDown,
  Info
} from 'lucide-react';
import { SlackIcon } from '../components/common/Icons';
import { projectApi, type ProjectMember } from '../lib/api';
import { useProject, DEFAULT_PROJECT } from '../context/ProjectContext';
import { staggerContainer, fadeInSlideUp, springTransition } from '../lib/motion';

export const SettingsPage: React.FC = () => {
  const { activeProject, refreshProjects, projects, setActiveProject, createProject } = useProject();

  // Project Switcher & Creator
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);

  // Project Info State
  const [copiedId, setCopiedId] = useState(false);

  // Members State
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [newRole, setNewRole] = useState('member');
  const [memberActionMsg, setMemberActionMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Slack State
  const [slackUrl, setSlackUrl] = useState('');
  const [savingSlack, setSavingSlack] = useState(false);
  const [testingSlack, setTestingSlack] = useState(false);
  const [slackMsg, setSlackMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Danger Zone State
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const effectiveProject = activeProject || DEFAULT_PROJECT;

  // Fetch Members
  const fetchMembers = useCallback(async () => {
    if (!effectiveProject || effectiveProject.project_id === DEFAULT_PROJECT.project_id) {
      setMembers([
        { project_id: effectiveProject.project_id, user_id: 'Current User (You)', role: 'owner' }
      ]);
      return;
    }
    setLoadingMembers(true);
    try {
      const data = await projectApi.members(effectiveProject.project_id);
      setMembers(data && data.length > 0 ? data : [
        { project_id: effectiveProject.project_id, user_id: 'Current User (You)', role: 'owner' }
      ]);
    } catch {
      setMembers([
        { project_id: effectiveProject.project_id, user_id: 'Current User (You)', role: 'owner' }
      ]);
    } finally {
      setLoadingMembers(false);
    }
  }, [effectiveProject]);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!ignore) {
        await fetchMembers();
        setSlackUrl(effectiveProject.slack_webhook_url || '');
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [effectiveProject, fetchMembers]);

  // Copy Project ID
  const handleCopyId = async () => {
    await navigator.clipboard.writeText(effectiveProject.project_id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Add Member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserId.trim()) return;
    setMemberActionMsg(null);
    try {
      if (effectiveProject.project_id !== DEFAULT_PROJECT.project_id) {
        await projectApi.addMember(effectiveProject.project_id, newUserId.trim(), newRole);
      }
      setMembers((prev) => [...prev, { project_id: effectiveProject.project_id, user_id: newUserId.trim(), role: newRole }]);
      setMemberActionMsg({ text: `Member "${newUserId}" added successfully.`, ok: true });
      setNewUserId('');
      await fetchMembers();
    } catch (err: unknown) {
      setMemberActionMsg({ text: err instanceof Error ? err.message : 'Failed to add member', ok: false });
    }
  };

  // Remove Member
  const handleRemoveMember = async (userId: string) => {
    if (!confirm(`Are you sure you want to remove user "${userId}" from this project?`)) return;
    try {
      if (effectiveProject.project_id !== DEFAULT_PROJECT.project_id) {
        await projectApi.removeMember(effectiveProject.project_id, userId);
      }
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
      setMemberActionMsg({ text: `User "${userId}" removed.`, ok: true });
      await fetchMembers();
    } catch (err: unknown) {
      setMemberActionMsg({ text: err instanceof Error ? err.message : 'Failed to remove member', ok: false });
    }
  };

  // Save Slack
  const handleSaveSlack = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSlack(true);
    setSlackMsg(null);
    try {
      if (effectiveProject.project_id !== DEFAULT_PROJECT.project_id) {
        await projectApi.setSlack(effectiveProject.project_id, slackUrl.trim());
      }
      setActiveProject({ ...effectiveProject, slack_webhook_url: slackUrl.trim() });
      setSlackMsg({ text: 'Slack webhook saved successfully.', ok: true });
      await refreshProjects();
    } catch (err: unknown) {
      setSlackMsg({ text: err instanceof Error ? err.message : 'Failed to set Slack channel', ok: false });
    } finally {
      setSavingSlack(false);
    }
  };

  // Test Slack
  const handleTestSlack = async () => {
    setTestingSlack(true);
    setSlackMsg(null);
    try {
      if (effectiveProject.project_id !== DEFAULT_PROJECT.project_id) {
        await projectApi.testSlack(effectiveProject.project_id);
      }
      setSlackMsg({ text: 'Test alert dispatched to Slack successfully!', ok: true });
    } catch (err: unknown) {
      setSlackMsg({ text: err instanceof Error ? err.message : 'Slack test failed. Verify webhook URL.', ok: false });
    } finally {
      setTestingSlack(false);
    }
  };

  // Create Project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    setCreatingProject(true);
    try {
      const created = await createProject(newProjectName.trim());
      if (created) {
        setNewProjectName('');
        setShowCreateModal(false);
      }
    } finally {
      setCreatingProject(false);
    }
  };

  // Delete Project
  const handleDeleteProject = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      if (effectiveProject.project_id !== DEFAULT_PROJECT.project_id) {
        await projectApi.delete(effectiveProject.project_id);
      }
      await refreshProjects();
      const remaining = projects.filter((p) => p.project_id !== effectiveProject.project_id);
      if (remaining.length > 0) {
        setActiveProject(remaining[0]);
      } else {
        setActiveProject(DEFAULT_PROJECT);
      }
      setConfirmDelete(false);
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  const isDefaultProject = effectiveProject.project_id === DEFAULT_PROJECT.project_id;

  return (
    <div className="page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 className="page-title">Project Settings</h1>
            {isDefaultProject && (
              <span className="badge badge--zinc">Default Workspace</span>
            )}
          </div>
          <p className="page-desc">
            Manage active project configuration, team members, Slack incident webhooks, and project lifecycle
          </p>
        </div>

        {/* Project Switcher & Creator Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
          <button
            className="btn-secondary"
            onClick={() => setShowProjectDropdown(!showProjectDropdown)}
            style={{ fontSize: '0.8125rem', padding: '6px 12px', gap: '6px' }}
          >
            <FolderGit2 size={14} className="text-zinc-600" />
            <span style={{ fontWeight: 600 }}>{effectiveProject.name}</span>
            <ChevronDown size={13} className="text-zinc-400" />
          </button>

          <button
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
            style={{ fontSize: '0.8125rem', padding: '6px 12px' }}
          >
            <Plus size={14} />
            <span>New Project</span>
          </button>

          {/* Project Switcher Dropdown */}
          <AnimatePresence>
            {showProjectDropdown && (
              <motion.div
                className="project-dropdown"
                variants={fadeInSlideUp}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{ top: 'calc(100% + 4px)', right: 0, left: 'auto', width: '240px' }}
              >
                <div style={{ padding: '6px 10px', fontSize: '0.6875rem', fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase' }}>
                  Switch Project
                </div>
                {projects.map((p) => (
                  <button
                    key={p.project_id}
                    className={`project-option ${effectiveProject.project_id === p.project_id ? 'project-option--active' : ''}`}
                    onClick={() => {
                      setActiveProject(p);
                      setShowProjectDropdown(false);
                    }}
                  >
                    <div className="project-dot project-dot--sm" />
                    <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                    {effectiveProject.project_id === p.project_id && <CheckCircle2 size={12} className="text-emerald-600" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Info notice if on default project */}
      {isDefaultProject && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '10px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            fontSize: '0.8125rem',
            color: '#475569'
          }}
        >
          <Info size={16} className="text-blue-500" style={{ flexShrink: 0 }} />
          <span>
            You are currently working in the <strong>Default Workspace</strong>. Any configuration you set here is active immediately. To create a dedicated database-backed project, click <strong>New Project</strong>.
          </span>
        </div>
      )}

      <motion.div
        className="settings-layout"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        {/* Section 1: General Project Information */}
        <motion.div className="card" style={{ padding: '24px', background: '#fff', border: '1px solid #e4e4e7', borderRadius: '12px' }} variants={fadeInSlideUp}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <FolderGit2 size={18} className="text-zinc-700" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#09090b', margin: 0 }}>
              General Information
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>
                Project Name
              </label>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#09090b', marginTop: '4px' }}>
                {effectiveProject.name}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>
                Project ID
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <code className="key-prefix" style={{ fontSize: '0.8125rem' }}>{effectiveProject.project_id}</code>
                <button className="icon-btn" onClick={handleCopyId} title="Copy Project ID">
                  {copiedId ? <CheckCheck size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>
                Created At
              </label>
              <div style={{ fontSize: '0.875rem', color: '#3f3f46', marginTop: '4px' }}>
                {new Date(effectiveProject.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section 2: Team Members */}
        <motion.div className="card" style={{ padding: '24px', background: '#fff', border: '1px solid #e4e4e7', borderRadius: '12px' }} variants={fadeInSlideUp}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={18} className="text-zinc-700" />
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#09090b', margin: 0 }}>
                Team Members
              </h2>
            </div>
            <span className="badge badge--zinc">{members.length} member{members.length === 1 ? '' : 's'}</span>
          </div>

          {memberActionMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '0.8125rem',
                background: memberActionMsg.ok ? '#f0fdf4' : '#fff1f2',
                color: memberActionMsg.ok ? '#15803d' : '#be123c',
                border: `1px solid ${memberActionMsg.ok ? '#bbf7d0' : '#fecdd3'}`
              }}
            >
              {memberActionMsg.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              <span>{memberActionMsg.text}</span>
            </div>
          )}

          {/* Members Table */}
          <div className="table-card" style={{ marginBottom: '20px', border: '1px solid #e4e4e7' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User / Member ID</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingMembers ? (
                  <tr><td colSpan={3}><div className="skeleton" /></td></tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ color: '#a1a1aa', textAlign: 'center', padding: '20px' }}>
                      No members added yet
                    </td>
                  </tr>
                ) : (
                  members.map((m) => (
                    <tr key={m.user_id} className="table-row">
                      <td className="font-medium" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldCheck size={14} className="text-zinc-500" />
                        <span className="mono text-xs">{m.user_id}</span>
                      </td>
                      <td>
                        <span className={m.role === 'owner' ? 'badge badge--emerald' : 'badge badge--zinc'}>
                          {m.role}
                        </span>
                      </td>
                      <td>
                        {m.role !== 'owner' ? (
                          <button
                            className="revoke-btn"
                            onClick={() => handleRemoveMember(m.user_id)}
                            title="Remove Member"
                          >
                            <Trash2 size={13} />
                            Remove
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Primary Owner</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Add Member Form */}
          <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>User ID / UUID</label>
              <input
                className="form-input"
                placeholder="e.g. user_id or email..."
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                required
              />
            </div>
            <div style={{ width: '140px' }}>
              <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>Role</label>
              <select className="filter-select" style={{ width: '100%', height: '38px' }} value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <motion.button
              type="submit"
              className="btn-primary"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={springTransition}
              style={{ height: '38px' }}
            >
              <UserPlus size={14} />
              <span>Add Member</span>
            </motion.button>
          </form>
        </motion.div>

        {/* Section 3: Slack Alert Routing */}
        <motion.div className="card" style={{ padding: '24px', background: '#fff', border: '1px solid #e4e4e7', borderRadius: '12px' }} variants={fadeInSlideUp}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <SlackIcon size={18} className="text-zinc-700" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#09090b', margin: 0 }}>
              Slack Alerting Integration
            </h2>
          </div>

          <p style={{ fontSize: '0.8125rem', color: '#71717a', marginBottom: '16px' }}>
            Configure the default incoming webhook URL for incident triage routing. Whenever the triage engine classifies an anomaly as critical, alerts will be posted here.
          </p>

          {slackMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '0.8125rem',
                background: slackMsg.ok ? '#f0fdf4' : '#fff1f2',
                color: slackMsg.ok ? '#15803d' : '#be123c',
                border: `1px solid ${slackMsg.ok ? '#bbf7d0' : '#fecdd3'}`
              }}
            >
              {slackMsg.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              <span>{slackMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveSlack} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>Incoming Slack Webhook URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://hooks.slack.com/services/T000/B000/XXXXX"
                value={slackUrl}
                onChange={(e) => setSlackUrl(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <motion.button
                type="submit"
                className="btn-primary"
                disabled={savingSlack}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={springTransition}
              >
                {savingSlack ? 'Saving…' : 'Save Slack Webhook'}
              </motion.button>

              <motion.button
                type="button"
                onClick={handleTestSlack}
                disabled={testingSlack || !slackUrl}
                className="btn-secondary"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={springTransition}
                style={{ gap: '6px' }}
              >
                <Send size={13} />
                <span>{testingSlack ? 'Sending Test…' : 'Test Slack Alert'}</span>
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Section 4: Danger Zone (Delete Project) */}
        <motion.div
          className="card"
          style={{
            padding: '24px',
            border: '1px solid #fecdd3',
            background: '#fff',
            borderRadius: '12px'
          }}
          variants={fadeInSlideUp}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <AlertTriangle size={18} className="text-rose-600" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#be123c', margin: 0 }}>
              Danger Zone
            </h2>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#71717a', marginBottom: '16px' }}>
            Permanently delete this project along with all associated agent machines, API tokens, and deduplicated log records. This action cannot be undone.
          </p>

          {deleteError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '0.8125rem',
                background: '#fff1f2',
                color: '#be123c',
                border: '1px solid #fecdd3'
              }}
            >
              <AlertCircle size={15} />
              <span>{deleteError}</span>
            </div>
          )}

          {!confirmDelete ? (
            <button
              type="button"
              className="revoke-btn"
              onClick={() => setConfirmDelete(true)}
              style={{ padding: '8px 16px', fontSize: '0.8125rem' }}
            >
              <Trash2 size={14} />
              <span>Delete Project</span>
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={handleDeleteProject}
                disabled={deleting}
                style={{
                  background: '#e11d48',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {deleting ? 'Deleting…' : 'Yes, Delete This Project'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setConfirmDelete(false)}
                style={{ padding: '8px 14px', fontSize: '0.8125rem' }}
              >
                Cancel
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* New Project Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <motion.div
              className="modal"
              onClick={(e) => e.stopPropagation()}
              variants={fadeInSlideUp}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="modal-header">
                <h3 className="modal-title">Create New Project</h3>
                <button className="icon-btn" onClick={() => setShowCreateModal(false)}>✕</button>
              </div>
              <p className="modal-desc">
                Organize your fleet machines, tokens, and alert routing under an isolated project.
              </p>
              <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Project Name</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Staging Services"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={creatingProject || !newProjectName.trim()}
                  >
                    {creatingProject ? 'Creating…' : 'Create Project'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
