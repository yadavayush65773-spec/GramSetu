/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppShell } from './components/layout/AppShell';
import { FloatingAssistant } from './components/assistant/FloatingAssistant';

// Public & Auth Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Application Console Pages
import { OverviewDashboard } from './pages/OverviewDashboard';
import { SchemesProjects } from './pages/SchemesProjects';
import { BeneficiaryVerification } from './pages/BeneficiaryVerification';
import { FieldInspections } from './pages/FieldInspections';
import { InstallmentApprovals } from './pages/InstallmentApprovals';
import { RiskFraudDetection } from './pages/RiskFraudDetection';
import { GeographicIntelligence } from './pages/GeographicIntelligence';
import { OfflineWorkspace } from './pages/OfflineWorkspace';
import { ReportsAnalytics } from './pages/ReportsAnalytics';
import { AuditTrail } from './pages/AuditTrail';
import { PublicTransparencyPortal } from './pages/PublicTransparencyPortal';
import { AIAssistantView } from './pages/AIAssistantView';
import { UserRoleManagement } from './pages/UserRoleManagement';
import { SettingsView } from './pages/SettingsView';

const PageRouter: React.FC = () => {
  const { activePage } = useApp();

  switch (activePage) {
    case 'overview':
      return <OverviewDashboard />;
    case 'schemes':
      return <SchemesProjects />;
    case 'beneficiaries':
      return <BeneficiaryVerification />;
    case 'inspections':
      return <FieldInspections />;
    case 'installments':
      return <InstallmentApprovals />;
    case 'risk_fraud':
      return <RiskFraudDetection />;
    case 'geo_map':
      return <GeographicIntelligence />;
    case 'offline_workspace':
      return <OfflineWorkspace />;
    case 'reports':
      return <ReportsAnalytics />;
    case 'audit_trail':
      return <AuditTrail />;
    case 'public_portal':
      return <PublicTransparencyPortal />;
    case 'ai_assistant':
      return <AIAssistantView />;
    case 'user_roles':
      return <UserRoleManagement />;
    case 'settings':
      return <SettingsView />;
    default:
      return <OverviewDashboard />;
  }
};

const MainLayout: React.FC = () => {
  const { activePage } = useApp();

  // Full-screen public landing & authentication flows
  if (activePage === 'landing') {
    return <LandingPage />;
  }
  if (activePage === 'login') {
    return <LoginPage />;
  }
  if (activePage === 'register') {
    return <RegisterPage />;
  }

  // Institutional Management Console
  return (
    <>
      <AppShell>
        <PageRouter />
      </AppShell>
      <FloatingAssistant />
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
