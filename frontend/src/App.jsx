import { useState, Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { contentService, dareService, truthService } from './services/api';
import './App.css';
import { dares as initialDares } from './data/dares';
import BackgroundOrbs from './components/BackgroundOrbs';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import CreateDareModal from './components/CreateDareModal';
import CreateTruthModal from './components/CreateTruthModal';
import CreateSelector from './components/CreateSelector';
import Footer from './components/Footer';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute'; // Import AdminRoute
import AdminLayout from './components/AdminLayout'; // Import AdminLayout

// Lazy Load Pages
const DareFeed = lazy(() => import('./pages/DareFeed'));
const Landing = lazy(() => import('./pages/Landing'));
const Explore = lazy(() => import('./pages/Explore'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Wallet = lazy(() => import('./pages/Wallet'));
const Profile = lazy(() => import('./pages/Profile'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Settings = lazy(() => import('./pages/Settings'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminDares = lazy(() => import('./pages/AdminDares'));
const AdminContent = lazy(() => import('./pages/AdminContent'));
const AdminFinance = lazy(() => import('./pages/AdminFinance'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));

// Loading Component
const Loading = () => (
  <div style={{
    height: '80vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    gap: '20px'
  }}>
    <div className="glass-card" style={{ padding: '30px', borderRadius: '50%' }}>
      <i className="ri-loader-4-line" style={{
        fontSize: '40px',
        color: 'var(--light-blue)',
        animation: 'spin 1s linear infinite'
      }}></i>
    </div>
    <style>{`
      @keyframes spin { 100% { transform: rotate(360deg); } }
    `}</style>
  </div>
);

function AppContent() {
  const { refreshUser, updateUser, user } = useAuth();
  const [allDares, setAllDares] = useState(initialDares);
  const [activeDareId, setActiveDareId] = useState(1);
  const [activeTab, setActiveTab] = useState('System');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeModalType, setActiveModalType] = useState(null); // 'dare' or 'truth'
  const [nextId, setNextId] = useState(6);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminPage = location.pathname.startsWith('/admin');
  const isPublicPage = ['/login', '/register', '/'].includes(location.pathname);
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  const [dares, setDares] = useState([]);
  const [truths, setTruths] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(false);

  const [searchParams] = useSearchParams();
  const dareIdParam = searchParams.get('id');

  // Helper to transform dare data
  const transformDare = (item) => ({
    id: item._id,
    type: item.type || (item.question ? 'truth' : 'dare'),
    title: item.type === 'truth' ? 'Truth Challenge' : item.title,
    subtitle: item.type === 'truth' ? item.category : item.category,
    fullTitle: item.type === 'truth' ? item.question : item.title,
    coverImage: item.type === 'truth'
      ? 'https://images.unsplash.com/photo-1555861496-0666c8981751?auto=format&fit=crop&q=80&w=1000'
      : 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1000',
    avatar: item.creator?.avatar || 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
    user: item.creator?.username || 'Unknown',
    tags: [item.category, item.difficulty || 'Medium'],
    timeLimit: item.timeframe || '24h',
    stake: item.reward || 0,
    reward: item.reward || 0,
    conditions: item.description || item.question,
    participants: item.participants || [],
    isSystem: item.creator?.role === 'admin'
  });

  // Fetch feed/system dares
  useEffect(() => {
    setLoadingFeed(true);

    const fetchDares = activeTab === 'System'
      ? dareService.getAllDares({ type: 'system' })
      : dareService.getAllDares({ type: 'player' });

    const fetchTruths = activeTab === 'System'
      ? truthService.getAllTruths({ type: 'system' })
      : truthService.getAllTruths({ type: 'player' });

    Promise.all([fetchDares, fetchTruths])
      .then(([daresData, truthsData]) => {
        const transformedDares = daresData.map(transformDare);
        // Transform Truths to match feed structure
        const transformedTruths = truthsData.map(t => ({
          id: t._id,
          type: 'truth',
          title: 'Truth Challenge',
          subtitle: t.category,
          fullTitle: t.question,
          coverImage: 'https://images.unsplash.com/photo-1555861496-0666c8981751?auto=format&fit=crop&q=80&w=1000',
          avatar: t.creator?.avatar || 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
          user: t.creator?.username || 'Unknown',
          tags: [t.category, t.difficulty],
          timeLimit: '24h',
          stake: 0,
          reward: 0,
          conditions: t.question,
          isSystem: t.creator?.role === 'admin'
        }));

        setDares(transformedDares);
        setTruths(transformedTruths);

        // Handle Deep Link logic (Simplified for split view)
        if (dareIdParam) {
          const target = [...transformedDares, ...transformedTruths].find(i => i.id === dareIdParam);
          if (target) setActiveDareId(target.id);
        }
      })
      .catch(err => console.error("Failed to load feed:", err))
      .finally(() => setLoadingFeed(false));
  }, [activeTab]);

  // Handle Deep Link / Notification Click
  useEffect(() => {
    if (dareIdParam) {
      dareService.getById(dareIdParam).then(dare => {
        if (dare) {
          const item = transformDare(dare);

          if (item.type === 'truth') {
            setTruths(prev => {
              if (prev.find(p => p.id === item.id)) return prev;
              return [item, ...prev];
            });
          } else {
            setDares(prev => {
              if (prev.find(p => p.id === item.id)) return prev;
              return [item, ...prev];
            });
          }

          setActiveDareId(item.id);
        }
      }).catch(err => console.error("Failed to load targeted dare", err));
    }
  }, [dareIdParam]);

  // Function to refresh the feed
  const refreshFeed = () => {
    setLoadingFeed(true);

    // logic duplicated from useEffect - ideal refactor would be to extract fetch logic but for now invalidating state works
    // effectively we just re-run the effect dependency if we can, or just copy the logic.
    // Let's copy the logic to be safe and explicit.

    const fetchDares = activeTab === 'System'
      ? dareService.getAllDares({ type: 'system' })
      : dareService.getAllDares({ type: 'player' });

    const fetchTruths = truthService.getAllTruths();

    Promise.all([fetchDares, fetchTruths])
      .then(([daresData, truthsData]) => {
        const transformedDares = daresData.map(transformDare);
        const transformedTruths = truthsData.map(t => ({
          id: t._id,
          type: 'truth',
          title: 'Truth Challenge',
          subtitle: t.category,
          fullTitle: t.question,
          coverImage: 'https://images.unsplash.com/photo-1555861496-0666c8981751?auto=format&fit=crop&q=80&w=1000',
          avatar: t.creator?.avatar || 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
          user: t.creator?.username || 'Unknown',
          tags: [t.category, t.difficulty],
          timeLimit: '24h',
          stake: 0,
          reward: 0,
          conditions: t.question
        }));

        setDares(transformedDares);
        setTruths(transformedTruths);
      })
      .catch(err => console.error("Failed to load feed:", err))
      .finally(() => setLoadingFeed(false));
  }

  const handleCreateDare = async (newDareData, targetUser = null) => {
    // Check balance before proceeding
    const cost = parseInt(newDareData.reward, 10);
    if (!cost || isNaN(cost)) {
      alert("Please enter a valid stake amount.");
      return;
    }
    if (user && user.walletBalance < cost) {
      alert("Insufficient balance!");
      return;
    }

    try {
      const darePayload = {
        title: newDareData.title,
        description: newDareData.conditions || newDareData.title,
        reward: cost,
        timeframe: `${newDareData.timeLimit}m`,
        category: newDareData.category,
        targetUser: targetUser // Pass the target username
      };

      console.log("Creating dare for target:", targetUser);
      // targetUser handle needed if ID lookup existed

      // Optimistic Balance Update
      if (user) {
        updateUser({ walletBalance: user.walletBalance - cost });
      }

      await dareService.createDare(darePayload);

      // Refresh feed
      refreshFeed();
      // Confirm Balance with Backend Source of Truth
      await refreshUser();

      setActiveTab('Player');
      setShowCreateModal(false);
      setActiveModalType(null);
      navigate('/explore');

    } catch (error) {
      console.error("Failed to create dare:", error);
      alert(error.response?.data?.message || "Failed to create dare. Please try again.");
      // Revert optimistic update if failed
      if (user) await refreshUser();
    }
  };

  return (
    <>
      <BackgroundOrbs />

      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Admin Routes - OUTSIDE CONTAINER */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="dares" element={<AdminDares />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="finance" element={<AdminFinance />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>

          {/* Public Routes - OUTSIDE CONTAINER */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User Routes - INSIDE CONTAINER */}
          <Route path="*" element={
            <div className="container">
              <Header />
              <Routes>
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/explore" element={<ProtectedRoute><Explore dares={dares} truths={truths} activeTab={activeTab} setActiveTab={setActiveTab} /></ProtectedRoute>} />
                <Route path="/feed" element={<DareFeed />} />
                <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              </Routes>
            </div>
          } />
        </Routes>
      </Suspense>

      {!isAuthPage && !isAdminPage && <Footer />}

      {!isPublicPage && !isAdminPage && <BottomNav onOpenCreate={() => setShowCreateModal(true)} />}

      {showCreateModal && !activeModalType && (
        <CreateSelector
          onClose={() => setShowCreateModal(false)}
          onSelectDare={() => setActiveModalType('dare')}
          onSelectTruth={() => setActiveModalType('truth')}
        />
      )}

      {showCreateModal && activeModalType === 'dare' && (
        <CreateDareModal
          isOpen={true}
          onClose={() => { setShowCreateModal(false); setActiveModalType(null); }}
          onSave={handleCreateDare}
        />
      )}

      {showCreateModal && activeModalType === 'truth' && (
        <CreateTruthModal
          onClose={() => { setShowCreateModal(false); setActiveModalType(null); }}
        />
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
