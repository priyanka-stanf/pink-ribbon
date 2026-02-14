import React from 'react';
import '../index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { LandingPage } from '../pages/LandingPage';
import { ProfilePage } from '../pages/ProfilePage';
import { MapSearchPage } from '../pages/MapSearchPage';
import { ComparisonPage } from '../pages/ComparisonPage';
import { SimulationDashboard } from '../pages/SimulationDashboard';
import { AboutUsPage } from '../pages/AboutUsPage';
import { DataSourcesPage } from '../pages/DataSourcesPage';
import { PrivacyPolicyPage } from '../pages/PrivacyPolicyPage';
import { MethodologyPage } from '../pages/MethodologyPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/map" element={<MapSearchPage />} />
          <Route path="/compare" element={<ComparisonPage />} />
          <Route path="/simulation" element={<SimulationDashboard />} />
          <Route path="/simulation/:hospitalId" element={<SimulationDashboard />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/data-sources" element={<DataSourcesPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/methodology" element={<MethodologyPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}