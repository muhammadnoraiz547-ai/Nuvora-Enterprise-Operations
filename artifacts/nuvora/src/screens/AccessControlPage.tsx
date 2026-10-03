import ResourcePage from '../components/ResourcePage';

export default function AccessControlPage() {
  return (
    <ResourcePage
      eyebrow="GOVERNANCE"
      title="Access Control"
      subtitle="Manage permissions and access boundaries across the organization."
      collection="roles"
      columns={[
        { key: 'name', label: 'Role' },
        { key: 'users', label: 'People' },
        { key: 'permissions', label: 'Permissions summary' },
        { key: 'scope', label: 'Scope' },
        { key: 'status', label: 'Status' },
      ]}
      createLabel="Create role"
      fields={['name', 'users', 'permissions', 'scope']}
      description="Access control configuration. Permission enforcement depends on your authorization system."
    />
  );
}
