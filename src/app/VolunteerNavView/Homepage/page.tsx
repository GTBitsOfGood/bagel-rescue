import Sidebar from '../../../components/Sidebar';

const Dashboard: React.FC = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '2rem' }}>
        <h1>Dashboard</h1>
        <p>Welcome to your dashboard! This page demonstrates how the sidebar is used within a new page.</p>
      </div>
    </div>
  );
};

export default Dashboard;