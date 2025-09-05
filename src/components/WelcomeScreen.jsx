import React from 'react';
import { IconComponents } from './IconComponents';
import Logo from '../assets/logo.png';

const WelcomeScreen = ({ onNavigate }) => (
  <div id="welcome-screen" className="welcome-container">
    {/* Top Navigation */}
    <nav className="navbar">
      <div className="logo-container">
        <img src={Logo} alt="FinADR Logo" className="logo-sm" />
        <span className="app-name">FinADR</span>
      </div>
      <div className="nav-buttons">
        <button
          onClick={() => onNavigate("auth", "login")}
          className="btn btn-secondary"
        >
          Login
        </button>
        <button
          onClick={() => onNavigate("auth", "signup")}
          className="btn btn-primary"
        >
          Sign Up
        </button>
      </div>
    </nav>

    {/* Hero Section */}
    <header className="hero-section">
      <h1 className="hero-title">Take Control of Your Finances</h1>
      <h2 className="tagline">Your Finance and Life Advisor</h2>
      <p className="hero-description">
        Track personal expenses, manage shared budgets with friends, and get
        AI-powered insights to achieve your financial goals.
      </p>
      <button
        onClick={() => onNavigate("auth", "signup")}
        className="btn btn-cta"
      >
        Get Started
      </button>
    </header>

    {/* Features Section */}
    <section className="features-section">
      <h3 className="section-title">Why Choose FinADR?</h3>
      <div className="features-grid">
        <div className="feature-card">
          <IconComponents.BrainIcon />
          <h4>Smart Tracking</h4>
          <p>
            AI suggestions and automatic timestamps make logging expenses
            effortless.
          </p>
        </div>
        <div className="feature-card">
          <IconComponents.UsersIcon />
          <h4>Collaborative Pools</h4>
          <p>
            Share finances with friends or family. Split bills and track group
            spending easily.
          </p>
        </div>
        <div className="feature-card">
          <IconComponents.SparklesIcon />
          <h4>AI-Powered Insights</h4>
          <p>
            Visualize your spending with charts and get personalized savings
            tips from our AI.
          </p>
        </div>
        <div className="feature-card">
          <IconComponents.ShieldCheckIcon />
          <h4>Secure & Private</h4>
          <p>
            Your financial data is encrypted and protected with
            industry-standard security.
          </p>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="footer">
      <p>&copy; 2025 FinADR. All rights reserved.</p>
    </footer>
  </div>
);

export default WelcomeScreen;
