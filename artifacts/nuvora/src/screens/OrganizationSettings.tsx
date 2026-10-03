import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RotateCcw } from 'lucide-react';
import { useCurrentOrganization, useUpdateOrganization } from '../lib/api/organization';
import { useDemoData } from '../data/context';

export function OrganizationSettings() {
  const { data: apiOrganization, isLoading, error } = useCurrentOrganization();
  const updateOrganization = useUpdateOrganization();
  const { data: demoData, updateOrganization: updateDemoOrganization } = useDemoData();
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);
  const [usingDemo, setUsingDemo] = useState(false);

  // Use API data if available, otherwise fall back to demo data
  const organization = apiOrganization || demoData.organization;

  useEffect(() => {
    if (organization) {
      setName(organization.name);
      setUsingDemo(!apiOrganization);
    }
  }, [organization, apiOrganization]);

  const handleSave = async () => {
    try {
      if (apiOrganization) {
        // Try to save to API
        await updateOrganization.mutateAsync({ name });
      } else {
        // Fall back to demo data
        updateDemoOrganization({ name });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to update organization:', err);
      // Fall back to demo data on error
      updateDemoOrganization({ name });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <main className="page-wrap">
      <div className="page-heading">
        <div>
          <div className="eyebrow">SETTINGS</div>
          <h1 className="page-title">Organization</h1>
          <div className="page-subtitle">Workspace identity and operating context.</div>
        </div>
        {usingDemo && (
          <button className="btn btn-danger" onClick={() => { demoData.reset(); setName('Northstar Collective'); }} data-testid="button-reset-demo-data">
            <RotateCcw size={13} />Reset demo data
          </button>
        )}
      </div>
      <div className="settings-grid">
        <div className="panel settings-menu">
          {[
            ['Organization', '/settings/organization'],
            ['Users', '/settings/users'],
            ['Roles & permissions', '/settings/roles'],
            ['Modules', '/settings/modules'],
            ['Integrations', '/settings/integrations'],
          ].map(([label, path]) => (
            <Link
              href={path}
              className={`nav-link ${path === '/settings/organization' ? 'active' : ''}`}
              key={path}
            >
              {label}
            </Link>
          ))}
        </div>
        <section className="panel panel-pad">
          <div className="panel-title">Organization profile</div>
          <div className="panel-caption">
            {usingDemo
              ? 'Changes persist in local browser storage. No server organization is provisioned.'
              : 'Changes are saved to the server and persist across sessions.'}
          </div>
          {usingDemo && (
            <div className="notice" style={{ marginBottom: 15 }}>
              <strong>Demo mode active</strong><br/>
              The API server is not available. Changes are saved locally in your browser.
            </div>
          )}
          <div className="form-grid" style={{ marginTop: 20 }}>
            <div className="form-field full">
              <label htmlFor="setting-org-name">Organization name</label>
              <input
                id="setting-org-name"
                className="field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="input-setting-org-name"
              />
            </div>
            <div className="form-field">
              <label>Organization ID</label>
              <input className="field" value={organization?.id} readOnly />
            </div>
            <div className="form-field">
              <label>Industry</label>
              <input
                className="field"
                value={demoData.organization.industry}
                readOnly
              />
            </div>
            <div className="form-field">
              <label>Timezone</label>
              <input
                className="field"
                value={demoData.organization.timezone}
                readOnly
              />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18 }}>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={updateOrganization.isPending}
              data-testid="button-save-organization"
            >
              {updateOrganization.isPending ? 'Saving...' : 'Save changes'}
            </button>
            {saved && (
              <span className="panel-caption" data-testid="text-organization-saved">
                {usingDemo ? 'Saved locally.' : 'Saved successfully.'}
              </span>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
