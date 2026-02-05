import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AppArchitecture.css';

// Icons as inline SVG components
const FolderIcon = ({ isOpen }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {isOpen ? (
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    ) : (
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z" />
    )}
  </svg>
);

const FileIcon = ({ type }) => {
  const colors = {
    js: '#f7df1e',
    jsx: '#61dafb',
    css: '#264de4',
    json: '#5b5b5b',
    env: '#4caf50',
    svg: '#ffb13b',
    default: '#8b8b8b'
  };
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={colors[type] || colors.default} stroke="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" opacity="0.3"/>
      <path d="M14 2v6h6" fill="none" stroke={colors[type] || colors.default} strokeWidth="2"/>
    </svg>
  );
};

const ChevronIcon = ({ isOpen }) => (
  <motion.svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    animate={{ rotate: isOpen ? 90 : 0 }}
    transition={{ duration: 0.2 }}
  >
    <path d="M9 18l6-6-6-6" />
  </motion.svg>
);

// File tree data structure
const fileTreeData = {
  name: 'FINALPROJECT',
  type: 'folder',
  children: [
    {
      name: 'Shopping_List (Frontend)',
      type: 'folder',
      highlight: 'frontend',
      children: [
        {
          name: 'src',
          type: 'folder',
          children: [
            {
              name: 'components',
              type: 'folder',
              description: '24+ component directories',
              children: [
                { name: 'ProductList/', type: 'folder', files: 37, description: 'Product browsing, search, filtering' },
                { name: 'Cart/', type: 'folder', files: 12, description: 'Cart management, category organization' },
                { name: 'CartOptimization/', type: 'folder', files: 8, description: 'Price optimization algorithms' },
                { name: 'AI/', type: 'folder', files: 15, description: 'AI chat interface, voice interaction' },
                { name: 'History/', type: 'folder', files: 6, description: 'Purchase history tracking' },
                { name: 'Stats/', type: 'folder', files: 4, description: 'Analytics dashboards' },
                { name: 'Toolbar/', type: 'folder', files: 3, description: 'Navigation toolbar' },
                { name: 'PriceList/', type: 'folder', files: 4, description: 'Price comparison views' },
              ]
            },
            {
              name: 'hooks',
              type: 'folder',
              description: 'Custom React hooks',
              children: [
                { name: 'useCartState.js', type: 'file', ext: 'js', description: 'Cart data management' },
                { name: 'useCartTotals.js', type: 'file', ext: 'js', description: 'Price calculations' },
                { name: 'useCartActions.js', type: 'file', ext: 'js', description: 'Cart operations' },
                { name: 'useVibrate.js', type: 'file', ext: 'js', description: 'Haptic feedback' },
                { name: 'useLongPress.js', type: 'file', ext: 'js', description: 'Long-press detection' },
              ]
            },
            { name: 'pages/', type: 'folder', description: 'Page components' },
            { name: 'utils/', type: 'folder', description: 'Utility functions' },
            { name: 'App.js', type: 'file', ext: 'js', description: 'Main app component' },
            { name: 'Routing.js', type: 'file', ext: 'js', description: 'Route definitions' },
          ]
        },
        { name: 'package.json', type: 'file', ext: 'json', description: '40+ dependencies' },
      ]
    },
    {
      name: 'Shopping_List_Backend (Backend)',
      type: 'folder',
      highlight: 'backend',
      children: [
        {
          name: 'controllers',
          type: 'folder',
          description: '91 JavaScript files',
          children: [
            { name: 'productController.js', type: 'file', ext: 'js', description: 'Product CRUD operations' },
            { name: 'cartController.js', type: 'file', ext: 'js', description: 'Cart management (46K+ lines)' },
            { name: 'priceController.js', type: 'file', ext: 'js', description: 'Price operations' },
            { name: 'cart-optimizationController.js', type: 'file', ext: 'js', description: 'Optimization algorithms' },
            { name: 'aiController.js', type: 'file', ext: 'js', description: 'AI request handling' },
            { name: 'voiceAssistentController.js', type: 'file', ext: 'js', description: 'Voice command processing' },
            { name: 'historyController.js', type: 'file', ext: 'js', description: 'Purchase history' },
          ]
        },
        {
          name: 'models',
          type: 'folder',
          description: '11 MongoDB schemas',
          children: [
            { name: 'Product.js', type: 'file', ext: 'js', description: 'Product schema' },
            { name: 'Price.js', type: 'file', ext: 'js', description: 'Price schema' },
            { name: 'Cart.js', type: 'file', ext: 'js', description: 'Cart schema' },
            { name: 'History.js', type: 'file', ext: 'js', description: 'History schema' },
            { name: 'Supermarket.js', type: 'file', ext: 'js', description: 'Supermarket schema' },
          ]
        },
        {
          name: 'routes',
          type: 'folder',
          description: '16 API route groups',
          children: [
            { name: 'productRoutes.js', type: 'file', ext: 'js' },
            { name: 'cartRoutes.js', type: 'file', ext: 'js' },
            { name: 'priceRoutes.js', type: 'file', ext: 'js' },
            { name: 'aiRoutes.js', type: 'file', ext: 'js' },
            { name: 'voiceAssistentRoutes.js', type: 'file', ext: 'js' },
          ]
        },
        {
          name: 'functions',
          type: 'folder',
          description: 'AI integrations',
          children: [
            { name: 'openai_requests.js', type: 'file', ext: 'js', description: 'GPT-4 & Whisper API' },
            { name: 'text_to_speech.js', type: 'file', ext: 'js', description: 'ElevenLabs TTS' },
          ]
        },
        { name: 'app.js', type: 'file', ext: 'js', description: 'Express app setup' },
        { name: 'server.js', type: 'file', ext: 'js', description: 'Server entry point' },
        { name: 'config.env', type: 'file', ext: 'env', description: 'Environment variables' },
      ]
    }
  ]
};

// Component hierarchy data
const componentHierarchy = [
  {
    name: 'App',
    description: 'Root component, wraps everything',
    dataFlow: 'Provides routing context',
    children: [
      {
        name: 'Toolbar',
        description: 'Navigation bar',
        dataFlow: 'Uses useCartTotals hook',
        children: []
      },
      {
        name: 'Routing',
        description: 'Route definitions',
        dataFlow: 'Renders page based on URL',
        children: [
          {
            name: 'Home → ProductList',
            description: 'Product browsing',
            dataFlow: 'Fetches products from API',
            children: [
              { name: 'CategoryNavigation', dataFlow: 'Filters products' },
              { name: 'ProductCard', dataFlow: 'Displays product info' },
              { name: 'ProductImageDisplay', dataFlow: 'Lazy loads images' },
            ]
          },
          {
            name: 'Cart',
            description: 'Shopping cart',
            dataFlow: 'useCartState, useCartActions',
            children: [
              { name: 'CategoryList', dataFlow: 'Groups items by category' },
              { name: 'CartItem', dataFlow: 'Product row with actions' },
              { name: 'CartOptimization', dataFlow: 'Calculates optimal prices' },
            ]
          },
          {
            name: 'AI',
            description: 'AI Chat Interface',
            dataFlow: 'Voice + Text → API → Response',
            children: [
              { name: 'MessageItem', dataFlow: 'Renders AI/User messages' },
              { name: 'AIDataResponseManager', dataFlow: 'Handles data visualization' },
              { name: 'VoiceRecorder', dataFlow: 'Audio recording + levels' },
            ]
          },
          {
            name: 'History',
            description: 'Purchase history',
            dataFlow: 'Fetches from /api/v1/history',
            children: [
              { name: 'HistoryPage', dataFlow: 'Lists all purchases' },
              { name: 'HistoryList', dataFlow: 'Single purchase details' },
            ]
          },
          {
            name: 'Stats',
            description: 'Analytics dashboard',
            dataFlow: 'Aggregates history data',
            children: [
              { name: 'ExpenseOverview', dataFlow: 'Charts + summaries' },
              { name: 'StatsDashboard', dataFlow: 'Recharts visualization' },
            ]
          },
        ]
      }
    ]
  }
];

// Data flow connections
const dataFlowSteps = [
  { id: 1, from: 'User', to: 'React Frontend', type: 'input', label: 'Text / Voice / Barcode / Image' },
  { id: 2, from: 'React Frontend', to: 'Axios', type: 'process', label: 'HTTP Request' },
  { id: 3, from: 'Axios', to: 'Express Backend', type: 'api', label: 'REST API' },
  { id: 4, from: 'Express Backend', to: 'MongoDB', type: 'database', label: 'Query/Store' },
  { id: 5, from: 'Express Backend', to: 'OpenAI GPT-4', type: 'ai', label: 'AI Processing' },
  { id: 6, from: 'Express Backend', to: 'Whisper', type: 'ai', label: 'Speech-to-Text' },
  { id: 7, from: 'Express Backend', to: 'ElevenLabs', type: 'ai', label: 'Text-to-Speech' },
  { id: 8, from: 'Express Backend', to: 'Google Vision', type: 'ai', label: 'OCR / Image Analysis' },
  { id: 9, from: 'Express Backend', to: 'React Frontend', type: 'response', label: 'JSON Response' },
  { id: 10, from: 'React Frontend', to: 'User', type: 'output', label: 'UI Update / Audio' },
];

// Technology stack
const techStack = [
  { category: 'Frontend', items: [
    { name: 'React 18', icon: '⚛️', color: '#61dafb' },
    { name: 'React Router v6', icon: '🛤️', color: '#ca4245' },
    { name: 'Axios', icon: '📡', color: '#5a29e4' },
    { name: 'Ant Design', icon: '🐜', color: '#1890ff' },
    { name: 'Framer Motion', icon: '🎬', color: '#ff0055' },
    { name: 'Chart.js', icon: '📊', color: '#ff6384' },
    { name: '@zxing', icon: '📷', color: '#4caf50' },
  ]},
  { category: 'Backend', items: [
    { name: 'Node.js', icon: '💚', color: '#68a063' },
    { name: 'Express.js', icon: '🚂', color: '#000000' },
    { name: 'MongoDB', icon: '🍃', color: '#4db33d' },
    { name: 'Mongoose', icon: '🦫', color: '#800000' },
    { name: 'Multer', icon: '📁', color: '#ff9800' },
  ]},
  { category: 'AI / APIs', items: [
    { name: 'OpenAI GPT-4', icon: '🤖', color: '#10a37f' },
    { name: 'Whisper', icon: '🎙️', color: '#10a37f' },
    { name: 'ElevenLabs', icon: '🔊', color: '#000000' },
    { name: 'Google Vision', icon: '👁️', color: '#4285f4' },
  ]},
];

// API Routes
const apiRoutes = [
  { path: '/api/v1/products', methods: ['GET', 'POST'], description: 'Product CRUD + search' },
  { path: '/api/v1/prices', methods: ['GET', 'POST', 'PATCH'], description: 'Price management' },
  { path: '/api/v1/carts', methods: ['GET', 'POST', 'PATCH', 'DELETE'], description: 'Cart operations' },
  { path: '/api/v1/cart-optimization', methods: ['GET', 'POST'], description: 'Price optimization' },
  { path: '/api/v1/ai', methods: ['POST'], description: 'AI responses (v1-v5)' },
  { path: '/api/v1/voice-assistant', methods: ['POST', 'GET'], description: 'Voice commands' },
  { path: '/api/v1/history', methods: ['GET', 'POST'], description: 'Purchase history' },
  { path: '/api/v1/supermarket', methods: ['GET'], description: 'Supermarket data' },
];

// Database Models
const dbModels = [
  { name: 'Product', fields: ['name', 'barcode', 'brand', 'weight', 'category'], color: '#4caf50' },
  { name: 'Price', fields: ['barcode', 'price', 'discount', 'supermarket'], color: '#2196f3' },
  { name: 'Cart', fields: ['products[]', 'userID', 'totalPrice', 'isActive'], color: '#ff9800' },
  { name: 'History', fields: ['products[]', 'date', 'supermarket', 'totalPrice'], color: '#9c27b0' },
  { name: 'Supermarket', fields: ['name', 'address', 'city', 'id'], color: '#f44336' },
];

// Collapsible Section Component
const CollapsibleSection = ({ title, icon, defaultOpen = false, children, badge }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      className="collapsible-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="section-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="section-title">
          <span className="section-icon">{icon}</span>
          <h2>{title}</h2>
          {badge && <span className="section-badge">{badge}</span>}
        </div>
        <motion.div
          className="chevron"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          ▼
        </motion.div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="section-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// File Tree Item Component
const FileTreeItem = ({ item, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(level < 2);
  const isFolder = item.type === 'folder';

  return (
    <div className={`tree-item ${item.highlight ? `highlight-${item.highlight}` : ''}`}>
      <motion.div
        className="tree-item-header"
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={() => isFolder && setIsOpen(!isOpen)}
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
      >
        {isFolder && <ChevronIcon isOpen={isOpen} />}
        {isFolder ? <FolderIcon isOpen={isOpen} /> : <FileIcon type={item.ext} />}
        <span className="item-name">{item.name}</span>
        {item.files && <span className="file-count">{item.files} files</span>}
        {item.description && <span className="item-description">{item.description}</span>}
      </motion.div>

      <AnimatePresence>
        {isFolder && isOpen && item.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {item.children.map((child, index) => (
              <FileTreeItem key={index} item={child} level={level + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Component Tree Item
const ComponentTreeItem = ({ item, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(level < 2);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className="component-tree-item">
      <motion.div
        className="component-header"
        style={{ marginLeft: `${level * 24}px` }}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
      >
        <div className="component-info">
          {hasChildren && <ChevronIcon isOpen={isOpen} />}
          <div className="component-name-wrapper">
            <span className="component-name">{item.name}</span>
            {item.description && <span className="component-desc">{item.description}</span>}
          </div>
        </div>
        {item.dataFlow && (
          <div className="data-flow-badge">
            <span className="flow-icon">↔</span>
            {item.dataFlow}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {hasChildren && isOpen && (
          <motion.div
            className="component-children"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {item.children.map((child, index) => (
              <ComponentTreeItem key={index} item={child} level={level + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Data Flow Diagram
const DataFlowDiagram = () => {
  return (
    <div className="data-flow-diagram">
      <div className="flow-container">
        {dataFlowSteps.map((step, index) => (
          <motion.div
            key={step.id}
            className={`flow-step flow-${step.type}`}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <div className="flow-nodes">
              <div className="flow-node from">{step.from}</div>
              <div className="flow-arrow">
                <motion.div
                  className="arrow-line"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.3 }}
                />
                <motion.div
                  className="arrow-head"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                >
                  →
                </motion.div>
              </div>
              <div className="flow-node to">{step.to}</div>
            </div>
            <div className="flow-label">{step.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Main Component
const AppArchitecture = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="app-architecture">
      {/* Hero Section */}
      <motion.div
        className="hero-section"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-background">
          <div className="grid-lines" />
          <div className="glow-orb orb-1" />
          <div className="glow-orb orb-2" />
          <div className="glow-orb orb-3" />
        </div>
        <h1 className="hero-title">
          <span className="title-line">Shopping List App</span>
          <span className="title-accent">Architecture</span>
        </h1>
        <p className="hero-subtitle">
          Full-Stack Application • AI-Powered • Voice-Enabled
        </p>
        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-number">198</span>
            <span className="stat-label">Components</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">91</span>
            <span className="stat-label">Controllers</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">11</span>
            <span className="stat-label">DB Models</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">16</span>
            <span className="stat-label">API Routes</span>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        {['overview', 'files', 'components', 'dataflow', 'api', 'database'].map((tab) => (
          <motion.button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Content Area */}
      <div className="content-area">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="tab-content"
            >
              <CollapsibleSection title="Technology Stack" icon="🛠️" defaultOpen={true}>
                <div className="tech-stack-grid">
                  {techStack.map((category, catIndex) => (
                    <motion.div
                      key={category.category}
                      className="tech-category"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: catIndex * 0.1 }}
                    >
                      <h3>{category.category}</h3>
                      <div className="tech-items">
                        {category.items.map((item, itemIndex) => (
                          <motion.div
                            key={item.name}
                            className="tech-item"
                            style={{ '--accent-color': item.color }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: catIndex * 0.1 + itemIndex * 0.05 }}
                          >
                            <span className="tech-icon">{item.icon}</span>
                            <span className="tech-name">{item.name}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="System Architecture" icon="🏗️" defaultOpen={true}>
                <div className="architecture-diagram">
                  <div className="arch-layer frontend-layer">
                    <div className="layer-label">Frontend (React)</div>
                    <div className="layer-boxes">
                      <div className="arch-box">Components</div>
                      <div className="arch-box">Hooks</div>
                      <div className="arch-box">Routing</div>
                    </div>
                  </div>
                  <div className="arch-connector">
                    <motion.div
                      className="connector-line"
                      initial={{ height: 0 }}
                      animate={{ height: '100%' }}
                      transition={{ duration: 0.5 }}
                    />
                    <span className="connector-label">Axios HTTP</span>
                  </div>
                  <div className="arch-layer backend-layer">
                    <div className="layer-label">Backend (Express)</div>
                    <div className="layer-boxes">
                      <div className="arch-box">Routes</div>
                      <div className="arch-box">Controllers</div>
                      <div className="arch-box">Models</div>
                    </div>
                  </div>
                  <div className="arch-connector">
                    <motion.div
                      className="connector-line"
                      initial={{ height: 0 }}
                      animate={{ height: '100%' }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    />
                  </div>
                  <div className="arch-layer external-layer">
                    <div className="layer-label">External Services</div>
                    <div className="layer-boxes external">
                      <div className="arch-box mongodb">MongoDB</div>
                      <div className="arch-box openai">OpenAI</div>
                      <div className="arch-box elevenlabs">ElevenLabs</div>
                      <div className="arch-box google">Google Cloud</div>
                    </div>
                  </div>
                </div>
              </CollapsibleSection>
            </motion.div>
          )}

          {activeTab === 'files' && (
            <motion.div
              key="files"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="tab-content"
            >
              <CollapsibleSection title="Project File Structure" icon="📁" defaultOpen={true} badge="289 files">
                <div className="file-tree">
                  <FileTreeItem item={fileTreeData} />
                </div>
              </CollapsibleSection>
            </motion.div>
          )}

          {activeTab === 'components' && (
            <motion.div
              key="components"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="tab-content"
            >
              <CollapsibleSection title="Component Hierarchy" icon="🧩" defaultOpen={true}>
                <div className="component-tree">
                  {componentHierarchy.map((item, index) => (
                    <ComponentTreeItem key={index} item={item} />
                  ))}
                </div>
              </CollapsibleSection>
            </motion.div>
          )}

          {activeTab === 'dataflow' && (
            <motion.div
              key="dataflow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="tab-content"
            >
              <CollapsibleSection title="Data Flow Diagram" icon="🔄" defaultOpen={true}>
                <DataFlowDiagram />
              </CollapsibleSection>

              <CollapsibleSection title="Voice Assistant Flow" icon="🎙️" defaultOpen={true}>
                <div className="voice-flow">
                  {[
                    { step: 1, label: 'User Speaks', icon: '🗣️' },
                    { step: 2, label: 'Record Audio', icon: '🎤' },
                    { step: 3, label: 'Whisper ASR', icon: '🔊' },
                    { step: 4, label: 'AI Manager', icon: '🤖' },
                    { step: 5, label: 'Execute Action', icon: '⚡' },
                    { step: 6, label: 'ElevenLabs TTS', icon: '🔈' },
                    { step: 7, label: 'User Hears', icon: '👂' },
                  ].map((item, index) => (
                    <motion.div
                      key={item.step}
                      className="voice-step"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="step-circle">
                        <span className="step-icon">{item.icon}</span>
                        <span className="step-number">{item.step}</span>
                      </div>
                      <span className="step-label">{item.label}</span>
                      {index < 6 && <div className="step-connector" />}
                    </motion.div>
                  ))}
                </div>
              </CollapsibleSection>
            </motion.div>
          )}

          {activeTab === 'api' && (
            <motion.div
              key="api"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="tab-content"
            >
              <CollapsibleSection title="API Endpoints" icon="🌐" defaultOpen={true} badge="16 groups">
                <div className="api-routes">
                  {apiRoutes.map((route, index) => (
                    <motion.div
                      key={route.path}
                      className="api-route"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="route-path">{route.path}</div>
                      <div className="route-methods">
                        {route.methods.map((method) => (
                          <span key={method} className={`method method-${method.toLowerCase()}`}>
                            {method}
                          </span>
                        ))}
                      </div>
                      <div className="route-description">{route.description}</div>
                    </motion.div>
                  ))}
                </div>
              </CollapsibleSection>
            </motion.div>
          )}

          {activeTab === 'database' && (
            <motion.div
              key="database"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="tab-content"
            >
              <CollapsibleSection title="Database Models" icon="🗄️" defaultOpen={true} badge="MongoDB">
                <div className="db-models">
                  {dbModels.map((model, index) => (
                    <motion.div
                      key={model.name}
                      className="db-model"
                      style={{ '--model-color': model.color }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                    >
                      <div className="model-header">
                        <span className="model-icon">📋</span>
                        <span className="model-name">{model.name}</span>
                      </div>
                      <div className="model-fields">
                        {model.fields.map((field) => (
                          <span key={field} className="field-tag">{field}</span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Data Relationships" icon="🔗" defaultOpen={true}>
                <div className="relationships-diagram">
                  <div className="rel-row">
                    <div className="rel-model">Product</div>
                    <div className="rel-arrow">1 ← N</div>
                    <div className="rel-model">Price</div>
                    <div className="rel-label">One product has many prices (per supermarket)</div>
                  </div>
                  <div className="rel-row">
                    <div className="rel-model">Cart</div>
                    <div className="rel-arrow">N → N</div>
                    <div className="rel-model">Product</div>
                    <div className="rel-label">Cart contains many products with quantities</div>
                  </div>
                  <div className="rel-row">
                    <div className="rel-model">History</div>
                    <div className="rel-arrow">N → 1</div>
                    <div className="rel-model">Supermarket</div>
                    <div className="rel-label">Each history entry belongs to one supermarket</div>
                  </div>
                  <div className="rel-row">
                    <div className="rel-model">Price</div>
                    <div className="rel-arrow">N → 1</div>
                    <div className="rel-model">Supermarket</div>
                    <div className="rel-label">Each price belongs to one supermarket</div>
                  </div>
                </div>
              </CollapsibleSection>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <motion.div
        className="arch-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <div className="footer-stats">
          <span>Built with React + Express + MongoDB + OpenAI + ElevenLabs</span>
        </div>
      </motion.div>
    </div>
  );
};

export default AppArchitecture;
